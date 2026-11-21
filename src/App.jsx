import React, { useEffect, useState } from 'react';
import {
  Car,
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  Share2,
  User,
  Wallet,
  ShieldCheck,
  Check,
  X,
  Send,
  Layers,
  Bell,
  AlertTriangle,
  Star,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Headphones,
  Sun,
  Moon
} from 'lucide-react';
import MapView from './components/MapView';
import { supabase } from './lib/supabase';

const FARE_OPTIONS = [
  { id: 'Economy', label: 'Economy', seats: '4 seats', fare: 320, eta: '3 min', estTime: '10 min' },
  { id: 'Business', label: 'Business', seats: '4 seats', fare: 520, eta: '2 min', estTime: '9 min' }
];

const PAYMENT_METHODS = ['Cash', 'JazzCash', 'Easypaisa'];
const DEMO_PASSENGER_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_DRIVER_ID = '00000000-0000-0000-0000-000000000002';

// Night Mode (Dark) vs Sunlight Mode (High-Contrast Daylight)
const PALETTES = {
  night: {
    bg: '#090d16',
    bar: '#05080f',
    card: '#131a29',
    cardAlt: '#1b2438',
    border: '#243049',
    emerald: '#16a34a',
    emeraldDark: '#065f46',
    emeraldGlow: '#22c55e',
    gold: '#f59e0b',
    accentText: '#fde047',
    text: '#f8fafc',
    muted: '#94a3b8',
    inputBg: '#090d16'
  },
  sunlight: {
    bg: '#f1f5f9',
    bar: '#ffffff',
    card: '#ffffff',
    cardAlt: '#e2e8f0',
    border: '#94a3b8',
    emerald: '#15803d',
    emeraldDark: '#14532d',
    emeraldGlow: '#15803d',
    gold: '#d97706',
    accentText: '#b45309',
    text: '#0f172a',
    muted: '#334155',
    inputBg: '#f8fafc'
  }
};

export default function App() {
  const [launchStage, setLaunchStage] = useState('splash'); // 'splash' | 'promo' | 'app'
  const [sunlightMode, setSunlightMode] = useState(false); // false = Night Dark Mode, true = Sunlight Mode
  const [portal, setPortal] = useState('driver'); // 'driver' | 'passenger' | 'admin'
  const [driverTab, setDriverTab] = useState('trips'); // 'trips' | 'pool' | 'money' | 'chats' | 'profile'
  const [passengerScreen, setPassengerScreen] = useState('booking'); // 'booking' | 'active_ride'

  const THEME = sunlightMode ? PALETTES.sunlight : PALETTES.night;

  // Driver states
  const [driverOnline, setDriverOnline] = useState(false);
  const [driverAuth, setDriverAuth] = useState({
    name: 'Muhammad Usman',
    phone: '0321-7654321',
    vehicle: 'Suzuki Alto',
    plate: 'BRG739',
    rating: 4.92,
    priority: 68
  });

  // Passenger states
  const [pickup, setPickup] = useState('Clifton, Karachi');
  const [dropoff, setDropoff] = useState('Dolmen Mall, Clifton');
  const [selectedType, setSelectedType] = useState('Economy');
  const [paymentMethod, setPaymentMethod] = useState('JazzCash');

  // Admin & Subscription states
  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [subMethod, setSubMethod] = useState('JazzCash');
  const [txId, setTxId] = useState('');
  const [subscriptions, setSubscriptions] = useState([]);

  // Rides & UI states
  const [currentRide, setCurrentRide] = useState(null);
  const [ridesHistory, setRidesHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const activeFareObj = FARE_OPTIONS.find((f) => f.id === selectedType) || FARE_OPTIONS[0];
  const platformFee = (activeFareObj.fare * 0.02).toFixed(2);

  useEffect(() => {
    loadAllData();
    const timer = setTimeout(() => {
      setLaunchStage((prev) => (prev === 'splash' ? 'promo' : prev));
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  async function loadAllData() {
    const { data: ridesData } = await supabase
      .from('rides')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25);

    if (ridesData) setRidesHistory(ridesData);

    const { data: subsData } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25);

    if (subsData) setSubscriptions(subsData);
  }

  async function handleRequestRide(e) {
    e.preventDefault();
    setLoading(true);
    setNotice('');

    const { data, error } = await supabase
      .from('rides')
      .insert([
        {
          passenger_id: DEMO_PASSENGER_ID,
          pickup_address: pickup,
          dropoff_address: dropoff,
          fare: activeFareObj.fare,
          ride_type: activeFareObj.id,
          payment_method: paymentMethod,
          driver_name: driverAuth.name,
          driver_rating: driverAuth.rating,
          vehicle_info: `${driverAuth.vehicle} • ${driverAuth.plate}`,
          eta_minutes: 2,
          status: 'searching'
        }
      ])
      .select()
      .single();

    setLoading(false);

    if (error) {
      setNotice(`Ride request error: ${error.message}`);
      return;
    }

    setCurrentRide(data);
    setPassengerScreen('active_ride');
    loadAllData();
  }

  async function handleUpdateRideStatus(rideId, nextStatus) {
    const { error } = await supabase
      .from('rides')
      .update({
        status: nextStatus,
        driver_id: DEMO_DRIVER_ID,
        driver_name: driverAuth.name,
        vehicle_info: `${driverAuth.vehicle} • ${driverAuth.plate}`
      })
      .eq('id', rideId);

    if (error) {
      setNotice(`Update error: ${error.message}`);
      return;
    }

    if (currentRide && currentRide.id === rideId) {
      if (nextStatus === 'cancelled' || nextStatus === 'completed') {
        setCurrentRide(null);
        setPassengerScreen('booking');
      } else {
        setCurrentRide({ ...currentRide, status: nextStatus });
      }
    }

    setNotice(`Ride marked as ${nextStatus}.`);
    loadAllData();
  }

  async function handleSubmitSubscription(e) {
    e.preventDefault();
    if (!txId.trim()) {
      setNotice('Please enter JazzCash or Easypaisa Transaction ID.');
      return;
    }

    setLoading(true);
    setNotice('');

    const { error } = await supabase.from('subscriptions').insert([
      {
        driver_id: DEMO_DRIVER_ID,
        amount: 3000,
        payment_method: subMethod,
        transaction_id: txId.trim(),
        status: 'pending'
      }
    ]);

    setLoading(false);

    if (error) {
      setNotice(`Subscription error: ${error.message}`);
      return;
    }

    setTxId('');
    setNotice('PKR 3,000 subscription submitted! Waiting for Super Admin approval.');
    loadAllData();
  }

  async function handleSubscriptionAction(subId, status) {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('id', subId);

    if (error) {
      setNotice(`Action error: ${error.message}`);
      return;
    }

    setNotice(`Subscription ${status}.`);
    loadAllData();
  }

  function handleShareRide() {
    const text = `EasyDrive-Pakistan Live Ride: ${pickup} to ${dropoff} (Rs. ${activeFareObj.fare}).`;
    if (navigator.share) {
      navigator.share({ title: 'EasyDrive-Pakistan', text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setNotice('Ride details copied!');
    }
  }

  const completedRides = ridesHistory.filter((r) => r.status === 'completed');
  const todayEarnings = completedRides.reduce((sum, r) => sum + Number(r.fare || 0), 0);
  const totalCommission = ridesHistory
    .reduce((sum, r) => sum + Number(r.fare || 0) * 0.02, 0)
    .toFixed(2);
  const approvedSubsCount = subscriptions.filter((s) => s.status === 'approved').length;

  // ==================== STAGE 1: BOLD BRANDED SPLASH ====================
  if (launchStage === 'splash') {
    return (
      <div
        onClick={() => setLaunchStage('promo')}
        style={{
          maxWidth: '430px',
          minHeight: '100vh',
          margin: '0 auto',
          background: 'linear-gradient(160deg, #065f46 0%, #16a34a 55%, #064e3b 100%)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          cursor: 'pointer'
        }}
      >
        <div
          style={{
            fontSize: '34px',
            fontWeight: 900,
            fontStyle: 'italic',
            letterSpacing: '-1px',
            textAlign: 'center',
            lineHeight: 1.05,
            textShadow: '0 6px 20px rgba(0,0,0,0.28)'
          }}
        >
          EASYDRIVE
          <span style={{ display: 'block', fontSize: '20px', color: '#fde047', letterSpacing: '2px', marginTop: '4px' }}>
            PAKISTAN PRO
          </span>
        </div>
      </div>
    );
  }

  // ==================== STAGE 2: PROMO & PORTAL LAUNCHER ====================
  if (launchStage === 'promo') {
    return (
      <div
        style={{
          maxWidth: '430px',
          minHeight: '100vh',
          margin: '0 auto',
          background: 'linear-gradient(180deg, #16a34a 0%, #065f46 65%, #090d16 100%)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '28px 20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center', marginTop: '44px' }}>
          <div style={{ fontSize: '15px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '1px', color: '#fde047' }}>
            EASYDRIVE-PAKISTAN
          </div>
          <h1
            style={{
              margin: '14px 0 0',
              fontSize: '32px',
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: '-0.4px'
            }}
          >
            AB POORA CASH APKA
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: '14px', color: '#dcfce7' }}>
            PKR 3,000 Monthly Driver Plan • Zero Hidden Cuts • Instant JazzCash & Easypaisa
          </p>
        </div>

        <div
          style={{
            background: 'rgba(9, 13, 22, 0.78)',
            border: '1px solid rgba(253, 224, 71, 0.4)',
            borderRadius: '20px',
            padding: '18px',
            backdropFilter: 'blur(8px)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#94a3b8' }}>Driver Earnings Policy</div>
              <div style={{ fontSize: '19px', fontWeight: 900, color: '#fde047' }}>Ab Poora Cash Apka</div>
            </div>
            <div
              style={{
                background: '#16a34a',
                padding: '8px 12px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: 800
              }}
            >
              2% Platform Fee
            </div>
          </div>

          <button
            onClick={() => {
              setPortal('driver');
              setLaunchStage('app');
            }}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: '#f59e0b',
              color: '#090d16',
              fontSize: '16px',
              fontWeight: 900,
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            Open Driver Pro App →
          </button>

          <button
            onClick={() => {
              setPortal('passenger');
              setLaunchStage('app');
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.25)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            Book a Ride as Passenger
          </button>
        </div>
      </div>
    );
  }

  // ==================== STAGE 3: MAIN MULTI-PORTAL APP (NIGHT & SUNLIGHT READY) ====================
  return (
    <div
      style={{
        maxWidth: '430px',
        minHeight: '100vh',
        margin: '0 auto',
        background: THEME.bg,
        color: THEME.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        paddingBottom: '78px'
      }}
    >
      {/* Top Portal Switcher + Night / Sunlight Toggle */}
      <div
        style={{
          background: THEME.bar,
          padding: '8px 10px',
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          borderBottom: `1px solid ${THEME.border}`
        }}
      >
        {[
          { id: 'driver', label: 'Driver Pro', Icon: Car },
          { id: 'passenger', label: 'Passenger', Icon: User },
          { id: 'admin', label: 'Admin', Icon: ShieldCheck }
        ].map(({ id, label, Icon }) => {
          const active = portal === id;
          return (
            <button
              key={id}
              onClick={() => setPortal(id)}
              style={{
                flex: 1,
                padding: '7px 6px',
                borderRadius: '9px',
                border: active ? 'none' : `1px solid ${THEME.border}`,
                background: active ? THEME.emerald : THEME.card,
                color: active ? '#ffffff' : THEME.text,
                fontSize: '12px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <Icon size={14} /> {label}
            </button>
          );
        })}

        <button
          onClick={() => setSunlightMode((prev) => !prev)}
          title={sunlightMode ? 'Switch to Night Mode' : 'Switch to Sunlight Mode'}
          style={{
            padding: '7px 9px',
            borderRadius: '9px',
            border: `1px solid ${sunlightMode ? THEME.gold : THEME.border}`,
            background: sunlightMode ? '#fef3c7' : THEME.cardAlt,
            color: sunlightMode ? '#92400e' : THEME.accentText,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          {sunlightMode ? <Moon size={14} /> : <Sun size={14} />}
          <span>{sunlightMode ? 'Night' : 'Sun'}</span>
        </button>
      </div>

      {notice && (
        <div
          style={{
            margin: '10px 12px 0',
            padding: '10px 12px',
            borderRadius: '10px',
            background: sunlightMode ? '#dcfce7' : '#064e3b',
            border: `1px solid ${THEME.emerald}`,
            color: sunlightMode ? '#14532d' : '#dcfce7',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{notice}</span>
          <button
            onClick={() => setNotice('')}
            style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 900, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* ==================== 1. DRIVER PRO PORTAL ==================== */}
      {portal === 'driver' && (
        <>
          {/* TAB 1: TRIPS */}
          {driverTab === 'trips' && (
            <div style={{ padding: '10px 12px' }}>
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: `1.5px solid ${THEME.border}` }}>
                <MapView height="215px" />
              </div>

              {/* Minimum Fare Guarantee */}
              <div
                style={{
                  marginTop: '10px',
                  background: THEME.card,
                  border: `1.5px solid ${THEME.border}`,
                  borderRadius: '14px',
                  padding: '10px 12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span
                  style={{
                    background: THEME.emerald,
                    color: '#ffffff',
                    fontSize: '12px',
                    fontWeight: 800,
                    padding: '5px 10px',
                    borderRadius: '999px'
                  }}
                >
                  from Rs 320.00
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800 }}>Minimum fare guarantee</span>
                <ChevronRight size={16} color={THEME.muted} />
              </div>

              {/* Priority & Today Trips Summary */}
              <div
                style={{
                  marginTop: '10px',
                  background: THEME.card,
                  border: `1.5px solid ${THEME.border}`,
                  borderRadius: '16px',
                  padding: '14px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${THEME.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: sunlightMode ? '#fef3c7' : 'rgba(245, 158, 11, 0.16)',
                        color: THEME.gold,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Sparkles size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: THEME.muted, fontWeight: 700 }}>Priority</div>
                      <div style={{ fontSize: '18px', fontWeight: 900 }}>+{driverAuth.priority}</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '10px',
                        background: sunlightMode ? '#dcfce7' : 'rgba(22, 163, 74, 0.18)',
                        color: THEME.emerald,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Wallet size={18} />
                    </div>
                    <div>
                      <div style={{ fontSize: '11px', color: THEME.muted, fontWeight: 700 }}>{completedRides.length} trips</div>
                      <div style={{ fontSize: '18px', fontWeight: 900 }}>Rs {todayEarnings.toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                {/* Cash Policy Banner Card */}
                <div
                  style={{
                    marginTop: '12px',
                    background: THEME.cardAlt,
                    borderRadius: '12px',
                    padding: '11px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: `1px solid ${THEME.border}`
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 900 }}>Ab Poora Cash Apka</div>
                    <div style={{ fontSize: '11px', color: THEME.muted, fontWeight: 600 }}>PKR 3,000 Monthly Plan • 2% Fee</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: THEME.accentText }}>100% Direct</div>
                </div>

                {/* Peak Hours Bonus */}
                <div
                  style={{
                    marginTop: '8px',
                    background: THEME.cardAlt,
                    borderRadius: '12px',
                    padding: '11px 12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    border: `1px solid ${THEME.border}`
                  }}
                >
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>20:40 — 21:59</div>
                    <div style={{ fontSize: '11px', color: THEME.muted, fontWeight: 600 }}>Karachi Peak Bonuses</div>
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: THEME.emerald }}>×1.8–1.9</div>
                </div>

                {/* Go Online / Offline Action Button */}
                <button
                  onClick={() => {
                    const next = !driverOnline;
                    setDriverOnline(next);
                    setNotice(next ? 'You are now ONLINE for EasyDrive rides!' : 'You are now Offline.');
                  }}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '10px',
                    borderRadius: '999px',
                    border: `1.5px solid ${THEME.border}`,
                    background: driverOnline ? THEME.emerald : THEME.gold,
                    color: driverOnline ? '#ffffff' : '#090d16',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <span
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      background: '#ffffff',
                      color: '#090d16',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <ArrowRight size={18} />
                  </span>
                  <div style={{ textAlign: 'center', flex: 1, marginRight: '38px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800 }}>
                      {driverOnline ? 'Online • Searching Trips' : 'Offline'}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 900 }}>
                      {driverOnline ? 'Go offline' : 'Go online'}
                    </div>
                  </div>
                </button>
              </div>

              {/* Live Incoming Ride Requests */}
              <div
                style={{
                  marginTop: '10px',
                  background: THEME.card,
                  border: `1.5px solid ${THEME.border}`,
                  borderRadius: '16px',
                  padding: '12px'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 900, marginBottom: '8px' }}>Live Ride Requests</div>
                {ridesHistory.filter((r) => r.status === 'searching' || r.status === 'accepted').length === 0 ? (
                  <div style={{ fontSize: '12px', color: THEME.muted }}>
                    No active requests right now. Switch to Passenger tab to test booking a ride.
                  </div>
                ) : (
                  ridesHistory
                    .filter((r) => r.status === 'searching' || r.status === 'accepted')
                    .map((r) => (
                      <div
                        key={r.id}
                        style={{
                          background: THEME.cardAlt,
                          borderRadius: '12px',
                          padding: '10px',
                          marginBottom: '8px',
                          fontSize: '12px',
                          border: `1px solid ${THEME.border}`
                        }}
                      >
                        <div style={{ fontWeight: 800 }}>
                          {r.pickup_address} → {r.dropoff_address}
                        </div>
                        <div style={{ color: THEME.emerald, marginTop: '4px', fontWeight: 800 }}>
                          Fare: Rs. {r.fare} • 2% Fee: Rs. {(Number(r.fare) * 0.02).toFixed(2)} • {r.status}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          {r.status === 'searching' && (
                            <button
                              onClick={() => handleUpdateRideStatus(r.id, 'accepted')}
                              style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: '8px',
                                border: 'none',
                                background: THEME.emerald,
                                color: '#fff',
                                fontWeight: 800
                              }}
                            >
                              Accept Trip
                            </button>
                          )}
                          {r.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateRideStatus(r.id, 'completed')}
                              style={{
                                flex: 1,
                                padding: '8px',
                                borderRadius: '8px',
                                border: 'none',
                                background: THEME.gold,
                                color: '#090d16',
                                fontWeight: 900
                              }}
                            >
                              Complete Trip
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}

          {/* TAB 2: POOL */}
          {driverTab === 'pool' && (
            <div style={{ padding: '14px 12px' }}>
              <h2 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 900 }}>EasyDrive Pool</h2>
              <div style={{ background: THEME.card, borderRadius: '16px', padding: '14px', border: `1.5px solid ${THEME.border}` }}>
                <div style={{ fontSize: '14px', fontWeight: 900, color: THEME.emerald }}>
                  Shared Route Bonus Active • Ab Poora Cash Apka
                </div>
                <p style={{ fontSize: '12px', color: THEME.muted, margin: '6px 0 12px', fontWeight: 600 }}>
                  Pick up multiple passengers heading toward Clifton, Saddar, or Shahrah-e-Faisal and earn +25% extra per trip.
                </p>
                <div style={{ background: THEME.cardAlt, padding: '10px', borderRadius: '10px', fontSize: '12px', border: `1px solid ${THEME.border}` }}>
                  <strong>Active Corridor:</strong> Clifton Block 4 → Dolmen Mall → Teen Talwar
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MONEY */}
          {driverTab === 'money' && (
            <div style={{ padding: '14px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900 }}>Money</h2>
                <button
                  onClick={() => setDriverTab('chats')}
                  style={{
                    background: THEME.emerald,
                    border: 'none',
                    color: '#fff',
                    borderRadius: '999px',
                    padding: '6px 12px',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Headphones size={14} /> Support
                </button>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <div style={{ fontSize: '32px', fontWeight: 900 }}>Rs {todayEarnings.toLocaleString()}</div>
                  <div style={{ fontSize: '12px', color: THEME.muted, fontWeight: 700 }}>Today • Ab Poora Cash Apka</div>
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'flex-end', height: '48px' }}>
                  {[16, 28, 38, 42, 18].map((h, i) => (
                    <div
                      key={i}
                      style={{
                        width: '14px',
                        height: `${h}px`,
                        borderRadius: '4px',
                        background: i === 4 ? THEME.emerald : THEME.cardAlt,
                        border: `1px solid ${THEME.border}`
                      }}
                    />
                  ))}
                </div>
              </div>

              <div
                style={{
                  marginTop: '14px',
                  background: THEME.card,
                  borderRadius: '14px',
                  padding: '12px',
                  border: `1.5px solid ${THEME.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 800 }}>Your average earnings</div>
                  <div style={{ fontSize: '11px', color: THEME.muted, fontWeight: 600 }}>Today in real time</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: THEME.emerald }}>Rs 58.50</div>
                  <div style={{ fontSize: '11px', color: THEME.muted, fontWeight: 600 }}>per km</div>
                </div>
              </div>

              {/* Balance & Partner Card */}
              <div
                style={{
                  marginTop: '10px',
                  background: THEME.card,
                  borderRadius: '14px',
                  padding: '14px',
                  border: `1.5px solid ${THEME.border}`
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 900 }}>
                  <span>Wallet Balance</span>
                  <span style={{ color: THEME.accentText }}>Rs 1,450.00</span>
                </div>
                <div style={{ marginTop: '12px', fontSize: '11px', color: THEME.muted, fontWeight: 700 }}>Service partner</div>
                <div style={{ fontSize: '13px', fontWeight: 800, marginTop: '2px' }}>EasyDrive-Pakistan Fleet Partner</div>
              </div>

              {/* PKR 3,000 Monthly Subscription Payment */}
              <form
                onSubmit={handleSubmitSubscription}
                style={{
                  marginTop: '12px',
                  background: THEME.card,
                  borderRadius: '14px',
                  padding: '14px',
                  border: `1.5px solid ${THEME.emerald}`
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 900, color: THEME.emerald }}>
                  Monthly Subscription: PKR 3,000
                </div>
                <div style={{ fontSize: '11px', color: THEME.muted, margin: '4px 0 10px', fontWeight: 600 }}>
                  Pay via JazzCash or Easypaisa & submit Transaction ID (TID):
                </div>

                <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                  {['JazzCash', 'Easypaisa'].map((m) => (
                    <button
                      type="button"
                      key={m}
                      onClick={() => setSubMethod(m)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        borderRadius: '9px',
                        border: subMethod === m ? `2px solid ${THEME.emerald}` : `1px solid ${THEME.border}`,
                        background: subMethod === m ? (sunlightMode ? '#dcfce7' : '#064e3b') : THEME.cardAlt,
                        color: THEME.text,
                        fontWeight: 800,
                        fontSize: '12px'
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                <input
                  value={txId}
                  onChange={(e) => setTxId(e.target.value)}
                  placeholder="Enter JazzCash / Easypaisa TID"
                  style={{
                    width: '100%',
                    padding: '9px',
                    borderRadius: '9px',
                    border: `1.5px solid ${THEME.border}`,
                    background: THEME.inputBg,
                    color: THEME.text,
                    marginBottom: '10px',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '10px',
                    border: 'none',
                    background: THEME.emerald,
                    color: '#fff',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  Submit PKR 3,000 Receipt
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: CHATS */}
          {driverTab === 'chats' && (
            <div style={{ padding: '14px 12px' }}>
              <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 900 }}>Messages</h2>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                {[
                  { title: 'Ab Poora Cash Apka', tag: 'New', bg: sunlightMode ? '#dcfce7' : '#064e3b' },
                  { title: 'Apni trip choose karein', tag: 'New', bg: THEME.cardAlt },
                  { title: 'Raste mein kamai karein', tag: 'New', bg: sunlightMode ? '#fef3c7' : '#3f2e05' }
                ].map((c, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: c.bg,
                      borderRadius: '14px',
                      padding: '10px 8px',
                      border: `1.5px solid ${THEME.border}`,
                      minHeight: '96px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <span
                      style={{
                        alignSelf: 'flex-end',
                        background: THEME.gold,
                        color: '#090d16',
                        fontSize: '10px',
                        fontWeight: 900,
                        padding: '2px 6px',
                        borderRadius: '999px'
                      }}
                    >
                      {c.tag}
                    </span>
                    <div style={{ fontSize: '11px', fontWeight: 800, lineHeight: 1.25 }}>{c.title}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {[
                  { title: 'Support', sub: '24/7 Karachi Driver Helpdesk', badge: '1', color: THEME.emerald, Icon: Headphones },
                  { title: 'EasyDrive Pro Team', sub: 'Ab Poora Cash Apka — zero hidden cut', badge: '', color: '#7c3aed', Icon: Sparkles },
                  { title: 'Warnings', sub: 'Keep acceptance rate above 85%', badge: '', color: THEME.gold, Icon: AlertTriangle },
                  { title: 'Pro News', sub: 'Easypaisa & JazzCash instant payout update', badge: '', color: THEME.emerald, Icon: Bell }
                ].map((item, idx) => (
                  <div
                    key={idx}
                    onClick={() => setNotice(`Opened ${item.title}`)}
                    style={{
                      background: THEME.card,
                      borderRadius: '14px',
                      padding: '12px',
                      border: `1.5px solid ${THEME.border}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: item.color,
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <item.Icon size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800 }}>{item.title}</div>
                        <div style={{ fontSize: '12px', color: THEME.muted, fontWeight: 600 }}>{item.sub}</div>
                      </div>
                    </div>
                    {item.badge && (
                      <span
                        style={{
                          background: '#dc2626',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 7px',
                          borderRadius: '999px'
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE */}
          {driverTab === 'profile' && (
            <div style={{ padding: '14px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      background: THEME.emerald,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '18px'
                    }}
                  >
                    MU
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: 900 }}>{driverAuth.name}</div>
                </div>
                <button
                  onClick={() => setNotice('Invite link copied!')}
                  style={{
                    background: THEME.emerald,
                    border: 'none',
                    color: '#fff',
                    borderRadius: '999px',
                    padding: '7px 12px',
                    fontSize: '12px',
                    fontWeight: 800
                  }}
                >
                  + Invite a friend
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div style={{ background: THEME.card, borderRadius: '14px', padding: '12px', border: `1.5px solid ${THEME.border}` }}>
                  <div style={{ fontSize: '18px', fontWeight: 900 }}>+{driverAuth.priority}</div>
                  <div style={{ fontSize: '12px', color: THEME.muted, fontWeight: 700 }}>Priority</div>
                </div>
                <div style={{ background: THEME.card, borderRadius: '14px', padding: '12px', border: `1.5px solid ${THEME.border}` }}>
                  <div style={{ fontSize: '18px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    {driverAuth.rating} <Star size={16} fill={THEME.gold} color={THEME.gold} />
                  </div>
                  <div style={{ fontSize: '12px', color: THEME.muted, fontWeight: 700 }}>Rating</div>
                </div>
              </div>

              <div
                style={{
                  background: THEME.card,
                  borderRadius: '14px',
                  padding: '12px',
                  border: `1.5px solid ${THEME.border}`,
                  marginBottom: '14px',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${THEME.border}` }}>
                  <span style={{ color: THEME.muted, fontWeight: 700 }}>Partner</span>
                  <strong>EasyDrive-Pakistan Fleet</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${THEME.border}` }}>
                  <span style={{ color: THEME.muted, fontWeight: 700 }}>Service classes</span>
                  <strong>Economy & Business</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0' }}>
                  <span style={{ color: THEME.muted, fontWeight: 700 }}>Payment</span>
                  <strong>Cash, JazzCash & Easypaisa</strong>
                </div>
              </div>

              <div style={{ fontSize: '17px', fontWeight: 900, marginBottom: '8px' }}>My vehicles</div>
              <div
                style={{
                  background: THEME.card,
                  borderRadius: '16px',
                  padding: '14px',
                  border: `1.5px solid ${THEME.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 900 }}>{driverAuth.vehicle} • 1 vehicle</div>
                  <div
                    style={{
                      display: 'inline-block',
                      marginTop: '8px',
                      background: sunlightMode ? '#0f172a' : '#ffffff',
                      color: sunlightMode ? '#ffffff' : '#090d16',
                      fontWeight: 900,
                      fontSize: '13px',
                      padding: '4px 10px',
                      borderRadius: '6px'
                    }}
                  >
                    {driverAuth.plate}
                  </div>
                </div>
                <Car size={46} color={THEME.emerald} />
              </div>
            </div>
          )}

          {/* Bottom 5-Tab Driver Navigation Bar */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '430px',
              background: THEME.bar,
              borderTop: `1.5px solid ${THEME.border}`,
              display: 'flex',
              justifyContent: 'space-around',
              padding: '8px 0'
            }}
          >
            {[
              { id: 'trips', label: 'Trips', Icon: Send },
              { id: 'pool', label: 'Pool', Icon: Layers },
              { id: 'money', label: 'Money', Icon: Wallet },
              { id: 'chats', label: 'Chats', Icon: MessageCircle },
              { id: 'profile', label: 'Profile', Icon: User }
            ].map(({ id, label, Icon }) => {
              const active = driverTab === id;
              return (
                <button
                  key={id}
                  onClick={() => setDriverTab(id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: active ? THEME.emerald : THEME.muted,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '3px',
                    fontSize: '11px',
                    fontWeight: active ? 900 : 600,
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={18} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ==================== 2. PASSENGER PORTAL ==================== */}
      {portal === 'passenger' && (
        <div style={{ padding: '12px' }}>
          {passengerScreen === 'active_ride' && currentRide ? (
            <div>
              <div style={{ background: THEME.emerald, color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '10px' }}>
                <div style={{ fontSize: '17px', fontWeight: 900 }}>
                  {currentRide.status === 'searching' ? 'Finding Nearby Driver...' : 'Your Driver is on the Way'}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.95 }}>
                  Status: {currentRide.status} • Arriving in {currentRide.eta_minutes || 2} min
                </div>
              </div>

              <MapView height="190px" />

              <div
                style={{
                  background: THEME.card,
                  borderRadius: '14px',
                  padding: '12px',
                  marginTop: '10px',
                  border: `1.5px solid ${THEME.border}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: '15px' }}>{currentRide.driver_name}</div>
                  <div style={{ fontSize: '12px', color: THEME.emerald, fontWeight: 800 }}>
                    ★ {currentRide.driver_rating} • {currentRide.vehicle_info}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setNotice('Calling driver...')}
                    style={{ padding: '8px', borderRadius: '50%', border: `1px solid ${THEME.border}`, background: THEME.cardAlt, color: THEME.text }}
                  >
                    <Phone size={16} />
                  </button>
                  <button
                    onClick={handleShareRide}
                    style={{ padding: '8px', borderRadius: '50%', border: `1px solid ${THEME.border}`, background: THEME.cardAlt, color: THEME.text }}
                  >
                    <Share2 size={16} />
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button
                  onClick={() => handleUpdateRideStatus(currentRide.id, 'cancelled')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: '#dc2626',
                    color: '#fff',
                    fontWeight: 800
                  }}
                >
                  Cancel Ride
                </button>
                <button
                  onClick={() => handleUpdateRideStatus(currentRide.id, 'completed')}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '12px',
                    border: 'none',
                    background: THEME.emerald,
                    color: '#fff',
                    fontWeight: 800
                  }}
                >
                  Complete Ride
                </button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ background: THEME.card, borderRadius: '14px', padding: '10px', border: `1.5px solid ${THEME.border}`, marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MapPin size={16} color={THEME.emerald} />
                  <input
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Pickup Location"
                    style={{
                      flex: 1,
                      background: THEME.inputBg,
                      border: `1.5px solid ${THEME.border}`,
                      color: THEME.text,
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '13px'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation size={16} color="#dc2626" />
                  <input
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    placeholder="Destination"
                    style={{
                      flex: 1,
                      background: THEME.inputBg,
                      border: `1.5px solid ${THEME.border}`,
                      color: THEME.text,
                      borderRadius: '8px',
                      padding: '8px',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <MapView height="155px" />

              <form onSubmit={handleRequestRide} style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {FARE_OPTIONS.map((item) => {
                    const active = selectedType === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedType(item.id)}
                        style={{
                          background: active ? (sunlightMode ? '#dcfce7' : '#064e3b') : THEME.card,
                          border: active ? `2px solid ${THEME.emerald}` : `1.5px solid ${THEME.border}`,
                          borderRadius: '12px',
                          padding: '10px 12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '14px' }}>{item.label}</div>
                          <div style={{ fontSize: '11px', color: THEME.muted, fontWeight: 600 }}>{item.seats} • ETA {item.eta}</div>
                        </div>
                        <div style={{ fontWeight: 900, fontSize: '16px', color: THEME.accentText }}>Rs. {item.fare}</div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', gap: '7px', marginTop: '9px' }}>
                  {PAYMENT_METHODS.map((method) => {
                    const active = paymentMethod === method;
                    return (
                      <button
                        type="button"
                        key={method}
                        onClick={() => setPaymentMethod(method)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '9px',
                          border: active ? `2px solid ${THEME.emerald}` : `1.5px solid ${THEME.border}`,
                          background: active ? (sunlightMode ? '#dcfce7' : '#064e3b') : THEME.card,
                          color: THEME.text,
                          fontSize: '12px',
                          fontWeight: 800
                        }}
                      >
                        {method}
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    background: THEME.card,
                    border: `1.5px solid ${THEME.border}`,
                    borderRadius: '12px',
                    padding: '10px 12px',
                    marginTop: '9px',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>Ride Details ({activeFareObj.label})</span>
                    <span style={{ color: THEME.emerald }}>2% Fee: Rs. {platformFee}</span>
                  </div>
                  <div style={{ color: THEME.muted, marginTop: '4px', fontWeight: 600 }}>
                    {pickup} → {dropoff} ({activeFareObj.estTime})
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginTop: '10px',
                    padding: '13px',
                    borderRadius: '12px',
                    border: 'none',
                    background: THEME.emerald,
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Requesting...' : 'Request Ride →'}
                </button>
              </form>
            </>
          )}
        </div>
      )}

      {/* ==================== 3. SUPER ADMIN PORTAL ==================== */}
      {portal === 'admin' && (
        <div style={{ padding: '12px' }}>
          {!adminUnlocked ? (
            <div style={{ background: THEME.card, borderRadius: '14px', padding: '16px', border: `1.5px solid ${THEME.border}` }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>Super Admin Login</h3>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: THEME.muted }}>
                Enter Super Admin PIN (Demo PIN: <strong>1234</strong>):
              </p>
              <input
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Enter Admin PIN"
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '9px',
                  border: `1.5px solid ${THEME.border}`,
                  background: THEME.inputBg,
                  color: THEME.text,
                  marginBottom: '10px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                onClick={() => {
                  if (adminPin === '1234') {
                    setAdminUnlocked(true);
                    setNotice('Super Admin unlocked.');
                  } else {
                    setNotice('Invalid PIN. Use 1234.');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '10px',
                  border: 'none',
                  background: THEME.emerald,
                  color: '#fff',
                  fontWeight: 800
                }}
              >
                Unlock Super Admin Panel
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div style={{ background: THEME.card, padding: '12px', borderRadius: '12px', border: `1.5px solid ${THEME.border}` }}>
                  <div style={{ fontSize: '11px', color: THEME.muted }}>Total Rides</div>
                  <div style={{ fontSize: '20px', fontWeight: 900 }}>{ridesHistory.length}</div>
                </div>
                <div style={{ background: THEME.card, padding: '12px', borderRadius: '12px', border: `1.5px solid ${THEME.border}` }}>
                  <div style={{ fontSize: '11px', color: THEME.muted }}>2% Commission</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: THEME.emerald }}>Rs. {totalCommission}</div>
                </div>
                <div style={{ background: THEME.card, padding: '12px', borderRadius: '12px', border: `1.5px solid ${THEME.border}` }}>
                  <div style={{ fontSize: '11px', color: THEME.muted }}>Active PKR 3,000 Plans</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: THEME.accentText }}>{approvedSubsCount}</div>
                </div>
                <div style={{ background: THEME.card, padding: '12px', borderRadius: '12px', border: `1.5px solid ${THEME.border}` }}>
                  <div style={{ fontSize: '11px', color: THEME.muted }}>Sub Revenue</div>
                  <div style={{ fontSize: '18px', fontWeight: 900 }}>PKR {(approvedSubsCount * 3000).toLocaleString()}</div>
                </div>
              </div>

              <div style={{ background: THEME.card, borderRadius: '14px', padding: '12px', border: `1.5px solid ${THEME.border}` }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Driver Subscriptions (PKR 3,000)</h3>
                {subscriptions.length === 0 ? (
                  <p style={{ fontSize: '12px', color: THEME.muted }}>No subscription requests yet.</p>
                ) : (
                  subscriptions.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        padding: '10px',
                        borderRadius: '10px',
                        background: THEME.cardAlt,
                        marginBottom: '8px',
                        fontSize: '12px',
                        border: `1px solid ${THEME.border}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                        <span>{s.payment_method} • PKR {s.amount}</span>
                        <span style={{ color: THEME.accentText }}>{s.status}</span>
                      </div>
                      <div style={{ color: THEME.muted, marginTop: '3px' }}>TID: {s.transaction_id}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={() => handleSubscriptionAction(s.id, 'approved')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '7px',
                            border: 'none',
                            background: THEME.emerald,
                            color: '#fff',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <Check size={13} /> Approve
                        </button>
                        <button
                          onClick={() => handleSubscriptionAction(s.id, 'rejected')}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '7px',
                            border: 'none',
                            background: '#dc2626',
                            color: '#fff',
                            fontWeight: 800,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <X size={13} /> Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

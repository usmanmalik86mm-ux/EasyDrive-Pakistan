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
  Moon,
  Menu,
  Search,
  ShoppingBag,
  Bike,
  Truck,
  Tag,
  Shield,
  Settings,
  LogIn
} from 'lucide-react';
import MapView from './components/MapView';
import { supabase } from './lib/supabase';

const FARE_OPTIONS = [
  { id: 'Economy', label: 'Economy', seats: '4 seats', fare: 320, eta: '3 min', estTime: '10 min' },
  { id: 'Business', label: 'Business', seats: '4 seats', fare: 520, eta: '2 min', estTime: '9 min' },
  { id: 'Comfort', label: 'Comfort', seats: '4 seats', fare: 680, eta: '4 min', estTime: '11 min' }
];

const QUICK_DESTINATIONS = [
  { title: 'Lucky One Mall', sub: 'Gulberg Town, Karachi', mins: '50 min' },
  { title: 'Karachi Cantt Station', sub: 'Karachi, Sindh', mins: '21 min' },
  { title: 'Tariq Rd', sub: 'Karachi, Sindh', mins: '40 min' },
  { title: 'Dolmen Mall, Clifton', sub: 'Clifton, Karachi', mins: '12 min' }
];

const PAYMENT_METHODS = ['Cash', 'JazzCash', 'Easypaisa'];
const DEMO_PASSENGER_ID = '00000000-0000-0000-0000-000000000001';
const DEMO_DRIVER_ID = '00000000-0000-0000-0000-000000000002';

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
  const [sunlightMode, setSunlightMode] = useState(false);
  const [portal, setPortal] = useState('passenger'); // 'passenger' | 'driver' | 'admin'
  const [driverTab, setDriverTab] = useState('trips'); // 'trips' | 'pool' | 'money' | 'chats' | 'profile'
  const [passengerView, setPassengerView] = useState('hub'); // 'hub' | 'search' | 'booking' | 'active_ride' | 'menu'
  const [serviceMode, setServiceMode] = useState('Rides'); // 'Rides' | 'Shop' | 'Moto' | 'Cargo'

  const THEME = sunlightMode ? PALETTES.sunlight : PALETTES.night;

  // Passenger auth & location states
  const [phoneInput, setPhoneInput] = useState('');
  const [locationShared, setLocationShared] = useState(true);
  const [passengerAuth, setPassengerAuth] = useState({
    loggedIn: false,
    name: 'Guest Passenger',
    phone: '+92 300 1234567'
  });
  const [pickup, setPickup] = useState('Block 4, Clifton');
  const [dropoff, setDropoff] = useState('Dolmen Mall, Clifton');
  const [selectedType, setSelectedType] = useState('Economy');
  const [paymentMethod, setPaymentMethod] = useState('JazzCash');

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
    }, 1600);
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
          ride_type: `${serviceMode} • ${activeFareObj.id}`,
          payment_method: paymentMethod,
          driver_name: driverAuth.name,
          driver_rating: driverAuth.rating,
          vehicle_info: `${driverAuth.vehicle} • ${driverAuth.plate}`,
          eta_minutes: 3,
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
    setPassengerView('active_ride');
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
        setPassengerView('hub');
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

  // ==================== STAGE 1: SPLASH ====================
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
            lineHeight: 1.05
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

  // ==================== STAGE 2: PROMO ("AB POORA CASH APKA") ====================
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
          <h1 style={{ margin: '14px 0 0', fontSize: '32px', fontWeight: 900, lineHeight: 1.15 }}>
            AB POORA CASH APKA
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: '14px', color: '#dcfce7' }}>
            Trusted & Affordable Rides in Pakistan • PKR 3,000 Driver Plan • 2% Fee
          </p>
        </div>

        <div
          style={{
            background: 'rgba(9, 13, 22, 0.78)',
            border: '1px solid rgba(253, 224, 71, 0.4)',
            borderRadius: '20px',
            padding: '18px'
          }}
        >
          <button
            onClick={() => {
              setPortal('passenger');
              setPassengerView('hub');
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
            Continue to EasyDrive App →
          </button>

          <button
            onClick={() => {
              setPortal('driver');
              setDriverTab('trips');
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
            Open Driver Pro Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ==================== STAGE 3: MERGED APP (PASSENGER + DRIVER PRO + ADMIN) ====================
  return (
    <div
      style={{
        maxWidth: '430px',
        minHeight: '100vh',
        margin: '0 auto',
        background: THEME.bg,
        color: THEME.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        paddingBottom: portal === 'driver' ? '78px' : '28px'
      }}
    >
      {/* Top Role Switcher + Night / Sunlight Mode */}
      <div
        style={{
          background: THEME.bar,
          padding: '8px 10px',
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          borderBottom: `1.5px solid ${THEME.border}`
        }}
      >
        {[
          { id: 'passenger', label: 'Passenger', Icon: User },
          { id: 'driver', label: 'Driver Pro', Icon: Car },
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
          style={{
            padding: '7px 9px',
            borderRadius: '9px',
            border: `1px solid ${sunlightMode ? THEME.gold : THEME.border}`,
            background: sunlightMode ? '#fef3c7' : THEME.cardAlt,
            color: sunlightMode ? '#92400e' : THEME.accentText,
            display: 'flex',
            alignItems: 'center',
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

      {/* ==================== 1. PASSENGER PORTAL ==================== */}
      {portal === 'passenger' && (
        <div style={{ padding: '12px' }}>
          {/* Passenger Header Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <button
              onClick={() => setPassengerView(passengerView === 'menu' ? 'hub' : 'menu')}
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                border: `1px solid ${THEME.border}`,
                background: THEME.card,
                color: THEME.text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Menu size={18} />
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '16px', fontWeight: 900, fontStyle: 'italic', color: THEME.emerald }}>
                EASYDRIVE-PAKISTAN
              </div>
              <div style={{ fontSize: '11px', color: THEME.muted, fontWeight: 700 }}>
                {locationShared ? `Your location • ${pickup}` : 'Location permission needed'}
              </div>
            </div>

            <button
              onClick={() => setLocationShared((prev) => !prev)}
              style={{
                padding: '6px 10px',
                borderRadius: '999px',
                border: `1px solid ${THEME.border}`,
                background: THEME.card,
                color: THEME.accentText,
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {locationShared ? 'GPS On' : 'Share GPS'}
            </button>
          </div>

          {/* Location Permission Prompt if toggled off */}
          {!locationShared && (
            <div
              style={{
                background: THEME.card,
                border: `1.5px solid ${THEME.gold}`,
                borderRadius: '16px',
                padding: '16px',
                marginBottom: '12px',
                textAlign: 'center'
              }}
            >
              <div style={{ fontSize: '15px', fontWeight: 900 }}>
                SHARE YOUR LOCATION SO WE CAN FIND AN AVAILABLE CAR FASTER
              </div>
              <p style={{ fontSize: '12px', color: THEME.muted, margin: '6px 0 12px' }}>
                We use your location to find the nearest drivers for the fastest pickup in Karachi.
              </p>
              <button
                onClick={() => {
                  setLocationShared(true);
                  setNotice('Location shared!');
                }}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '12px',
                  border: 'none',
                  background: THEME.emerald,
                  color: '#fff',
                  fontWeight: 900
                }}
              >
                Share location
              </button>
            </div>
          )}

          {/* PASSENGER VIEW A: MENU / ACCOUNT / EARN AS DRIVER */}
          {passengerView === 'menu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: THEME.card, borderRadius: '16px', padding: '14px', border: `1.5px solid ${THEME.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: THEME.emerald,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <User size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 900 }}>
                      {passengerAuth.loggedIn ? passengerAuth.name : 'Log in or register'}
                    </div>
                    <div style={{ fontSize: '12px', color: THEME.muted }}>
                      {passengerAuth.phone} • To access rides & favorites
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    value={phoneInput}
                    onChange={(e) => setPhoneInput(e.target.value)}
                    placeholder="+92 300 0000000"
                    style={{
                      flex: 1,
                      padding: '9px 10px',
                      borderRadius: '10px',
                      border: `1px solid ${THEME.border}`,
                      background: THEME.inputBg,
                      color: THEME.text,
                      fontSize: '13px'
                    }}
                  />
                  <button
                    onClick={() => {
                      setPassengerAuth({
                        ...passengerAuth,
                        loggedIn: true,
                        phone: phoneInput.trim() || '+92 300 1234567'
                      });
                      setNotice('Phone number saved!');
                    }}
                    style={{
                      padding: '9px 14px',
                      borderRadius: '10px',
                      border: 'none',
                      background: THEME.emerald,
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '12px'
                    }}
                  >
                    Continue
                  </button>
                </div>
              </div>

              {[
                { label: 'Discounts', sub: 'Enter promo code', Icon: Tag, action: () => setNotice('Promo EASY20 applied!') },
                { label: 'Payment methods', sub: `Active: ${paymentMethod}`, Icon: Wallet, action: () => setPassengerView('booking') },
                { label: 'Support', sub: 'EasyDrive-Pakistan 24/7 Help', Icon: Headphones, action: () => setNotice('Support team notified.') },
                {
                  label: 'Earn as a driver',
                  sub: 'Switch to Driver Pro • Ab Poora Cash Apka',
                  Icon: Car,
                  action: () => {
                    setPortal('driver');
                    setDriverTab('trips');
                  }
                },
                { label: 'Safety', sub: 'Share live trip & emergency help', Icon: Shield, action: handleShareRide },
                { label: 'Settings', sub: 'Night / Sunlight & preferences', Icon: Settings, action: () => setSunlightMode((p) => !p) }
              ].map((row, i) => (
                <div
                  key={i}
                  onClick={row.action}
                  style={{
                    background: THEME.card,
                    borderRadius: '14px',
                    padding: '12px 14px',
                    border: `1.5px solid ${THEME.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <row.Icon size={18} color={THEME.emerald} />
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800 }}>{row.label}</div>
                      <div style={{ fontSize: '11px', color: THEME.muted }}>{row.sub}</div>
                    </div>
                  </div>
                  <ChevronRight size={16} color={THEME.muted} />
                </div>
              ))}
            </div>
          )}

          {/* PASSENGER VIEW B: HUB ("Where to?" + Service Tiles + Recent Destinations) */}
          {passengerView === 'hub' && (
            <>
              {/* Service Tiles Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                {[
                  { id: 'Shop', label: 'Shop', sub: 'Quick delivery', Icon: ShoppingBag },
                  { id: 'Moto', label: 'Moto', sub: 'Fast bike rides', Icon: Bike },
                  { id: 'Transport', label: 'Transport', sub: 'City routes', Icon: Truck },
                  { id: 'Rides', label: 'Rides', sub: 'from 3 min', Icon: Car }
                ].map((tile) => {
                  const active = serviceMode === tile.id;
                  return (
                    <div
                      key={tile.id}
                      onClick={() => {
                        setServiceMode(tile.id);
                        setPassengerView('booking');
                      }}
                      style={{
                        background: active ? (sunlightMode ? '#dcfce7' : '#064e3b') : THEME.card,
                        border: active ? `2px solid ${THEME.emerald}` : `1.5px solid ${THEME.border}`,
                        borderRadius: '16px',
                        padding: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 900 }}>{tile.label}</span>
                        <tile.Icon size={20} color={THEME.emerald} />
                      </div>
                      <div style={{ fontSize: '11px', color: THEME.muted, marginTop: '6px', fontWeight: 600 }}>
                        {tile.sub}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* "Where to?" Search Bar */}
              <button
                onClick={() => setPassengerView('booking')}
                style={{
                  width: '100%',
                  background: THEME.cardAlt,
                  border: `1.5px solid ${THEME.border}`,
                  borderRadius: '16px',
                  padding: '14px',
                  color: THEME.text,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                  cursor: 'pointer'
                }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '16px', fontWeight: 900 }}>
                  <Search size={18} color={THEME.emerald} /> Where to?
                </span>
                <ChevronRight size={18} color={THEME.muted} />
              </button>

              {/* Quick Destinations List */}
              <div style={{ background: THEME.card, borderRadius: '16px', padding: '10px 12px', border: `1.5px solid ${THEME.border}` }}>
                {QUICK_DESTINATIONS.map((dest, idx) => (
                  <div
                    key={idx}
                    onClick={() => {
                      setDropoff(dest.title);
                      setPassengerView('booking');
                    }}
                    style={{
                      padding: '10px 4px',
                      borderBottom: idx < QUICK_DESTINATIONS.length - 1 ? `1px solid ${THEME.border}` : 'none',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <MapPin size={18} color={THEME.emerald} />
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 800 }}>{dest.title}</div>
                        <div style={{ fontSize: '11px', color: THEME.muted }}>{dest.sub}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: '12px', color: THEME.muted, fontWeight: 700 }}>{dest.mins}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* PASSENGER VIEW C: ROUTE & FARE BOOKING SHEET */}
          {passengerView === 'booking' && (
            <>
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: `1.5px solid ${THEME.border}`, marginBottom: '10px' }}>
                <MapView height="165px" />
              </div>

              <div
                style={{
                  background: THEME.card,
                  borderRadius: '16px',
                  padding: '12px',
                  border: `1.5px solid ${THEME.border}`,
                  marginBottom: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MapPin size={16} color={THEME.emerald} />
                  <input
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Pickup"
                    style={{
                      flex: 1,
                      background: THEME.inputBg,
                      border: `1px solid ${THEME.border}`,
                      color: THEME.text,
                      borderRadius: '9px',
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
                      border: `1px solid ${THEME.border}`,
                      color: THEME.text,
                      borderRadius: '9px',
                      padding: '8px',
                      fontSize: '13px'
                    }}
                  />
                </div>
              </div>

              <form onSubmit={handleRequestRide}>
                {/* Ride Options */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '10px' }}>
                  {FARE_OPTIONS.map((item) => {
                    const active = selectedType === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedType(item.id)}
                        style={{
                          background: active ? (sunlightMode ? '#dcfce7' : '#064e3b') : THEME.card,
                          border: active ? `2px solid ${THEME.emerald}` : `1.5px solid ${THEME.border}`,
                          borderRadius: '14px',
                          padding: '9px 8px',
                          cursor: 'pointer'
                        }}
                      >
                        <div
                          style={{
                            display: 'inline-block',
                            background: THEME.emerald,
                            color: '#fff',
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '2px 7px',
                            borderRadius: '999px',
                            marginBottom: '5px'
                          }}
                        >
                          {item.eta}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 900 }}>{item.label}</div>
                        <div style={{ fontSize: '14px', fontWeight: 900, color: THEME.accentText, marginTop: '3px' }}>
                          Rs. {item.fare}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Payment Method */}
                <div style={{ display: 'flex', gap: '7px', marginBottom: '10px' }}>
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
                          borderRadius: '10px',
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

                {/* Ride Details Summary */}
                <div
                  style={{
                    background: THEME.card,
                    border: `1.5px solid ${THEME.border}`,
                    borderRadius: '14px',
                    padding: '10px 12px',
                    marginBottom: '10px',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>{serviceMode} • {activeFareObj.label} ({activeFareObj.estTime})</span>
                    <span style={{ color: THEME.emerald }}>2% Fee: Rs. {platformFee}</span>
                  </div>
                  <div style={{ color: THEME.muted, marginTop: '4px' }}>
                    {pickup} → {dropoff} ({paymentMethod})
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '14px',
                    border: 'none',
                    background: THEME.emerald,
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 900,
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Requesting...' : 'Request'}
                </button>
              </form>
            </>
          )}

          {/* PASSENGER VIEW D: ACTIVE RIDE */}
          {passengerView === 'active_ride' && currentRide && (
            <div>
              <div style={{ background: THEME.emerald, color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '10px' }}>
                <div style={{ fontSize: '17px', fontWeight: 900 }}>
                  {currentRide.status === 'searching' ? 'Finding Nearby Driver...' : 'Your Driver is on the Way'}
                </div>
                <div style={{ fontSize: '12px', opacity: 0.95 }}>
                  Status: {currentRide.status} • ETA {currentRide.eta_minutes || 3} min
                </div>
              </div>

              <MapView height="185px" />

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
                  <div style={{ fontWeight: 900, fontSize: '15px' }}>{currentRide.driver_name}</div>
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
          )}
        </div>
      )}

      {/* ==================== 2. DRIVER PRO PORTAL ==================== */}
      {portal === 'driver' && (
        <>
          {driverTab === 'trips' && (
            <div style={{ padding: '10px 12px' }}>
              <div style={{ borderRadius: '16px', overflow: 'hidden', border: `1.5px solid ${THEME.border}` }}>
                <MapView height="205px" />
              </div>

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
                <span style={{ background: THEME.emerald, color: '#fff', fontSize: '12px', fontWeight: 800, padding: '5px 10px', borderRadius: '999px' }}>
                  from Rs 320.00
                </span>
                <span style={{ fontSize: '13px', fontWeight: 800 }}>Minimum fare guarantee</span>
                <ChevronRight size={16} color={THEME.muted} />
              </div>

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
                  <div>
                    <div style={{ fontSize: '11px', color: THEME.muted, fontWeight: 700 }}>Priority</div>
                    <div style={{ fontSize: '18px', fontWeight: 900 }}>+{driverAuth.priority}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: THEME.muted, fontWeight: 700 }}>{completedRides.length} trips</div>
                    <div style={{ fontSize: '18px', fontWeight: 900 }}>Rs {todayEarnings.toLocaleString()}</div>
                  </div>
                </div>

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
                    <div style={{ fontSize: '11px', color: THEME.muted }}>PKR 3,000 Monthly Plan • 2% Fee</div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: THEME.accentText }}>100% Direct</div>
                </div>

                <button
                  onClick={() => {
                    const next = !driverOnline;
                    setDriverOnline(next);
                    setNotice(next ? 'You are now ONLINE!' : 'You are now Offline.');
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
                  <span style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fff', color: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ArrowRight size={18} />
                  </span>
                  <div style={{ textAlign: 'center', flex: 1, marginRight: '38px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800 }}>{driverOnline ? 'Online' : 'Offline'}</div>
                    <div style={{ fontSize: '15px', fontWeight: 900 }}>{driverOnline ? 'Go offline' : 'Go online'}</div>
                  </div>
                </button>
              </div>

              {/* Incoming Passenger Ride Requests */}
              <div style={{ marginTop: '10px', background: THEME.card, border: `1.5px solid ${THEME.border}`, borderRadius: '16px', padding: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 900, marginBottom: '8px' }}>Incoming Ride Requests</div>
                {ridesHistory.filter((r) => r.status === 'searching' || r.status === 'accepted').length === 0 ? (
                  <div style={{ fontSize: '12px', color: THEME.muted }}>No open ride requests right now.</div>
                ) : (
                  ridesHistory
                    .filter((r) => r.status === 'searching' || r.status === 'accepted')
                    .map((r) => (
                      <div key={r.id} style={{ background: THEME.cardAlt, borderRadius: '12px', padding: '10px', marginBottom: '8px', fontSize: '12px', border: `1px solid ${THEME.border}` }}>
                        <div style={{ fontWeight: 800 }}>{r.pickup_address} → {r.dropoff_address}</div>
                        <div style={{ color: THEME.emerald, marginTop: '4px', fontWeight: 800 }}>
                          Rs. {r.fare} • 2% Fee: Rs. {(Number(r.fare) * 0.02).toFixed(2)} • {r.status}
                        </div>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          {r.status === 'searching' && (
                            <button
                              onClick={() => handleUpdateRideStatus(r.id, 'accepted')}
                              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: THEME.emerald, color: '#fff', fontWeight: 800 }}
                            >
                              Accept Trip
                            </button>
                          )}
                          {r.status === 'accepted' && (
                            <button
                              onClick={() => handleUpdateRideStatus(r.id, 'completed')}
                              style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: THEME.gold, color: '#090d16', fontWeight: 900 }}
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

          {driverTab === 'pool' && (
            <div style={{ padding: '14px 12px' }}>
              <h2 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 900 }}>EasyDrive Pool</h2>
              <div style={{ background: THEME.card, borderRadius: '16px', padding: '14px', border: `1.5px solid ${THEME.border}` }}>
                <div style={{ fontSize: '14px', fontWeight: 900, color: THEME.emerald }}>Ab Poora Cash Apka • Shared Pool</div>
                <p style={{ fontSize: '12px', color: THEME.muted, margin: '6px 0 0' }}>
                  Shared corridor rides across Karachi with transparent 2% platform fee.
                </p>
              </div>
            </div>
          )}

          {driverTab === 'money' && (
            <div style={{ padding: '14px 12px' }}>
              <h2 style={{ margin: '0 0 10px', fontSize: '24px', fontWeight: 900 }}>Money</h2>
              <div style={{ fontSize: '30px', fontWeight: 900 }}>Rs {todayEarnings.toLocaleString()}</div>
              <div style={{ fontSize: '12px', color: THEME.muted, marginBottom: '12px' }}>Today • Ab Poora Cash Apka</div>

              <form onSubmit={handleSubmitSubscription} style={{ background: THEME.card, borderRadius: '14px', padding: '14px', border: `1.5px solid ${THEME.emerald}` }}>
                <div style={{ fontSize: '14px', fontWeight: 900, color: THEME.emerald, marginBottom: '8px' }}>
                  Monthly Subscription: PKR 3,000
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
                  style={{ width: '100%', padding: '9px', borderRadius: '9px', border: `1px solid ${THEME.border}`, background: THEME.inputBg, color: THEME.text, marginBottom: '10px', boxSizing: 'border-box' }}
                />
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: THEME.emerald, color: '#fff', fontWeight: 800 }}>
                  Submit PKR 3,000 Receipt
                </button>
              </form>
            </div>
          )}

          {driverTab === 'chats' && (
            <div style={{ padding: '14px 12px' }}>
              <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 900 }}>Messages</h2>
              {[
                { title: 'Support', sub: '24/7 EasyDrive Driver Helpdesk', Icon: Headphones },
                { title: 'Ab Poora Cash Apka', sub: 'Monthly PKR 3,000 plan active info', Icon: Sparkles },
                { title: 'Warnings', sub: 'Maintain safe driving & high rating', Icon: AlertTriangle },
                { title: 'Pro News', sub: 'JazzCash & Easypaisa updates', Icon: Bell }
              ].map((item, idx) => (
                <div key={idx} style={{ background: THEME.card, borderRadius: '14px', padding: '12px', border: `1.5px solid ${THEME.border}`, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                  <item.Icon size={18} color={THEME.emerald} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800 }}>{item.title}</div>
                    <div style={{ fontSize: '12px', color: THEME.muted }}>{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {driverTab === 'profile' && (
            <div style={{ padding: '14px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ fontSize: '20px', fontWeight: 900 }}>{driverAuth.name}</div>
                <button
                  onClick={() => setPortal('passenger')}
                  style={{ background: THEME.emerald, border: 'none', color: '#fff', borderRadius: '999px', padding: '7px 12px', fontSize: '12px', fontWeight: 800 }}
                >
                  Passenger View
                </button>
              </div>
              <div style={{ background: THEME.card, borderRadius: '16px', padding: '14px', border: `1.5px solid ${THEME.border}` }}>
                <div style={{ fontSize: '14px', fontWeight: 900 }}>{driverAuth.vehicle} • {driverAuth.plate}</div>
                <div style={{ fontSize: '12px', color: THEME.muted, marginTop: '4px' }}>
                  Rating: {driverAuth.rating} ★ • Priority: +{driverAuth.priority}
                </div>
              </div>
            </div>
          )}

          {/* Bottom 5-Tab Driver Bar */}
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

      {/* ==================== 3. SUPER ADMIN PORTAL ==================== */}
      {portal === 'admin' && (
        <div style={{ padding: '12px' }}>
          {!adminUnlocked ? (
            <div style={{ background: THEME.card, borderRadius: '14px', padding: '16px', border: `1.5px solid ${THEME.border}` }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px' }}>Super Admin Login</h3>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: THEME.muted }}>
                Demo PIN: <strong>1234</strong>
              </p>
              <input
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Enter Admin PIN"
                style={{ width: '100%', padding: '10px', borderRadius: '9px', border: `1px solid ${THEME.border}`, background: THEME.inputBg, color: THEME.text, marginBottom: '10px', boxSizing: 'border-box' }}
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
                style={{ width: '100%', padding: '11px', borderRadius: '10px', border: 'none', background: THEME.emerald, color: '#fff', fontWeight: 800 }}
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
                {subscriptions.map((s) => (
                  <div key={s.id} style={{ padding: '10px', borderRadius: '10px', background: THEME.cardAlt, marginBottom: '8px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                      <span>{s.payment_method} • PKR {s.amount}</span>
                      <span>{s.status}</span>
                    </div>
                    <div style={{ color: THEME.muted, marginTop: '3px' }}>TID: {s.transaction_id}</div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button onClick={() => handleSubscriptionAction(s.id, 'approved')} style={{ padding: '6px 10px', borderRadius: '7px', border: 'none', background: THEME.emerald, color: '#fff', fontWeight: 800 }}>
                        Approve
                      </button>
                      <button onClick={() => handleSubscriptionAction(s.id, 'rejected')} style={{ padding: '6px 10px', borderRadius: '7px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 800 }}>
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

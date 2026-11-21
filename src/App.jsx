import React, { useEffect, useState } from 'react';
import {
  Car,
  MapPin,
  Navigation,
  Phone,
  MessageCircle,
  Share2,
  XCircle,
  Home,
  Clock,
  Tag,
  User,
  CheckCircle2,
  Wallet,
  ShieldCheck,
  LogIn,
  Check,
  X
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

export default function App() {
  const [portal, setPortal] = useState('passenger'); // 'passenger' | 'driver' | 'admin'
  const [screen, setScreen] = useState('welcome'); // 'welcome' | 'booking' | 'active_ride'
  const [tab, setTab] = useState('home'); // 'home' | 'activity' | 'offers' | 'profile'

  // Login states
  const [passengerAuth, setPassengerAuth] = useState({
    loggedIn: false,
    name: 'Passenger User',
    phone: '0300-1234567'
  });

  const [driverAuth, setDriverAuth] = useState({
    loggedIn: false,
    name: 'Ali Raza',
    phone: '0321-7654321',
    vehicle: 'Toyota Corolla • BKU-7431'
  });

  const [adminUnlocked, setAdminUnlocked] = useState(false);
  const [adminPin, setAdminPin] = useState('');

  // Passenger booking states
  const [pickup, setPickup] = useState('Clifton, Karachi');
  const [dropoff, setDropoff] = useState('Dolmen Mall, Clifton');
  const [selectedType, setSelectedType] = useState('Economy');
  const [paymentMethod, setPaymentMethod] = useState('JazzCash');

  // Driver subscription states (PKR 3,000 monthly via JazzCash / Easypaisa)
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
          driver_name: driverAuth.name || 'Ali Raza',
          driver_rating: 4.9,
          vehicle_info: driverAuth.vehicle || 'Toyota Corolla • BKU-7431',
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
    setScreen('active_ride');
    loadAllData();
  }

  async function handleUpdateRideStatus(rideId, nextStatus) {
    const { error } = await supabase
      .from('rides')
      .update({
        status: nextStatus,
        driver_id: DEMO_DRIVER_ID,
        driver_name: driverAuth.name,
        vehicle_info: driverAuth.vehicle
      })
      .eq('id', rideId);

    if (error) {
      setNotice(`Update error: ${error.message}`);
      return;
    }

    if (currentRide && currentRide.id === rideId) {
      if (nextStatus === 'cancelled' || nextStatus === 'completed') {
        setCurrentRide(null);
        setScreen('booking');
        if (nextStatus === 'completed') setTab('activity');
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

  const totalCommission = ridesHistory
    .reduce((sum, r) => sum + Number(r.fare || 0) * 0.02, 0)
    .toFixed(2);

  const approvedSubsCount = subscriptions.filter((s) => s.status === 'approved').length;

  return (
    <div
      style={{
        maxWidth: '430px',
        minHeight: '100vh',
        margin: '0 auto',
        background: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        paddingBottom: portal === 'passenger' && screen !== 'welcome' ? '76px' : '28px'
      }}
    >
      {/* Top Portal Switcher (Passenger / Driver / Super Admin) */}
      <div
        style={{
          background: '#0f172a',
          color: '#fff',
          padding: '8px 10px',
          display: 'flex',
          gap: '6px'
        }}
      >
        {[
          { id: 'passenger', label: 'Passenger', Icon: User },
          { id: 'driver', label: 'Driver', Icon: Car },
          { id: 'admin', label: 'Super Admin', Icon: ShieldCheck }
        ].map(({ id, label, Icon }) => {
          const active = portal === id;
          return (
            <button
              key={id}
              onClick={() => setPortal(id)}
              style={{
                flex: 1,
                padding: '7px 6px',
                borderRadius: '8px',
                border: 'none',
                background: active ? '#16a34a' : '#1e293b',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
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
      </div>

      {notice && (
        <div
          style={{
            margin: '10px 12px 0',
            padding: '10px 12px',
            borderRadius: '10px',
            background: '#dcfce7',
            color: '#14532d',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span>{notice}</span>
          <button
            onClick={() => setNotice('')}
            style={{ background: 'none', border: 'none', color: '#14532d', fontWeight: 800, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {/* ==================== 1. PASSENGER PORTAL ==================== */}
      {portal === 'passenger' && screen === 'welcome' && (
        <div
          style={{
            minHeight: 'calc(100vh - 44px)',
            background: 'linear-gradient(180deg, #16a34a 0%, #15803d 55%, #064e3b 100%)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '20px 16px'
          }}
        >
          <div style={{ textAlign: 'center', marginTop: '8px' }}>
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '20px',
                background: '#fff',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 10px',
                boxShadow: '0 10px 24px rgba(0,0,0,0.22)'
              }}
            >
              <Car size={36} />
            </div>
            <h1 style={{ margin: 0, fontSize: '25px', fontWeight: 800 }}>EasyDrive-Pakistan</h1>
            <p style={{ margin: '4px 0 0', fontSize: '14px', fontWeight: 500, opacity: 0.95 }}>
              Apke Safar Main Humsafar
            </p>

            {/* Matching Green-Themed Artistic Landmarks: Mazar-e-Quaid & Faisal Mosque */}
            <div
              style={{
                marginTop: '16px',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                textAlign: 'left'
              }}
            >
              {/* Mazar-e-Quaid Picture Frame */}
              <div
                style={{
                  background: 'rgba(6, 78, 59, 0.55)',
                  border: '1px solid rgba(187, 247, 208, 0.45)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 22px rgba(0, 0, 0, 0.22)'
                }}
              >
                <div
                  style={{
                    height: '122px',
                    background: 'linear-gradient(180deg, #14532d 0%, #166534 55%, #dcfce7 100%)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center'
                  }}
                >
                  <svg viewBox="0 0 180 120" width="100%" height="100%" style={{ display: 'block' }}>
                    <circle cx="142" cy="28" r="14" fill="rgba(255,255,255,0.22)" />
                    <rect x="25" y="96" width="130" height="24" rx="4" fill="#ffffff" />
                    <rect x="42" y="64" width="96" height="32" fill="#f0fdf4" />
                    <path d="M52 96 L52 74 Q62 66 72 74 L72 96 Z" fill="#15803d" />
                    <path d="M80 96 L80 72 Q90 64 100 72 L100 96 Z" fill="#15803d" />
                    <path d="M108 96 L108 74 Q118 66 128 74 L128 96 Z" fill="#15803d" />
                    <path d="M56 64 Q90 22 124 64 Z" fill="#ffffff" />
                    <line x1="90" y1="16" x2="90" y2="32" stroke="#ffffff" strokeWidth="2.5" />
                  </svg>
                </div>
                <div style={{ padding: '9px 10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>Mazar-e-Quaid</div>
                  <div style={{ fontSize: '11px', color: '#bbf7d0', marginTop: '2px' }}>Karachi • Heritage</div>
                </div>
              </div>

              {/* Islamabad Faisal Mosque Picture Frame */}
              <div
                style={{
                  background: 'rgba(6, 78, 59, 0.55)',
                  border: '1px solid rgba(187, 247, 208, 0.45)',
                  borderRadius: '16px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 22px rgba(0, 0, 0, 0.22)'
                }}
              >
                <div
                  style={{
                    height: '122px',
                    background: 'linear-gradient(180deg, #065f46 0%, #047857 55%, #d1fae5 100%)',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center'
                  }}
                >
                  <svg viewBox="0 0 180 120" width="100%" height="100%" style={{ display: 'block' }}>
                    <circle cx="38" cy="28" r="14" fill="rgba(255,255,255,0.22)" />
                    <rect x="20" y="98" width="140" height="22" rx="4" fill="#ffffff" />
                    {/* Four Minarets */}
                    <polygon points="34,16 30,98 38,98" fill="#ffffff" />
                    <polygon points="56,34 53,98 59,98" fill="#ecfdf5" />
                    <polygon points="124,34 121,98 127,98" fill="#ecfdf5" />
                    <polygon points="146,16 142,98 150,98" fill="#ffffff" />
                    {/* Iconic Tent Roof */}
                    <polygon points="90,34 46,98 134,98" fill="#ffffff" />
                    <polygon points="90,52 72,98 108,98" fill="#15803d" />
                  </svg>
                </div>
                <div style={{ padding: '9px 10px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>Islamabad Mosque</div>
                  <div style={{ fontSize: '11px', color: '#a7f3d0', marginTop: '2px' }}>Faisal Mosque</div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setScreen('booking')}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: '2px solid #fff',
              background: '#16a34a',
              color: '#fff',
              fontSize: '16px',
              fontWeight: 800,
              cursor: 'pointer',
              marginTop: '16px',
              boxShadow: '0 8px 18px rgba(0, 0, 0, 0.2)'
            }}
          >
            Get Started →
          </button>
        </div>
      )}

      {portal === 'passenger' && screen === 'active_ride' && currentRide && (
        <div style={{ padding: '12px' }}>
          <div style={{ background: '#15803d', color: '#fff', padding: '14px', borderRadius: '12px', marginBottom: '10px' }}>
            <div style={{ fontSize: '17px', fontWeight: 800 }}>
              {currentRide.status === 'searching' ? 'Finding Nearby Driver...' : 'Your Ride is on the Way'}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.92 }}>
              Status: {currentRide.status} • Arriving in {currentRide.eta_minutes || 2} min
            </div>
          </div>

          <MapView height="195px" />

          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '12px',
              marginTop: '10px',
              border: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '15px' }}>{currentRide.driver_name || 'Ali Raza'}</div>
              <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 700 }}>
                ★ {currentRide.driver_rating || 4.9} • {currentRide.vehicle_info}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setNotice('Calling driver...')}
                style={{ padding: '8px', borderRadius: '50%', border: '1px solid #dcfce7', background: '#f0fdf4', color: '#15803d' }}
              >
                <Phone size={16} />
              </button>
              <button
                onClick={() => setNotice('Message sent to driver.')}
                style={{ padding: '8px', borderRadius: '50%', border: '1px solid #dcfce7', background: '#f0fdf4', color: '#15803d' }}
              >
                <MessageCircle size={16} />
              </button>
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              borderRadius: '12px',
              padding: '12px',
              marginTop: '10px',
              border: '1px solid #e5e7eb',
              fontSize: '13px'
            }}
          >
            <div><strong>Pickup:</strong> {currentRide.pickup_address}</div>
            <div style={{ marginTop: '4px' }}><strong>Dropoff:</strong> {currentRide.dropoff_address}</div>
            <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Fare:</strong> Rs. {currentRide.fare} ({currentRide.payment_method})</span>
              <span style={{ color: '#15803d', fontWeight: 700 }}>
                2% Fee: Rs. {(Number(currentRide.fare) * 0.02).toFixed(2)}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
            <button
              onClick={handleShareRide}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '10px',
                border: '1px solid #16a34a',
                background: '#fff',
                color: '#15803d',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <Share2 size={15} /> Share Ride
            </button>
            <button
              onClick={() => handleUpdateRideStatus(currentRide.id, 'cancelled')}
              style={{
                flex: 1,
                padding: '11px',
                borderRadius: '10px',
                border: 'none',
                background: '#dc2626',
                color: '#fff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              <XCircle size={15} /> Cancel Ride
            </button>
          </div>

          <button
            onClick={() => handleUpdateRideStatus(currentRide.id, 'completed')}
            style={{
              width: '100%',
              marginTop: '8px',
              padding: '12px',
              borderRadius: '10px',
              border: 'none',
              background: '#16a34a',
              color: '#fff',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <CheckCircle2 size={16} /> Complete Ride
          </button>
        </div>
      )}

      {portal === 'passenger' && screen === 'booking' && (
        <>
          <div
            style={{
              background: '#fff',
              padding: '10px 14px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: '14px', color: '#15803d' }}>EasyDrive-Pakistan</div>
              <div style={{ fontSize: '11px', color: '#6b7280' }}>
                {passengerAuth.loggedIn ? `Rider: ${passengerAuth.name}` : 'Guest Passenger (Login in Profile)'}
              </div>
            </div>
            <button
              onClick={() => setScreen('welcome')}
              style={{
                border: '1px solid #dcfce7',
                background: '#f0fdf4',
                color: '#15803d',
                borderRadius: '8px',
                padding: '4px 9px',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              Welcome
            </button>
          </div>

          {tab === 'home' && (
            <div style={{ padding: '12px' }}>
              <div
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '10px',
                  border: '1px solid #e5e7eb',
                  marginBottom: '10px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <MapPin size={16} color="#16a34a" />
                  <input
                    value={pickup}
                    onChange={(e) => setPickup(e.target.value)}
                    placeholder="Pickup Location"
                    style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '8px', padding: '7px 9px', fontSize: '13px' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Navigation size={16} color="#dc2626" />
                  <input
                    value={dropoff}
                    onChange={(e) => setDropoff(e.target.value)}
                    placeholder="Destination"
                    style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: '8px', padding: '7px 9px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <MapView height="155px" />

              <form onSubmit={handleRequestRide} style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                  {FARE_OPTIONS.map((item) => {
                    const active = selectedType === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedType(item.id)}
                        style={{
                          background: active ? '#f0fdf4' : '#fff',
                          border: active ? '2px solid #16a34a' : '1px solid #e5e7eb',
                          borderRadius: '11px',
                          padding: '9px 12px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.label}</div>
                          <div style={{ fontSize: '11px', color: '#6b7280' }}>{item.seats}</div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '15px', color: '#15803d' }}>Rs. {item.fare}</div>
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
                          padding: '7px',
                          borderRadius: '9px',
                          border

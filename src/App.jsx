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
            background: 'linear-gradient(180deg, #16a34a 0%, #15803d 68%, #f0fdf4 100%)',
            color: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px 18px'
          }}
        >
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <div
              style={{
                width: '78px',
                height: '78px',
                borderRadius: '22px',
                background: '#fff',
                color: '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 14px'
              }}
            >
              <Car size={40} />
            </div>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 800 }}>EasyDrive-Pakistan</h1>
            <p style={{ margin: '6px 0 0', fontSize: '15px' }}>Apke Safar Main Humsafar</p>
            <p style={{ margin: '10px 0 0', fontSize: '12px', opacity: 0.9 }}>
              Karachi • Economy Rs. 320 • Business Rs. 520 • 2% Fee
            </p>
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
              cursor: 'pointer'
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
                          border: active ? '2px solid #16a34a' : '1px solid #e5e7eb',
                          background: active ? '#dcfce7' : '#fff',
                          fontSize: '12px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '4px'
                        }}
                      >
                        <Wallet size={13} color="#15803d" /> {method}
                      </button>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4b5563', marginTop: '8px' }}>
                  <span>Fare: <strong>Rs. {activeFareObj.fare}</strong></span>
                  <span>2% Platform Fee: <strong>Rs. {platformFee}</strong></span>
                </div>

                <div
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    padding: '9px 11px',
                    marginTop: '9px',
                    fontSize: '12px',
                    color: '#374151'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginBottom: '4px' }}>
                    <span>Ride Details ({activeFareObj.label})</span>
                    <span style={{ color: '#15803d' }}>ETA: {activeFareObj.eta}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4b5563' }}>
                    <span>Est. Trip: <strong>{activeFareObj.estTime}</strong></span>
                    <span>Payment: <strong>{paymentMethod}</strong></span>
                  </div>
                  <div style={{ marginTop: '4px', color: '#6b7280', fontSize: '11px' }}>
                    {pickup || 'Pickup'} → {dropoff || 'Dropoff'}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    marginTop: '9px',
                    padding: '13px',
                    borderRadius: '11px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#fff',
                    fontSize: '15px',
                    fontWeight: 800,
                    cursor: 'pointer'
                  }}
                >
                  {loading ? 'Requesting...' : 'Request Ride →'}
                </button>
              </form>
            </div>
          )}

          {tab === 'activity' && (
            <div style={{ padding: '12px' }}>
              <h3 style={{ margin: '0 0 10px', fontSize: '15px' }}>Ride Activity</h3>
              {ridesHistory.length === 0 ? (
                <p style={{ fontSize: '13px', color: '#6b7280' }}>No rides yet.</p>
              ) : (
                ridesHistory.map((r) => (
                  <div
                    key={r.id}
                    style={{
                      background: '#fff',
                      borderRadius: '10px',
                      padding: '10px',
                      marginBottom: '8px',
                      border: '1px solid #e5e7eb',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>{r.ride_type || 'Economy'} • Rs. {r.fare}</span>
                      <span style={{ color: '#15803d' }}>{r.status}</span>
                    </div>
                    <div style={{ marginTop: '4px', color: '#374151' }}>
                      {r.pickup_address} → {r.dropoff_address}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'offers' && (
            <div style={{ padding: '12px' }}>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '14px', border: '1px solid #dcfce7' }}>
                <h3 style={{ margin: '0 0 8px', color: '#15803d', fontSize: '15px' }}>EasyDrive Rates & Plans</h3>
                <p style={{ fontSize: '13px', margin: '0 0 6px' }}>• Economy: Rs. 320 | Business: Rs. 520</p>
                <p style={{ fontSize: '13px', margin: '0 0 6px' }}>• Driver Monthly Subscription: PKR 3,000 (JazzCash / Easypaisa)</p>
                <p style={{ fontSize: '13px', margin: 0 }}>• Platform Commission: 2% per ride</p>
              </div>
            </div>
          )}

          {tab === 'profile' && (
            <div style={{ padding: '12px' }}>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '14px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '15px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <LogIn size={16} color="#16a34a" /> Passenger Login
                </h3>
                <input
                  value={passengerAuth.name}
                  onChange={(e) => setPassengerAuth({ ...passengerAuth, name: e.target.value })}
                  placeholder="Full Name"
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '8px', fontSize: '13px' }}
                />
                <input
                  value={passengerAuth.phone}
                  onChange={(e) => setPassengerAuth({ ...passengerAuth, phone: e.target.value })}
                  placeholder="Mobile Number (03XX-...)"
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '10px', fontSize: '13px' }}
                />
                <button
                  onClick={() => {
                    setPassengerAuth({ ...passengerAuth, loggedIn: true });
                    setNotice(`Logged in as ${passengerAuth.name}`);
                  }}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#16a34a',
                    color: '#fff',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {passengerAuth.loggedIn ? 'Update Passenger Session' : 'Login as Passenger'}
                </button>
              </div>
            </div>
          )}

          {/* Bottom Navigation */}
          <div
            style={{
              position: 'fixed',
              bottom: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '100%',
              maxWidth: '430px',
              background: '#fff',
              borderTop: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-around',
              padding: '7px 0'
            }}
          >
            {[
              { id: 'home', label: 'Home', Icon: Home },
              { id: 'activity', label: 'Activity', Icon: Clock },
              { id: 'offers', label: 'Offers', Icon: Tag },
              { id: 'profile', label: 'Profile', Icon: User }
            ].map(({ id, label, Icon }) => {
              const active = tab === id;
              return (
                <button
                  key={id}
                  onClick={() => setTab(id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: active ? '#16a34a' : '#6b7280',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    fontSize: '11px',
                    fontWeight: active ? 700 : 500,
                    cursor: 'pointer'
                  }}
                >
                  <Icon size={17} />
                  <span>{label}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {/* ==================== 2. DRIVER PORTAL ==================== */}
      {portal === 'driver' && (
        <div style={{ padding: '12px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '14px', border: '1px solid #e5e7eb', marginBottom: '12px' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '15px', color: '#15803d' }}>Driver Login & Vehicle</h3>
            <input
              value={driverAuth.name}
              onChange={(e) => setDriverAuth({ ...driverAuth, name: e.target.value })}
              placeholder="Driver Name"
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '8px', fontSize: '13px' }}
            />
            <input
              value={driverAuth.phone}
              onChange={(e) => setDriverAuth({ ...driverAuth, phone: e.target.value })}
              placeholder="Driver Phone"
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '8px', fontSize: '13px' }}
            />
            <input
              value={driverAuth.vehicle}
              onChange={(e) => setDriverAuth({ ...driverAuth, vehicle: e.target.value })}
              placeholder="Vehicle & Plate (e.g. Toyota Corolla • BKU-7431)"
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '10px', fontSize: '13px' }}
            />
            <button
              onClick={() => {
                setDriverAuth({ ...driverAuth, loggedIn: true });
                setNotice(`Driver ${driverAuth.name} online.`);
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: '#16a34a',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {driverAuth.loggedIn ? 'Driver Online (Saved)' : 'Driver Login / Go Online'}
            </button>
          </div>

          {/* Monthly Subscription PKR 3,000 (JazzCash / Easypaisa) */}
          <form
            onSubmit={handleSubmitSubscription}
            style={{ background: '#fff', borderRadius: '12px', padding: '14px', border: '1px solid #dcfce7', marginBottom: '12px' }}
          >
            <h3 style={{ margin: '0 0 6px', fontSize: '15px', color: '#15803d' }}>
              Monthly Subscription: PKR 3,000
            </h3>
            <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#4b5563' }}>
              Send PKR 3,000 via JazzCash or Easypaisa and enter Transaction ID:
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              {['JazzCash', 'Easypaisa'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setSubMethod(m)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    border: subMethod === m ? '2px solid #16a34a' : '1px solid #d1d5db',
                    background: subMethod === m ? '#dcfce7' : '#fff',
                    fontWeight: 700,
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
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '10px', fontSize: '13px' }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: '#0f172a',
                color: '#fff',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Submit PKR 3,000 Receipt
            </button>
          </form>

          {/* Ride Requests for Driver */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '14px', border: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '15px' }}>Available / Active Rides</h3>
            {ridesHistory.filter((r) => r.status === 'searching' || r.status === 'accepted').length === 0 ? (
              <p style={{ fontSize: '12px', color: '#6b7280' }}>No open ride requests right now.</p>
            ) : (
              ridesHistory
                .filter((r) => r.status === 'searching' || r.status === 'accepted')
                .map((r) => (
                  <div
                    key={r.id}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: '1px solid #e5e7eb',
                      marginBottom: '8px',
                      fontSize: '12px'
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>
                      {r.pickup_address} → {r.dropoff_address} (Rs. {r.fare})
                    </div>
                    <div style={{ color: '#6b7280', margin: '4px 0' }}>
                      Status: <strong>{r.status}</strong> • 2% Fee: Rs. {(Number(r.fare) * 0.02).toFixed(2)}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      {r.status === 'searching' && (
                        <button
                          onClick={() => handleUpdateRideStatus(r.id, 'accepted')}
                          style={{ padding: '6px 10px', borderRadius: '7px', border: 'none', background: '#16a34a', color: '#fff', fontWeight: 700 }}
                        >
                          Accept Ride
                        </button>
                      )}
                      {r.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateRideStatus(r.id, 'completed')}
                          style={{ padding: '6px 10px', borderRadius: '7px', border: 'none', background: '#0f172a', color: '#fff', fontWeight: 700 }}
                        >
                          Complete Ride
                        </button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* ==================== 3. SUPER ADMIN CONTROL PAGE ==================== */}
      {portal === 'admin' && (
        <div style={{ padding: '12px' }}>
          {!adminUnlocked ? (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '16px', border: '1px solid #e5e7eb' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', color: '#0f172a' }}>Super Admin Login</h3>
              <p style={{ margin: '0 0 10px', fontSize: '12px', color: '#6b7280' }}>
                Enter Super Admin PIN (Default demo PIN: <strong>1234</strong>):
              </p>
              <input
                type="password"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Enter Admin PIN"
                style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #d1d5db', marginBottom: '10px', fontSize: '13px' }}
              />
              <button
                onClick={() => {
                  if (adminPin === '1234') {
                    setAdminUnlocked(true);
                    setNotice('Super Admin unlocked.');
                  } else {
                    setNotice('Invalid PIN. Use 1234 for demo.');
                  }
                }}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#0f172a',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Unlock Super Admin Panel
              </button>
            </div>
          ) : (
            <>
              {/* Admin KPIs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Total Rides</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a' }}>{ridesHistory.length}</div>
                </div>
                <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>2% Ride Commission</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803d' }}>Rs. {totalCommission}</div>
                </div>
                <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Active PKR 3,000 Plans</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#15803d' }}>{approvedSubsCount}</div>
                </div>
                <div style={{ background: '#fff', padding: '12px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                  <div style={{ fontSize: '11px', color: '#6b7280' }}>Sub Revenue (Est.)</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
                    PKR {(approvedSubsCount * 3000).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Driver Subscription Approvals */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '12px', border: '1px solid #e5e7eb', marginBottom: '12px' }}>
                <h3 style={{ margin: '0 0 10px', fontSize: '14px' }}>Driver Subscriptions (PKR 3,000)</h3>
                {subscriptions.length === 0 ? (
                  <p style={{ fontSize: '12px', color: '#6b7280' }}>No subscription requests yet.</p>
                ) : (
                  subscriptions.map((s) => (
                    <div
                      key={s.id}
                      style={{
                        padding: '9px',
                        borderRadius: '9px',
                        border: '1px solid #e5e7eb',
                        marginBottom: '8px',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                        <span>{s.payment_method} • PKR {s.amount}</span>
                        <span>{s.status}</span>
                      </div>
                      <div style={{ color: '#4b5563', marginTop: '3px' }}>TID: {s.transaction_id}</div>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '7px' }}>
                        <button
                          onClick={() => handleSubscriptionAction(s.id, 'approved')}
                          style={{
                            padding: '5px 10px',
                            borderRadius: '7px',
                            border: 'none',
                            background: '#16a34a',
                            color: '#fff',
                            fontWeight: 700,
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
                            padding: '5px 10px',
                            borderRadius: '7px',
                            border: 'none',
                            background: '#dc2626',
                            color: '#fff',
                            fontWeight: 700,
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

              {/* All Rides Log */}
              <div style={{ background: '#fff', borderRadius: '12px', padding: '12px', border: '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 8px', fontSize: '14px' }}>All Rides & 2% Fee Log</h3>
                {ridesHistory.map((r) => (
                  <div key={r.id} style={{ padding: '7px 0', borderBottom: '1px solid #f1f5f9', fontSize: '12px' }}>
                    <strong>Rs. {r.fare}</strong> (2% Fee: Rs. {(Number(r.fare) * 0.02).toFixed(2)}) — <span>{r.status}</span>
                    <div style={{ color: '#6b7280' }}>{r.pickup_address} → {r.dropoff_address}</div>
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

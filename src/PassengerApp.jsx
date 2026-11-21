import React, { useEffect, useState } from 'react';
import {
  Car,
  MapPin,
  Navigation,
  Phone,
  Share2,
  User,
  Wallet,
  ChevronRight,
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
  Settings
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

const PALETTES = {
  night: {
    bg: '#090d16',
    card: '#131a29',
    cardAlt: '#1b2438',
    border: '#243049',
    emerald: '#16a34a',
    gold: '#f59e0b',
    accentText: '#fde047',
    text: '#f8fafc',
    muted: '#94a3b8',
    inputBg: '#090d16'
  },
  sunlight: {
    bg: '#f1f5f9',
    card: '#ffffff',
    cardAlt: '#e2e8f0',
    border: '#94a3b8',
    emerald: '#15803d',
    gold: '#d97706',
    accentText: '#b45309',
    text: '#0f172a',
    muted: '#334155',
    inputBg: '#f8fafc'
  }
};

export default function PassengerApp() {
  const [stage, setStage] = useState('splash'); // 'splash' | 'welcome' | 'app'
  const [sunlightMode, setSunlightMode] = useState(false);
  const [view, setView] = useState('hub'); // 'hub' | 'booking' | 'active_ride' | 'menu'
  const [serviceMode, setServiceMode] = useState('Rides');

  const THEME = sunlightMode ? PALETTES.sunlight : PALETTES.night;

  const [phoneInput, setPhoneInput] = useState('');
  const [locationShared, setLocationShared] = useState(true);
  const [passengerAuth, setPassengerAuth] = useState({
    loggedIn: false,
    name: 'Passenger',
    phone: '+92 300 1234567'
  });

  const [pickup, setPickup] = useState('Block 4, Clifton');
  const [dropoff, setDropoff] = useState('Dolmen Mall, Clifton');
  const [selectedType, setSelectedType] = useState('Economy');
  const [paymentMethod, setPaymentMethod] = useState('JazzCash');

  const [currentRide, setCurrentRide] = useState(null);
  const [pastRides, setPastRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const activeFareObj = FARE_OPTIONS.find((f) => f.id === selectedType) || FARE_OPTIONS[0];
  const platformFee = (activeFareObj.fare * 0.02).toFixed(2);

  useEffect(() => {
    const timer = setTimeout(() => {
      setStage((prev) => (prev === 'splash' ? 'welcome' : prev));
    }, 1500);

    fetchPassengerRides();

    // Live real-time listener for ride status updates from Driver App
    const channel = supabase
      .channel('passenger-rides-live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rides' }, (payload) => {
        const updated = payload.new;
        setCurrentRide((prev) => {
          if (prev && prev.id === updated.id) {
            if (updated.status === 'completed' || updated.status === 'cancelled') {
              setNotice(`Ride ${updated.status}!`);
              setView('hub');
              fetchPassengerRides();
              return null;
            }
            setNotice(`Driver update: Ride is now ${updated.status}`);
            return updated;
          }
          return prev;
        });
      })
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchPassengerRides() {
    const { data } = await supabase
      .from('rides')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15);
    if (data) setPastRides(data);
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
          eta_minutes: 3,
          status: 'searching'
        }
      ])
      .select()
      .single();

    setLoading(false);

    if (error) {
      setNotice(`Error: ${error.message}`);
      return;
    }

    setCurrentRide(data);
    setView('active_ride');
    fetchPassengerRides();
  }

  async function handleCancelRide(rideId) {
    await supabase.from('rides').update({ status: 'cancelled' }).eq('id', rideId);
    setCurrentRide(null);
    setView('hub');
    setNotice('Ride cancelled.');
    fetchPassengerRides();
  }

  function handleShareRide() {
    const text = `EasyDrive-Pakistan Ride: ${pickup} to ${dropoff} (Rs. ${activeFareObj.fare}).`;
    if (navigator.share) {
      navigator.share({ title: 'EasyDrive-Pakistan', text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setNotice('Ride link & details copied!');
    }
  }

  if (stage === 'splash') {
    return (
      <div
        onClick={() => setStage('welcome')}
        style={{
          maxWidth: '430px',
          minHeight: '100vh',
          margin: '0 auto',
          background: 'linear-gradient(160deg, #065f46 0%, #16a34a 60%, #064e3b 100%)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          cursor: 'pointer'
        }}
      >
        <div style={{ textAlign: 'center', fontSize: '34px', fontWeight: 900, fontStyle: 'italic' }}>
          EASYDRIVE
          <span style={{ display: 'block', fontSize: '18px', color: '#fde047', letterSpacing: '2px' }}>
            PAKISTAN
          </span>
        </div>
      </div>
    );
  }

  if (stage === 'welcome') {
    return (
      <div
        style={{
          maxWidth: '430px',
          minHeight: '100vh',
          margin: '0 auto',
          background: THEME.bg,
          color: THEME.text,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '28px 20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '20px', fontWeight: 900, fontStyle: 'italic', color: THEME.emerald }}>
          EASYDRIVE-PAKISTAN
        </div>

        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, lineHeight: 1.12, margin: '0 0 10px' }}>
            TRUSTED AND AFFORDABLE <span style={{ color: THEME.emerald }}>RIDES</span>
          </h1>
          <p style={{ fontSize: '13px', color: THEME.muted, margin: '0 0 18px' }}>
            Fast pickup across Karachi • Cash, JazzCash & Easypaisa accepted
          </p>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
            <input
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+92 300 0000000"
              style={{
                flex: 1,
                padding: '13px',
                borderRadius: '12px',
                border: `1.5px solid ${THEME.border}`,
                background: THEME.card,
                color: THEME.text,
                fontSize: '14px'
              }}
            />
          </div>

          <button
            onClick={() => {
              if (phoneInput.trim()) {
                setPassengerAuth({ ...passengerAuth, loggedIn: true, phone: phoneInput.trim() });
              }
              setStage('app');
            }}
            style={{
              width: '100%',
              padding: '15px',
              borderRadius: '14px',
              border: 'none',
              background: THEME.emerald,
              color: '#fff',
              fontSize: '16px',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            Continue with phone number
          </button>
        </div>

        <div style={{ fontSize: '11px', color: THEME.muted, textAlign: 'center' }}>
          EasyDrive-Pakistan Passenger App • Safe & Verified Rides
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '430px',
        minHeight: '100vh',
        margin: '0 auto',
        background: THEME.bg,
        color: THEME.text,
        padding: '12px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <button
          onClick={() => setView(view === 'menu' ? 'hub' : 'menu')}
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
            {locationShared ? `Your location • ${pickup}` : 'GPS Off'}
          </div>
        </div>

        <button
          onClick={() => setSunlightMode((p) => !p)}
          style={{
            padding: '7px 9px',
            borderRadius: '9px',
            border: `1px solid ${THEME.border}`,
            background: THEME.card,
            color: THEME.accentText,
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
            marginBottom: '10px',
            padding: '10px 12px',
            borderRadius: '10px',
            background: sunlightMode ? '#dcfce7' : '#064e3b',
            border: `1px solid ${THEME.emerald}`,
            color: sunlightMode ? '#14532d' : '#dcfce7',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>{notice}</span>
          <button onClick={() => setNotice('')} style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 900 }}>
            ×
          </button>
        </div>
      )}

      {/* MENU VIEW */}
      {view === 'menu' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ background: THEME.card, borderRadius: '16px', padding: '14px', border: `1.5px solid ${THEME.border}` }}>
            <div style={{ fontSize: '15px', fontWeight: 900 }}>
              {passengerAuth.loggedIn ? passengerAuth.phone : 'Log in or register'}
            </div>
            <div style={{ fontSize: '12px', color: THEME.muted, marginTop: '3px' }}>
              Total Past Rides: {pastRides.length}
            </div>
          </div>

          {[
            { label: 'Discounts', sub: 'Enter promo code', Icon: Tag, action: () => setNotice('Promo EASY20 applied!') },
            { label: 'Payment methods', sub: `Active: ${paymentMethod}`, Icon: Wallet, action: () => setView('booking') },
            { label: 'Support', sub: '24/7 Passenger Help', Icon: Headphones, action: () => setNotice('Support connected!') },
            { label: 'Safety', sub: 'Share live trip details', Icon: Shield, action: handleShareRide },
            { label: 'Display Mode', sub: sunlightMode ? 'Sunlight Clear Mode' : 'Night Dark Mode', Icon: Settings, action: () => setSunlightMode((p) => !p) }
          ].map((row, idx) => (
            <div
              key={idx}
              onClick={row.action}
              style={{
                background: THEME.card,
                borderRadius: '14px',
                padding: '12px 14px',
                border: `1.5px solid ${THEME.border}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
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

      {/* HUB VIEW */}
      {view === 'hub' && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
            {[
              { id: 'Shop', label: 'Shop', sub: 'Quick delivery', Icon: ShoppingBag },
              { id: 'Moto', label: 'Moto', sub: 'Fast bike rides', Icon: Bike },
              { id: 'Transport', label: 'Transport', sub: 'City routes', Icon: Truck },
              { id: 'Rides', label: 'Rides', sub: 'from 3 min', Icon: Car }
            ].map((tile) => (
              <div
                key={tile.id}
                onClick={() => {
                  setServiceMode(tile.id);
                  setView('booking');
                }}
                style={{
                  background: serviceMode === tile.id ? (sunlightMode ? '#dcfce7' : '#064e3b') : THEME.card,
                  border: serviceMode === tile.id ? `2px solid ${THEME.emerald}` : `1.5px solid ${THEME.border}`,
                  borderRadius: '16px',
                  padding: '12px',
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 900 }}>{tile.label}</span>
                  <tile.Icon size={20} color={THEME.emerald} />
                </div>
                <div style={{ fontSize: '11px', color: THEME.muted, marginTop: '6px' }}>{tile.sub}</div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setView('booking')}
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

          <div style={{ background: THEME.card, borderRadius: '16px', padding: '10px 12px', border: `1.5px solid ${THEME.border}` }}>
            {QUICK_DESTINATIONS.map((dest, idx) => (
              <div
                key={idx}
                onClick={() => {
                  setDropoff(dest.title);
                  setView('booking');
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

      {/* BOOKING VIEW */}
      {view === 'booking' && (
        <>
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: `1.5px solid ${THEME.border}`, marginBottom: '10px' }}>
            <MapView height="165px" />
          </div>

          <div style={{ background: THEME.card, borderRadius: '16px', padding: '12px', border: `1.5px solid ${THEME.border}`, marginBottom: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <MapPin size={16} color={THEME.emerald} />
              <input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Pickup"
                style={{ flex: 1, background: THEME.inputBg, border: `1px solid ${THEME.border}`, color: THEME.text, borderRadius: '9px', padding: '8px', fontSize: '13px' }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Navigation size={16} color="#dc2626" />
              <input
                value={dropoff}
                onChange={(e) => setDropoff(e.target.value)}
                placeholder="Destination"
                style={{ flex: 1, background: THEME.inputBg, border: `1px solid ${THEME.border}`, color: THEME.text, borderRadius: '9px', padding: '8px', fontSize: '13px' }}
              />
            </div>
          </div>

          <form onSubmit={handleRequestRide}>
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
                    <span style={{ display: 'inline-block', background: THEME.emerald, color: '#fff', fontSize: '10px', fontWeight: 800, padding: '2px 7px', borderRadius: '999px', marginBottom: '5px' }}>
                      {item.eta}
                    </span>
                    <div style={{ fontSize: '13px', fontWeight: 900 }}>{item.label}</div>
                    <div style={{ fontSize: '14px', fontWeight: 900, color: THEME.accentText, marginTop: '3px' }}>
                      Rs. {item.fare}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: '7px', marginBottom: '10px' }}>
              {PAYMENT_METHODS.map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '10px',
                    border: paymentMethod === method ? `2px solid ${THEME.emerald}` : `1.5px solid ${THEME.border}`,
                    background: paymentMethod === method ? (sunlightMode ? '#dcfce7' : '#064e3b') : THEME.card,
                    color: THEME.text,
                    fontSize: '12px',
                    fontWeight: 800
                  }}
                >
                  {method}
                </button>
              ))}
            </div>

            <div style={{ background: THEME.card, border: `1.5px solid ${THEME.border}`, borderRadius: '14px', padding: '10px 12px', marginBottom: '10px', fontSize: '12px' }}>
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
              {loading ? 'Requesting...' : 'Request Ride'}
            </button>
          </form>
        </>
      )}

      {/* ACTIVE RIDE VIEW */}
      {view === 'active_ride' && currentRide && (
        <div>
          <div style={{ background: THEME.emerald, color: '#fff', padding: '14px', borderRadius: '14px', marginBottom: '10px' }}>
            <div style={{ fontSize: '17px', fontWeight: 900 }}>
              {currentRide.status === 'searching' ? 'Finding Nearby Driver...' : 'Driver Accepted! On the Way'}
            </div>
            <div style={{ fontSize: '12px' }}>
              Status: {currentRide.status.toUpperCase()} • ETA {currentRide.eta_minutes || 3} min
            </div>
          </div>

          <MapView height="185px" />

          <div style={{ background: THEME.card, borderRadius: '14px', padding: '12px', marginTop: '10px', border: `1.5px solid ${THEME.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 900, fontSize: '15px' }}>{currentRide.driver_name || 'Assigning Driver...'}</div>
              <div style={{ fontSize: '12px', color: THEME.emerald, fontWeight: 800 }}>
                {currentRide.vehicle_info || 'Waiting for driver acceptance'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setNotice('Calling driver...')} style={{ padding: '8px', borderRadius: '50%', border: `1px solid ${THEME.border}`, background: THEME.cardAlt, color: THEME.text }}>
                <Phone size={16} />
              </button>
              <button onClick={handleShareRide} style={{ padding: '8px', borderRadius: '50%', border: `1px solid ${THEME.border}`, background: THEME.cardAlt, color: THEME.text }}>
                <Share2 size={16} />
              </button>
            </div>
          </div>

          <button
            onClick={() => handleCancelRide(currentRide.id)}
            style={{
              width: '100%',
              marginTop: '10px',
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
        </div>
      )}
    </div>
  );
}

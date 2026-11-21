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
  Wallet
} from 'lucide-react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import MapView from './components/MapView';
import { supabase } from './lib/supabase';

const FARE_OPTIONS = [
  { id: 'Economy', label: 'Economy', seats: '4 seats', fare: 320 },
  { id: 'Business', label: 'Business', seats: '4 seats', fare: 520 }
];

const PAYMENT_METHODS = ['Cash', 'JazzCash', 'Easypaisa'];

export default function App() {
  const [screen, setScreen] = useState('welcome'); // 'welcome' | 'booking' | 'active_ride'
  const [tab, setTab] = useState('home'); // 'home' | 'activity' | 'offers' | 'profile'

  const [pickup, setPickup] = useState('Clifton, Karachi');
  const [dropoff, setDropoff] = useState('Dolmen Mall, Clifton');
  const [selectedType, setSelectedType] = useState('Economy');
  const [paymentMethod, setPaymentMethod] = useState('JazzCash');

  const [currentRide, setCurrentRide] = useState(null);
  const [ridesHistory, setRidesHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');

  const activeFareObj = FARE_OPTIONS.find((f) => f.id === selectedType) || FARE_OPTIONS[0];
  const platformFee = (activeFareObj.fare * 0.02).toFixed(2);

  useEffect(() => {
    fetchRides();
  }, []);

  async function fetchRides() {
    const { data, error } = await supabase
      .from('rides')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (!error && data) {
      setRidesHistory(data);
    }
  }

  async function handleRequestRide(e) {
    e.preventDefault();
    setLoading(true);
    setNotice('');

    // Demo passenger UUID for quick testing without login blocker
    const demoPassengerId = '00000000-0000-0000-0000-000000000001';

    const { data, error } = await supabase
      .from('rides')
      .insert([
        {
          passenger_id: demoPassengerId,
          pickup_address: pickup,
          dropoff_address: dropoff,
          fare: activeFareObj.fare,
          ride_type: activeFareObj.id,
          payment_method: paymentMethod,
          driver_name: 'Ali Raza',
          driver_rating: 4.9,
          vehicle_info: 'Toyota Corolla • BKU-7431',
          eta_minutes: 2,
          status: 'accepted'
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
    fetchRides();
  }

  async function handleCancelRide() {
    if (!currentRide) return;
    await supabase
      .from('rides')
      .update({ status: 'cancelled' })
      .eq('id', currentRide.id);

    setCurrentRide(null);
    setScreen('booking');
    setNotice('Ride cancelled.');
    fetchRides();
  }

  async function handleCompleteRide() {
    if (!currentRide) return;
    await supabase
      .from('rides')
      .update({ status: 'completed' })
      .eq('id', currentRide.id);

    setCurrentRide(null);
    setScreen('booking');
    setTab('activity');
    setNotice('Ride completed! 2% platform fee recorded.');
    fetchRides();
  }

  function handleShareRide() {
    const text = `EasyDrive-Pakistan Live Ride: ${pickup} to ${dropoff} (Rs. ${activeFareObj.fare}).`;
    if (navigator.share) {
      navigator.share({ title: 'EasyDrive-Pakistan', text }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setNotice('Ride details copied to clipboard!');
    }
  }

  // 1. WELCOME SCREEN (Matches left phone in graphic)
  if (screen === 'welcome') {
    return (
      <div
        style={{
          maxWidth: '430px',
          minHeight: '100vh',
          margin: '0 auto',
          background: 'linear-gradient(180deg, #16a34a 0%, #15803d 65%, #f0fdf4 100%)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '28px 20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center', marginTop: '36px' }}>
          <div
            style={{
              width: '84px',
              height: '84px',
              borderRadius: '24px',
              background: '#fff',
              color: '#15803d',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 18px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.18)'
            }}
          >
            <Car size={42} />
          </div>
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 800 }}>EasyDrive-Pakistan</h1>
          <p style={{ margin: '8px 0 0', fontSize: '16px', opacity: 0.95 }}>
            Apke Safar Main Humsafar
          </p>
          <span
            style={{
              display: 'inline-block',
              marginTop: '14px',
              padding: '6px 14px',
              borderRadius: '999px',
              background: 'rgba(255,255,255,0.2)',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            Karachi • Safe & Affordable Rides
          </span>
        </div>

        <button
          onClick={() => setScreen('booking')}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '14px',
            border: 'none',
            background: '#16a34a',
            color: '#fff',
            fontSize: '17px',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 8px 20px rgba(21,128,61,0.35)',
            outline: '2px solid #fff'
          }}
        >
          Get Started →
        </button>
      </div>
    );
  }

  // 2. ACTIVE RIDE SCREEN (Matches right phone in graphic)
  if (screen === 'active_ride' && currentRide) {
    return (
      <div
        style={{
          maxWidth: '430px',
          minHeight: '100vh',
          margin: '0 auto',
          background: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          paddingBottom: '24px'
        }}
      >
        <div style={{ background: '#15803d', color: '#fff', padding: '16px 18px' }}>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>Your Ride is on the Way</div>
          <div style={{ fontSize: '13px', opacity: 0.9 }}>
            Driver arriving in {currentRide.eta_minutes || 2} min (500 m)
          </div>
        </div>

        <div style={{ padding: '14px' }}>
          <MapView height="210px" />

          {/* Driver Card */}
          <div
            style={{
              background: '#fff',
              borderRadius: '14px',
              padding: '14px',
              marginTop: '12px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px', color: '#111827' }}>
                {currentRide.driver_name || 'Ali Raza'}
              </div>
              <div style={{ fontSize: '13px', color: '#15803d', fontWeight: 600 }}>
                ★ {currentRide.driver_rating || 4.9}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                {currentRide.vehicle_info || 'Toyota Corolla • BKU-7431'}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => setNotice('Calling driver...')}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid #dcfce7',
                  background: '#f0fdf4',
                  color: '#15803d',
                  cursor: 'pointer'
                }}
              >
                <Phone size={18} />
              </button>
              <button
                onClick={() => setNotice('Chat opened with driver.')}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  border: '1px solid #dcfce7',
                  background: '#f0fdf4',
                  color: '#15803d',
                  cursor: 'pointer'
                }}
              >
                <MessageCircle size={18} />
              </button>
            </div>
          </div>

          {/* Trip Summary */}
          <div
            style={{
              background: '#fff',
              borderRadius: '14px',
              padding: '14px',
              marginTop: '12px',
              fontSize: '13px',
              color: '#374151',
              boxShadow: '0 2px 10px rgba(0,0,0,0.06)'
            }}
          >
            <div><strong>Pickup:</strong> {currentRide.pickup_address}</div>
            <div style={{ marginTop: '4px' }}><strong>Dropoff:</strong> {currentRide.dropoff_address}</div>
            <div style={{ marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Fare:</strong> Rs. {currentRide.fare} ({currentRide.payment_method})</span>
              <span style={{ color: '#15803d', fontWeight: 600 }}>
                2% Fee: Rs. {(Number(currentRide.fare) * 0.02).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
            <button
              onClick={handleShareRide}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: '1px solid #16a34a',
                background: '#fff',
                color: '#15803d',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <Share2 size={16} /> Share Ride
            </button>
            <button
              onClick={handleCancelRide}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                border: 'none',
                background: '#dc2626',
                color: '#fff',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer'
              }}
            >
              <XCircle size={16} /> Cancel Ride
            </button>
          </div>

          <button
            onClick={handleCompleteRide}
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '13px',
              borderRadius: '12px',
              border: 'none',
              background: '#16a34a',
              color: '#fff',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            <CheckCircle2 size={17} /> Complete Trip
          </button>

          {notice && (
            <div style={{ marginTop: '10px', fontSize: '13px', color: '#15803d', textAlign: 'center' }}>
              {notice}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. MAIN BOOKING + TABS SCREEN (Matches center phone in graphic)
  return (
    <div
      style={{
        maxWidth: '430px',
        minHeight: '100vh',
        margin: '0 auto',
        background: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        paddingBottom: '76px'
      }}
    >
      {/* Header */}
      <div
        style={{
          background: '#fff',
          padding: '12px 16px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Car size={22} color="#16a34a" />
          <div>
            <div style={{ fontWeight: 800, fontSize: '15px', color: '#15803d' }}>
              EasyDrive-Pakistan
            </div>
            <div style={{ fontSize: '11px', color: '#6b7280' }}>Apke Safar Main Humsafar</div>
          </div>
        </div>
        <button
          onClick={() => setScreen('welcome')}
          style={{
            border: '1px solid #dcfce7',
            background: '#f0fdf4',
            color: '#15803d',
            borderRadius: '8px',
            padding: '5px 10px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Intro
        </button>
      </div>

      {notice && (
        <div
          style={{
            margin: '10px 14px 0',
            padding: '10px 12px',
            borderRadius: '10px',
            background: '#dcfce7',
            color: '#14532d',
            fontSize: '13px',
            fontWeight: 600
          }}
        >
          {notice}
        </div>
      )}

      {tab === 'home' && (
        <div style={{ padding: '12px 14px' }}>
          {/* Location Inputs */}
          <div
            style={{
              background: '#fff',
              borderRadius: '14px',
              padding: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
              marginBottom: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <MapPin size={16} color="#16a34a" />
              <input
                value={pickup}
                onChange={(e) => setPickup(e.target.value)}
                placeholder="Your Location"
                style={{
                  flex: 1,
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 10px',
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
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  padding: '8px 10px',
                  fontSize: '13px'
                }}
              />
            </div>
          </div>

          {/* Map */}
          <MapView height="165px" />

          {/* Ride Categories: Economy Rs. 320 / Business Rs. 520 */}
          <form onSubmit={handleRequestRide} style={{ marginTop: '10px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {FARE_OPTIONS.map((item) => {
                const active = selectedType === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedType(item.id)}
                    style={{
                      background: active ? '#f0fdf4' : '#fff',
                      border: active ? '2px solid #16a34a' : '1px solid #e5e7eb',
                      borderRadius: '12px',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Car size={20} color="#15803d" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#111827' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '12px', color: '#6b7280' }}>{item.seats}</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '15px', color: '#15803d' }}>
                      Rs. {item.fare}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Method: Cash / JazzCash / Easypaisa */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
              {PAYMENT_METHODS.map((method) => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    style={{
                      flex: 1,
                      padding: '8px 6px',
                      borderRadius: '10px',
                      border: isSelected ? '2px solid #16a34a' : '1px solid #e5e7eb',
                      background: isSelected ? '#dcfce7' : '#fff',
                      color: '#111827',
                      fontSize: '12px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    <Wallet size={13} color="#15803d" /> {method}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#4b5563',
                marginTop: '8px',
                padding: '0 4px'
              }}
            >
              <span>Selected: <strong>{activeFareObj.label}</strong></span>
              <span>Platform Fee (2%): <strong>Rs. {platformFee}</strong></span>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '14px',
                borderRadius: '12px',
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
        <div style={{ padding: '14px' }}>
          <h3 style={{ margin: '0 0 10px', fontSize: '16px' }}>Recent Rides</h3>
          {ridesHistory.length === 0 ? (
            <p style={{ fontSize: '13px', color: '#6b7280' }}>No rides recorded yet.</p>
          ) : (
            ridesHistory.map((r) => (
              <div
                key={r.id}
                style={{
                  background: '#fff',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: '8px',
                  border: '1px solid #e5e7eb',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                  <span>{r.ride_type || 'Economy'} • Rs. {r.fare}</span>
                  <span style={{ color: '#15803d' }}>{r.status}</span>
                </div>
                <div style={{ color: '#4b5563', marginTop: '4px' }}>
                  {r.pickup_address} → {r.dropoff_address}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                  Payment: {r.payment_method || 'Cash'} | 2% Fee: Rs. {(Number(r.fare) * 0.02).toFixed(2)}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === 'offers' && (
        <div style={{ padding: '14px' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: '14px',
              padding: '14px',
              border: '1px solid #dcfce7'
            }}
          >
            <h3 style={{ margin: '0 0 8px', color: '#15803d' }}>EasyDrive Partner & Rider Offers</h3>
            <p style={{ fontSize: '13px', color: '#374151', margin: '0 0 8px' }}>
              • <strong>Driver Monthly Plan:</strong> PKR 3,000 / month via JazzCash or Easypaisa.
            </p>
            <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>
              • <strong>Ride Commission:</strong> Only 2% platform fee per trip.
            </p>
          </div>
        </div>
      )}

      {tab === 'profile' && (
        <div style={{ padding: '14px' }}>
          <div
            style={{
              background: '#fff',
              borderRadius: '14px',
              padding: '14px',
              border: '1px solid #e5e7eb'
            }}
          >
            <h3 style={{ margin: '0 0 6px' }}>EasyDrive-Pakistan Account</h3>
            <p style={{ fontSize: '13px', color: '#4b5563', margin: 0 }}>
              City: Karachi • Default Payment: {paymentMethod}
            </p>
          </div>
        </div>
      )}

      {/* Bottom Navigation (Matches graphic: Home, Activity, Offers, Profile) */}
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
          padding: '8px 0'
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
              onClick={() => {
                setTab(id);
                setScreen('booking');
              }}
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
              <Icon size={18} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      <SpeedInsights />
    </div>
  );
}
 

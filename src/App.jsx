import React, { useState } from 'react';
import MapComponent from './MapComponent';

export default function App() {
  const [activePortal, setActivePortal] = useState('passenger');
  const [pickup, setPickup] = useState('Dolmen Mall Clifton, Karachi');
  const [dropoff, setDropoff] = useState('Jinnah International Airport');
  const [selectedCategory, setSelectedCategory] = useState('Comfy (AC)');
  const [rideRequested, setRideRequested] = useState(false);
  const [driverOnline, setDriverOnline] = useState(true);

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '10px', maxWidth: '480px', margin: '0 auto' }}>
      
      {/* Top Main Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <button 
          onClick={() => setActivePortal('passenger')} 
          style={{ 
            flex: 1, 
            padding: '12px', 
            borderRadius: '10px', 
            border: 'none', 
            fontWeight: 'bold', 
            backgroundColor: activePortal === 'passenger' ? '#1d4ed8' : '#e2e8f0', 
            color: activePortal === 'passenger' ? 'white' : '#475569',
            fontSize: '14px',
            boxShadow: activePortal === 'passenger' ? '0 4px 6px -1px rgba(29, 78, 216, 0.3)' : 'none'
          }}>
          🔵 Passenger App (Blue)
        </button>
        <button 
          onClick={() => setActivePortal('driver')} 
          style={{ 
            flex: 1, 
            padding: '12px', 
            borderRadius: '10px', 
            border: 'none', 
            fontWeight: 'bold', 
            backgroundColor: activePortal === 'driver' ? '#15803d' : '#e2e8f0', 
            color: activePortal === 'driver' ? 'white' : '#475569',
            fontSize: '14px',
            boxShadow: activePortal === 'driver' ? '0 4px 6px -1px rgba(21, 128, 61, 0.3)' : 'none'
          }}>
          🟢 Driver App (Green)
        </button>
      </div>

      {/* ==========================================
          PASSENGER INTERFACE (BLUE THEME)
         ========================================== */}
      {activePortal === 'passenger' && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', borderTop: '6px solid #2563eb', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          
          {/* Visual Header / Banner */}
          <div style={{ backgroundColor: '#eff6ff', padding: '14px', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: '0 0 4px 0', color: '#1e3a8a', fontSize: '18px' }}>EasyDrive Rider</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#3b82f6' }}>Book your ride across Karachi instantly</p>
            </div>
            <div style={{ fontSize: '32px', background: '#dbeafe', padding: '8px', borderRadius: '50%' }}>
              🚪🚗
            </div>
          </div>

          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Pickup Location</label>
          <input 
            type="text" 
            value={pickup} 
            onChange={(e) => setPickup(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '6px 0 12px 0', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }} 
          />

          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569' }}>Drop-off Location</label>
          <input 
            type="text" 
            value={dropoff} 
            onChange={(e) => setDropoff(e.target.value)}
            style={{ width: '100%', padding: '12px', margin: '6px 0 16px 0', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '14px' }} 
          />

          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '8px' }}>Select Vehicle Category</label>
          
          <div 
            onClick={() => setSelectedCategory('Mini (Suzuki Alto)')}
            style={{ padding: '12px', marginBottom: '8px', borderRadius: '8px', border: selectedCategory === 'Mini (Suzuki Alto)' ? '2px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: selectedCategory === 'Mini (Suzuki Alto)' ? '#eff6ff' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div><strong>Mini (Suzuki Alto)</strong><div style={{ fontSize: '11px', color: '#64748b' }}>Rs. 50/km + Pickup charge</div></div>
            <span style={{ fontWeight: 'bold', color: '#2563eb' }}>Rs. 650</span>
          </div>

          <div 
            onClick={() => setSelectedCategory('Comfy (AC)')}
            style={{ padding: '12px', marginBottom: '16px', borderRadius: '8px', border: selectedCategory === 'Comfy (AC)' ? '2px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: selectedCategory === 'Comfy (AC)' ? '#eff6ff' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div><strong>Comfy (AC Sedan)</strong><div style={{ fontSize: '11px', color: '#64748b' }}>Rs. 70/km + AC comfort</div></div>
            <span style={{ fontWeight: 'bold', color: '#2563eb' }}>Rs. 950</span>
          </div>

          {!rideRequested ? (
            <button 
              onClick={() => setRideRequested(true)}
              style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 6px rgba(37, 99, 235, 0.3)' }}>
              Request {selectedCategory}
            </button>
          ) : (
            <div style={{ textAlign: 'center', padding: '14px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
              <p style={{ color: '#1e40af', fontWeight: 'bold', margin: '0 0 8px 0' }}>Searching nearby drivers within 3km...</p>
              <button onClick={() => setRideRequested(false)} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', fontSize: '12px', cursor: 'pointer' }}>Cancel Request</button>
            </div>
          )}

          <div style={{ marginTop: '16px' }}>
            <MapComponent />
          </div>
        </div>
      )}

      {/* ==========================================
          DRIVER INTERFACE (GREEN THEME)
         ========================================== */}
      {activePortal === 'driver' && (
        <div style={{ backgroundColor: 'white', borderRadius: '12px', borderTop: '6px solid #16a34a', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
          
          {/* Visual Header with Money Indicator */}
          <div style={{ backgroundColor: '#f0fdf4', padding: '14px', borderRadius: '10px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ margin: '0 0 2px 0', color: '#166534', fontSize: '18px' }}>EasyDrive Driver</h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#15803d' }}>Today's Earnings: <strong>Rs. 3,450</strong></p>
            </div>
            <div style={{ fontSize: '32px', background: '#dcfce7', padding: '8px', borderRadius: '50%', textAlign: 'center' }}>
              💵👨‍✈️
            </div>
          </div>

          {/* Online / Offline Toggle Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>Status: {driverOnline ? 'Online & Receiving Rides' : 'Offline'}</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>Priority Score: 100/100 (Normal)</div>
            </div>
            <button 
              onClick={() => setDriverOnline(!driverOnline)}
              style={{ backgroundColor: driverOnline ? '#16a34a' : '#64748b', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>
              {driverOnline ? 'GO OFFLINE' : 'GO ONLINE'}
            </button>
          </div>

          {driverOnline ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h4 style={{ margin: 0, color: '#1e293b', fontSize: '14px' }}>Incoming Ride Dispatch (20s Timer)</h4>
                <span style={{ fontSize: '11px', color: '#d97706', fontWeight: 'bold' }}>Radius: 3.2 km</span>
              </div>

              <div style={{ border: '2px solid #bbf7d0', backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', marginBottom: '14px' }}>
                <p style={{ margin: '2px 0', fontSize: '13px' }}><strong>Pickup:</strong> {pickup}</p>
                <p style={{ margin: '2px 0 8px 0', fontSize: '13px' }}><strong>Drop-off:</strong> {dropoff}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '10px', color: '#166534', fontWeight: 'bold' }}>
                  <span>Estimated Fare: Rs. 650</span>
                  <span>Pickup Rate: Rs. 30/km</span>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{ flex: 1, backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Accept Ride</button>
                  <button style={{ flex: 1, backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Skip / Reject</button>
                </div>
              </div>

              {/* Financial & Tax Summary */}
              <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Financial Ledger (20-Ride Cycle)</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span>Completed Rides: 14 / 20</span>
                  <span style={{ color: '#d97706', fontWeight: 'bold' }}>2% Liability: Rs. 280</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '14px' }}>
              You are currently offline. Tap "Go Online" to start receiving ride requests in Karachi.
            </div>
          )}

        </div>
      )}

    </div>
  );
}

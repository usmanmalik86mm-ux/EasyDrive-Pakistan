import React, { useState } from 'react';
import MapComponent from './MapComponent';

export default function App() {
  const [activeTab, setActiveTab] = useState('passenger');
  const [pickup, setPickup] = useState('Dolmen Mall Clifton, Karachi');
  const [dropoff, setDropoff] = useState('Jinnah International Airport');
  const [selectedRide, setSelectedRide] = useState('Mini (Suzuki Alto)');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '12px', maxWidth: '480px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ backgroundColor: '#0f172a', color: 'white', padding: '16px', borderRadius: '12px', marginBottom: '16px', textAlign: 'center' }}>
        <h2 style={{ margin: '0 0 4px 0', fontSize: '20px' }}>EasyDrive Pakistan</h2>
        <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>Karachi Ride-Hailing Portal • <span style={{ color: '#22c55e', fontWeight: 'bold' }}>LIVE</span></p>
      </div>

      {/* Portal Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button 
          onClick={() => setActiveTab('passenger')} 
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', backgroundColor: activeTab === 'passenger' ? '#2563eb' : '#e2e8f0', color: activeTab === 'passenger' ? 'white' : '#334155' }}>
          Passenger
        </button>
        <button 
          onClick={() => setActiveTab('driver')} 
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', backgroundColor: activeTab === 'driver' ? '#2563eb' : '#e2e8f0', color: activeTab === 'driver' ? 'white' : '#334155' }}>
          Driver
        </button>
        <button 
          onClick={() => setActiveTab('admin')} 
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontWeight: 'bold', backgroundColor: activeTab === 'admin' ? '#2563eb' : '#e2e8f0', color: activeTab === 'admin' ? 'white' : '#334155' }}>
          Admin
        </button>
      </div>

      {/* --- PASSENGER PORTAL --- */}
      {activeTab === 'passenger' && (
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>Book a Ride</h3>
          
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Pickup Location</label>
          <input 
            type="text" 
            value={pickup} 
            onChange={(e) => setPickup(e.target.value)}
            style={{ width: '100%', padding: '10px', margin: '6px 0 12px 0', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
          />

          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b' }}>Drop-off Location</label>
          <input 
            type="text" 
            value={dropoff} 
            onChange={(e) => setDropoff(e.target.value)}
            style={{ width: '100%', padding: '10px', margin: '6px 0 16px 0', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
          />

          <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '8px' }}>Select Ride Category</label>
          
          <div 
            onClick={() => setSelectedRide('Bike')}
            style={{ padding: '12px', marginBottom: '8px', borderRadius: '8px', border: selectedRide === 'Bike' ? '2px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: selectedRide === 'Bike' ? '#eff6ff' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div><strong>Bike</strong><div style={{ fontSize: '11px', color: '#64748b' }}>Affordable solo commute</div></div>
            <span style={{ fontWeight: 'bold', color: '#16a34a' }}>Rs. 220</span>
          </div>

          <div 
            onClick={() => setSelectedRide('Mini (Suzuki Alto)')}
            style={{ padding: '12px', marginBottom: '8px', borderRadius: '8px', border: selectedRide === 'Mini (Suzuki Alto)' ? '2px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: selectedRide === 'Mini (Suzuki Alto)' ? '#eff6ff' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div><strong>Mini (Suzuki Alto)</strong><div style={{ fontSize: '11px', color: '#64748b' }}>Compact & economical</div></div>
            <span style={{ fontWeight: 'bold', color: '#16a34a' }}>Rs. 650</span>
          </div>

          <div 
            onClick={() => setSelectedRide('Comfy AC')}
            style={{ padding: '12px', marginBottom: '16px', borderRadius: '8px', border: selectedRide === 'Comfy AC' ? '2px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: selectedRide === 'Comfy AC' ? '#eff6ff' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div><strong>Comfy AC (Sedan)</strong><div style={{ fontSize: '11px', color: '#64748b' }}>Comfortable air-conditioned ride</div></div>
            <span style={{ fontWeight: 'bold', color: '#16a34a' }}>Rs. 950</span>
          </div>

          {!bookingConfirmed ? (
            <button 
              onClick={() => setBookingConfirmed(true)}
              style={{ width: '100%', backgroundColor: '#16a34a', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer' }}>
              Confirm {selectedRide}
            </button>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
              <p style={{ color: '#166534', fontWeight: 'bold', margin: '0 0 8px 0' }}>Booking Confirmed! Finding nearest driver...</p>
              <button onClick={() => setBookingConfirmed(false)} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontSize: '12px' }}>Cancel Ride</button>
            </div>
          )}

          <MapComponent />
        </div>
      )}

      {/* --- DRIVER PORTAL --- */}
      {activeTab === 'driver' && (
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>Driver Workspace</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f1f5f9', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
            <div>
              <strong>Status: Online</strong>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Priority Score: 100 / 100</div>
            </div>
            <span style={{ backgroundColor: '#22c55e', color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>Ready</span>
          </div>

          <h4 style={{ marginBottom: '8px', color: '#334155' }}>Incoming Request Match</h4>
          <div style={{ border: '1px solid #e2e8f0', padding: '12px', borderRadius: '8px', marginBottom: '12px' }}>
            <p style={{ margin: '0 0 6px 0', fontSize: '14px' }}><strong>Pickup:</strong> {pickup}</p>
            <p style={{ margin: '0 0 6px 0', fontSize: '14px' }}><strong>Dropoff:</strong> {dropoff}</p>
            <p style={{ margin: '0 0 12px 0', fontSize: '14px' }}><strong>Estimated Fare:</strong> Rs. 650</p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{ flex: 1, backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold' }}>Accept (20s)</button>
              <button style={{ flex: 1, backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold' }}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADMIN PORTAL --- */}
      {activeTab === 'admin' && (
        <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0, color: '#1e293b' }}>Admin Control Center</h3>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#2563eb' }}>14</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Active Rides</div>
            </div>
            <div style={{ backgroundColor: '#fef3c7', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#d97706' }}>Rs. 4,200</div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>2% Tax Due</div>
            </div>
          </div>

          <h4 style={{ marginBottom: '8px', color: '#334155' }}>Live Monitoring & Pricing Control</h4>
          <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4' }}>
            System ready for rule adjustments, driver dispute audits, and geofence tracking across Karachi zones.
          </p>
        </div>
      )}

    </div>
  );
}

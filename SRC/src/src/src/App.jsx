import React, { useState } from 'react';

export default function App() {
  const [role, setRole] = useState('passenger');
  const [pickup, setPickup] = useState('Dolmen Mall Clifton, Karachi');
  const [dropoff, setDropoff] = useState('Jinnah International Airport');
  const [vehicle, setVehicle] = useState('Mini (Suzuki Alto)');
  const [booked, setBooked] = useState(false);

  const fares = {
    'Bike': 'Rs. 220',
    'Mini (Suzuki Alto)': 'Rs. 650',
    'Go AC (Suzuki Every / Sedan)': 'Rs. 950'
  };

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '480px', margin: '0 auto', padding: '16px', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', backgroundColor: '#0f172a', color: '#fff', padding: '14px 18px', borderRadius: '12px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '20px' }}>EasyDrive Pakistan</h1>
          <span style={{ fontSize: '12px', color: '#38bdf8' }}>Karachi Ride-Hailing Portal</span>
        </div>
        <span style={{ backgroundColor: '#16a34a', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>LIVE</span>
      </header>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['passenger', 'driver', 'admin'].map((tab) => (
          <button
            key={tab}
            onClick={() => { setRole(tab); setBooked(false); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              fontWeight: 'bold',
              textTransform: 'capitalize',
              cursor: 'pointer',
              backgroundColor: role === tab ? '#2563eb' : '#e2e8f0',
              color: role === tab ? '#fff' : '#334155'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {role === 'passenger' && (
        <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ marginTop: 0, fontSize: '18px' }}>Book a Ride</h2>
          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Pickup Location</label>
          <input value={pickup} onChange={(e) => setPickup(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />

          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>Drop-off Location</label>
          <input value={dropoff} onChange={(e) => setDropoff(e.target.value)} style={{ width: '100%', padding: '10px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />

          <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Select Ride Type</label>
          {Object.entries(fares).map(([type, price]) => (
            <div
              key={type}
              onClick={() => setVehicle(type)}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px',
                marginBottom: '8px',
                borderRadius: '8px',
                border: vehicle === type ? '2px solid #2563eb' : '1px solid #e2e8f0',
                backgroundColor: vehicle === type ? '#eff6ff' : '#fff',
                cursor: 'pointer'
              }}
            >
              <strong>{type}</strong>
              <span style={{ color: '#16a34a', fontWeight: 'bold' }}>{price}</span>
            </div>
          ))}

          <button
            onClick={() => setBooked(true)}
            style={{ width: '100%', padding: '14px', marginTop: '12px', backgroundColor: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Confirm {vehicle} ({fares[vehicle]})
          </button>

          {booked && (
            <div style={{ marginTop: '14px', padding: '12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '8px', fontSize: '14px' }}>
              Ride requested from <strong>{pickup}</strong> to <strong>{dropoff}</strong>. Searching nearby captains...
            </div>
          )}
        </div>
      )}

      {role === 'driver' && (
        <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ marginTop: 0, fontSize: '18px' }}>Captain Dashboard</h2>
          <p style={{ color: '#16a34a', fontWeight: 'bold' }}>Status: Online & Accepting Rides</p>
          <div style={{ padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', marginBottom: '12px' }}>
            <div><strong>New Request:</strong> {pickup}</div>
            <div style={{ fontSize: '13px', color: '#64748b', marginTop: '4px' }}>Destination: {dropoff} • Est. Fare: {fares[vehicle]}</div>
            <button onClick={() => alert('Ride Accepted!')} style={{ marginTop: '10px', padding: '8px 14px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}>
              Accept Ride
            </button>
          </div>
        </div>
      )}

      {role === 'admin' && (
        <div style={{ backgroundColor: '#fff', padding: '18px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h2 style={{ marginTop: 0, fontSize: '18px' }}>Admin Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Active Captains</div>
              <strong style={{ fontSize: '20px' }}>42</strong>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f1f5f9', borderRadius: '8px' }}>
              <div style={{ fontSize: '12px', color: '#64748b' }}>Today's Trips</div>
              <strong style={{ fontSize: '20px' }}>186</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


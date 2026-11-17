import React, { useState } from 'react';
import MapComponent from './MapComponent';

export default function App() {
  const [appMode, setAppMode] = useState('select'); // 'select', 'passenger', 'driver', 'admin'
  
  // Passenger states
  const [pickup, setPickup] = useState('Dolmen Mall Clifton, Karachi');
  const [dropoff, setDropoff] = useState('Jinnah International Airport');
  const [selectedCategory, setselectedCategory] = useState('Comfy (AC)');
  const [rideRequested, setRideRequested] = useState(false);

  // Driver states
  const [driverOnline, setDriverOnline] = useState(true);
  const [driverBalance] = useState('Rs. 3,450');

  // Admin Excel-style mock datasets
  const [adminTab, setAdminTab] = useState('driversExcel');
  const [driversData] = useState([
    { id: 'DRV-101', name: 'Ahmed Raza', phone: '0300-1234567', vehicle: 'Toyota Corolla (ABC-123)', category: 'Comfy (AC)', rating: '4.8', status: 'Approved', subscription: 'Paid (Rs. 3000)' },
    { id: 'DRV-102', name: 'Bilal Hussain', phone: '0321-7654321', vehicle: 'Suzuki Alto (XYZ-789)', category: 'Economy', rating: '4.9', status: 'Approved', subscription: 'Paid (Rs. 3000)' },
    { id: 'DRV-103', name: 'Tariq Mehmood', phone: '0333-9876543', vehicle: 'Honda Civic (LE-456)', category: 'Executive', rating: '4.7', status: 'Pending Review', subscription: 'Unpaid' }
  ]);

  const [inProgressRides] = useState([
    {
      id: 'ED-9041',
      passenger: 'Ali Khan (0300-5551122)',
      driverName: 'Ahmed Raza',
      driverPhone: '0300-1234567',
      vehicleReg: 'ABC-123',
      category: 'Comfy (AC)',
      pickup: 'Dolmen Mall Clifton',
      dropoff: 'Airport Terminal 1',
      travelled: '4.5 km',
      remaining: '8.2 km',
      eta: '14 mins',
      fare: 'Rs. 960',
      startTime: 'Today, 05:15 PM'
    }
  ]);

  const [taxLedger] = useState([
    { driver: 'Ahmed Raza', rides: 20, fareTotal: 'Rs. 20,000', taxDue: 'Rs. 400', status: 'Pending' },
    { driver: 'Bilal Hussain', rides: 14, fareTotal: 'Rs. 14,000', taxDue: 'Rs. 280', status: 'Accumulating' }
  ]);

  // Portal Selector Screen if 'select'
  if (appMode === 'select') {
    return (
      <div style={{ fontFamily: 'sans-serif', backgroundColor: '#0f172a', minHeight: '100vh', padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'white' }}>
        <h1 style={{ marginBottom: '8px', fontSize: '24px', textAlign: 'center' }}>EasyDrive Pakistan</h1>
        <p style={{ color: '#94a3b8', marginBottom: '30px', fontSize: '14px', textAlign: 'center' }}>Select portal to launch application interface</p>
        
        <div style={{ width: '100%', maxWidth: '360px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <button 
            onClick={() => setAppMode('passenger')}
            style={{ padding: '16px', backgroundColor: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(37,99,235,0.4)' }}>
            🚪🚗 Launch Passenger App (Blue)
          </button>

          <button 
            onClick={() => setAppMode('driver')}
            style={{ padding: '16px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 4px 12px rgba(22,163,74,0.4)' }}>
            💵👨‍✈️ Launch Driver App (Green)
          </button>

          <button 
            onClick={() => setAppMode('admin')}
            style={{ padding: '16px', backgroundColor: '#475569', color: 'white', border: 'none', borderRadius: '10px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            🔒📊 Launch Admin Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', backgroundColor: '#f1f5f9', minHeight: '100vh', padding: '10px', maxWidth: '500px', margin: '0 auto' }}>
      
      {/* Universal Top Switch Bar Back */}
      <div style={{ backgroundColor: '#1e293b', color: 'white', padding: '10px 14px', borderRadius: '8px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
          {appMode === 'passenger' && '🔵 Passenger Portal'}
          {appMode === 'driver' && '🟢 Driver Portal'}
          {appMode === 'admin' && '🔒 Admin Control Hub'}
        </span>
        <button 
          onClick={() => setAppMode('select')}
          style={{ backgroundColor: '#334155', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>
          Switch Portal
        </button>
      </div>

      {/* ==========================================
          1. PASSENGER APP INTERFACE (BLUE THEME)
         ========================================== */}
      {appMode === 'passenger' && (
        <div style={{ backgroundColor: 'white', borderRadius: '10px', borderTop: '5px solid #2563eb', padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ backgroundColor: '#eff6ff', padding: '12px', borderRadius: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 2px 0', color: '#1e40af', fontSize: '16px' }}>EasyDrive Rider</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#3b82f6' }}>Tap to request reliable Karachi transport</p>
            </div>
            <div style={{ fontSize: '28px', background: '#dbeafe', padding: '6px', borderRadius: '50%' }}>🚪🚗</div>
          </div>

          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>Pickup Location</label>
          <input 
            type="text" 
            value={pickup} 
            onChange={(e) => setPickup(e.target.value)}
            style={{ width: '100%', padding: '10px', margin: '4px 0 10px 0', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '13px' }} 
          />

          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569' }}>Drop-off Location</label>
          <input 
            type="text" 
            value={dropoff} 
            onChange={(e) => setDropoff(e.target.value)}
            style={{ width: '100%', padding: '10px', margin: '4px 0 12px 0', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box', fontSize: '13px' }} 
          />

          <label style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '6px' }}>Select Vehicle Category</label>
          
          <div onClick={() => setselectedCategory('Economy')} style={{ padding: '10px', marginBottom: '6px', borderRadius: '6px', border: selectedCategory === 'Economy' ? '2px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: selectedCategory === 'Economy' ? '#eff6ff' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div><strong style={{ fontSize: '13px' }}>Economy (Non-AC)</strong><div style={{ fontSize: '10px', color: '#64748b' }}>Rs. 50/km + Pickup</div></div>
            <span style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '13px' }}>Rs. 520</span>
          </div>

          <div onClick={() => setselectedCategory('Comfy (AC)')} style={{ padding: '10px', marginBottom: '6px', borderRadius: '6px', border: selectedCategory === 'Comfy (AC)' ? '2px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: selectedCategory === 'Comfy (AC)' ? '#eff6ff' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div><strong style={{ fontSize: '13px' }}>Comfy (AC Sedan)</strong><div style={{ fontSize: '10px', color: '#64748b' }}>Rs. 70/km + Pickup</div></div>
            <span style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '13px' }}>Rs. 960</span>
          </div>

          <div onClick={() => setselectedCategory('Executive')} style={{ padding: '10px', marginBottom: '14px', borderRadius: '6px', border: selectedCategory === 'Executive' ? '2px solid #2563eb' : '1px solid #e2e8f0', backgroundColor: selectedCategory === 'Executive' ? '#eff6ff' : 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
            <div><strong style={{ fontSize: '13px' }}>Executive Class</strong><div style={{ fontSize: '10px', color: '#64748b' }}>Rs. 100/km luxury ride</div></div>
            <span style={{ fontWeight: 'bold', color: '#2563eb', fontSize: '13px' }}>Rs. 1,350</span>
          </div>

          {!rideRequested ? (
            <button 
              onClick={() => setRideRequested(true)}
              style={{ width: '100%', backgroundColor: '#2563eb', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' }}>
              Confirm & Book {selectedCategory}
            </button>
          ) : (
            <div style={{ textAlign: 'center', padding: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px' }}>
              <p style={{ color: '#1e40af', fontWeight: 'bold', margin: '0 0 6px 0', fontSize: '13px' }}>Finding nearest driver (3km radius)...</p>
              <button onClick={() => setRideRequested(false)} style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '4px 10px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>Cancel Request</button>
            </div>
          )}

          <div style={{ marginTop: '12px' }}>
            <MapComponent />
          </div>
        </div>
      )}

      {/* ==========================================
          2. DRIVER APP INTERFACE (GREEN THEME)
         ========================================== */}
      {appMode === 'driver' && (
        <div style={{ backgroundColor: 'white', borderRadius: '10px', borderTop: '5px solid #16a34a', padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <div style={{ backgroundColor: '#f0fdf4', padding: '12px', borderRadius: '8px', marginBottom: '14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 2px 0', color: '#166534', fontSize: '16px' }}>EasyDrive Captain</h3>
              <p style={{ margin: 0, fontSize: '11px', color: '#15803d' }}>Earnings Wallet: <strong>{driverBalance}</strong></p>
            </div>
            <div style={{ fontSize: '28px', background: '#dcfce7', padding: '6px', borderRadius: '50%', textAlign: 'center' }}>💵👨‍✈️</div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155' }}>Status: {driverOnline ? 'Online (Receiving)' : 'Offline'}</div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>Priority Score: 100 / 100</div>
            </div>
            <button 
              onClick={() => setDriverOnline(!driverOnline)}
              style={{ backgroundColor: driverOnline ? '#16a34a' : '#64748b', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '11px', cursor: 'pointer' }}>
              {driverOnline ? 'GO OFFLINE' : 'GO ONLINE'}
            </button>
          </div>

          {driverOnline ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <h4 style={{ margin: 0, color: '#1e293b', fontSize: '13px' }}>Incoming Request (20s Timer)</h4>
                <span style={{ fontSize: '10px', color: '#d97706', fontWeight: 'bold' }}>Radius: 2.5 km</span>
              </div>

              <div style={{ border: '2px solid #bbf7d0', backgroundColor: '#f0fdf4', padding: '10px', borderRadius: '6px', marginBottom: '10px' }}>
                <p style={{ margin: '2px 0', fontSize: '12px' }}><strong>Pickup:</strong> {pickup}</p>
                <p style={{ margin: '2px 0 6px 0', fontSize: '12px' }}><strong>Drop-off:</strong> {dropoff}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px', color: '#166534', fontWeight: 'bold' }}>
                  <span>Fare: Rs. 960</span>
                  <span>Pickup Fee: Rs. 30/km</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button style={{ flex: 1, backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Accept Ride</button>
                  <button style={{ flex: 1, backgroundColor: '#dc2626', color: 'white', border: 'none', padding: '8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}>Skip / Reject</button>
                </div>
              </div>

              <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>20-Ride Tax / Platform Ledger</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span>Completed Rides: 14 / 20</span>
                  <span style={{ color: '#d97706', fontWeight: 'bold' }}>Liability Due: Rs. 280</span>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', color: '#64748b', fontSize: '12px' }}>
              You are currently offline. Tap "Go Online" to receive ride requests.
            </div>
          )}
        </div>
      )}

      {/* ==========================================
          3. ADMIN PORTAL INTERFACE (EXCEL & LIVE MONITORING)
         ========================================== */}
      {appMode === 'admin' && (
        <div style={{ backgroundColor: 'white', borderRadius: '10px', borderTop: '5px solid #0f172a', padding: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '15px', color: '#1e293b' }}>Admin Control & Database Hub</h3>

          {/* Admin Navigation Tabs */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button onClick={() => setAdminTab('driversExcel')} style={{ padding: '6px 8px', borderRadius: '4px', border: 'none', fontSize: '10px', fontWeight: 'bold', backgroundColor: adminTab === 'driversExcel' ? '#0f172a' : '#cbd5e1', color: 'white', whiteSpace: 'nowrap', cursor: 'pointer' }}>
              Drivers Data Sheet
            </button>
            <button onClick={() => setAdminTab('liveRides')} style={{ padding: '6px 8px', borderRadius: '4px', border: 'none', fontSize: '10px', fontWeight: 'bold', backgroundColor: adminTab === 'liveRides' ? '#0f172a' : '#cbd5e1', color: 'white', whiteSpace: 'nowrap', cursor: 'pointer' }}>
              In-Progress Monitoring
            </button>
            <button onClick={() => setAdminTab('taxLedger')} style={{ padding: '6px 8px', borderRadius: '4px', border: 'none', fontSize: '10px', fontWeight: 'bold', backgroundColor: adminTab === 'taxLedger' ? '#0f172a' : '#cbd5e1', color: 'white', whiteSpace: 'nowrap', cursor: 'pointer' }}>
              2% Tax Ledger
            </button>
          </div>

          {/* TAB 1: Drivers Data Sheet (Excel Style Table) */}
          {adminTab === 'driversExcel' && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#334155' }}>Registered Drivers Database</span>
                <span style={{ fontSize: '10px', backgroundColor: '#22c55e', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>Excel View Active</span>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
                      <th style={{ padding: '6px' }}>Driver</th>
                      <th style={{ padding: '6px' }}>Vehicle</th>
                      <th style={{ padding: '6px' }}>Category</th>
                      <th style={{ padding: '6px' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {driversData.map((d, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                        <td style={{ padding: '6px' }}><strong>{d.name}</strong><br/><span style={{ fontSize: '9px', color: '#64748b' }}>{d.phone}</span></td>
                        <td style={{ padding: '6px' }}>{d.vehicle}</td>
                        <td style={{ padding: '6px' }}>{d.category}</td>
                        <td style={{ padding: '6px' }}><span style={{ color: d.status === 'Approved' ? '#16a34a' : '#d97706', fontWeight: 'bold' }}>{d.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: In-Progress Live Rides Monitoring */}
          {adminTab === 'liveRides' && (
            <div>
              <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', color: '#1e293b' }}>Active Fleet GPS Tracking</h4>
              {inProgressRides.map((ride) => (
                <div key={ride.id} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '10px', backgroundColor: '#f8fafc', marginBottom: '8px', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontWeight: 'bold' }}>
                    <span style={{ color: '#2563eb' }}>{ride.id}</span>
                    <span style={{ backgroundColor: '#22c55e', color: 'white', padding: '1px 4px', borderRadius: '3px', fontSize: '9px' }}>LIVE</span>
                  </div>
                  <p style={{ margin: '2px 0' }}><strong>Passenger:</strong> {ride.passenger}</p>
                  <p style={{ margin: '2px 0' }}><strong>Driver:</strong> {ride.driverName} ({ride.driverPhone})</p>
                  <p style={{ margin: '2px 0' }}><strong>Vehicle:</strong> {ride.vehicleReg} [{ride.category}]</p>
                  <p style={{ margin: '2px 0' }}><strong>Route:</strong> {ride.pickup} ➔ {ride.dropoff}</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '2px', marginTop: '6px', backgroundColor: '#e2e8f0', padding: '4px', borderRadius: '4px', textAlign: 'center' }}>
                    <div>Travelled: {ride.travelled}</div>
                    <div>Remaining: {ride.remaining}</div>
                    <div>ETA: {ride.eta}</div>
                  </div>
                </div>
              ))}
              <MapComponent />
            </div>
          )}

          {/* TAB 3: 2% Financial Tax Liability Ledger */}
          {adminTab === 'taxLedger' && (
            <div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '13px', color: '#1e293b' }}>2% Tax & Platform Liability Ledger</h4>
              {taxLedger.map((item, index) => (
                <div key={index} style={{ border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px', marginBottom: '6px', backgroundColor: '#f8fafc', fontSize: '11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', marginBottom: '3px' }}>
                    <span>{item.driver}</span>
                    <span style={{ color: '#d97706' }}>{item.status}</span>
                  </div>
                  <div>Rides Completed: <strong>{item.rides}/20</strong> | Liability Due: <strong style={{ color: '#dc2626' }}>{item.taxDue}</strong></div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}

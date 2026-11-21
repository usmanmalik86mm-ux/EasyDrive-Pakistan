import React, { useState } from 'react';
import {
  Car,
  bike, 
  rickshaw, 
  Transport, 
  User,
  ShieldCheck,
  Sun,
  Moon,
  Camera,
  Mic,
  MapPin,
  Bell,
  Upload,
  Copy,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';

const DIRECT_NUMBER = '03338209526';

const PHOTO_SLOTS = [
  { key: 'front', label: 'Front Side' },
  { key: 'back', label: 'Back Side' },
  { key: 'left', label: 'Left Side' },
  { key: 'right', label: 'Right Side' },
  { key: 'NIC doc', label: 'Front Side' }
  { key: 'NIC doc', label: 'Back Side' }, 
  { key: 'doc', label: 'Vehicle Document Front' },
  { key: 'doc', label: 'Vehicle Document Back Side' }
  { key: 'license', label: 'Driving License Front' }
  { key: 'license', label: 'Driving License Back' }
];

];

export default function App() {
  const [screen, setScreen] = useState('promo'); // 'promo' | 'main'
  const [portal, setPortal] = useState('driver'); // 'driver' | 'passenger' | 'admin'
  const [sunlight, setSunlight] = useState(false); // false = Night Dark, true = Sunlight Clear

  // Driver Registration & Permissions
  const [form, setForm] = useState({
    name: '',
    cnic: '',
    mobile: '',
    regNo: '',
    model: '',
    method: ' Easypaisa, Jazz Cash',
    tid: ''
  });
  const [files, setFiles] = useState({});
  const [perms, setPerms] = useState ({});
  });
  const [driverStatus, setDriverStatus] = useState('new'); // 'new' | 'pending' | 'approved'
  const [welcomeMsg, setWelcomeMsg] = useState('');

  // Passenger Booking
  const [ride, setRide] = useState({
    / Driver Registration & Permissions
  const [form, setForm] = useState({
    name: '',
    cnic: '',
    mobile: '',
    pickup: '...., Karachi',
    dropoff: '....., Karachi',
    fare: ride accept Price 40/km+pickup point till drop off point 60Rs/km',
    requested: True, 
  });

  const [msg, setMsg] = useState('');

  const theme = sunlight
    ? {
        bg: '#f1f5f9',
        card: '#ffffff',
        box: '#e2e8f0',
        border: '#94a3b8',
        text: '#0f172a',
        muted: '#334155',
        green: '#15803d',
        gold: '#d97706'
      }
    : {
        bg: '#090d16',
        card: '#131a29',
        box: '#1b2438',
        border: '#243049',
        text: '#f8fafc',
        muted: '#94a3b8',
        green: '#16a34a',
        gold: '#f59e0b'
      };

  function enablePermissions() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        () => {},
        () => {}
      );
    }
    if ('Notification' in window) {
      Notification.requestPermission().catch(() => {});
    }
    setPerms({ gps: true, notif: true, camera: true, mic: true });
    setMsg('GPS, Notification, Camera aur Mic active ho gaye hain.');
  }

  function handleUpload(key, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles((prev) => ({
      ...prev,
      [key]: { name: file.name, url: URL.createObjectURL(file) }
    }));
    setMsg(`${file.name} upload ho gaya.`);
  }

  function submitRegistration(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.cnic.trim() || !form.mobile.trim() || !form.regNo.trim() || !form.model.trim()) {
      setMsg('Please Name, CNIC, Mobile, Gari ka Number aur Model mukammal bharein.');
      return;
    }
    if (!form.tid.trim()) {
      setMsg(`Please PKR 3,000 (${form.method} -> ${DIRECT_NUMBER}) ki Transaction ID bharein.`);
      return;
    }
    setDriverStatus('pending');
    setMsg('Aapki details aur payment pending mein chali gayi hain. Admin tab se Approve karein.');
  }

  function approveDriver() {
    setDriverStatus('approved');
    setWelcomeMsg('Welcome aboard! Aapka EasyDrive Driver Pro account approve ho gaya hai — Ab Poora Cash Apka!');
    setMsg('Driver approve ho gaya aur "Welcome aboard" message bhej diya gaya hai.');
  }

  if (screen === 'promo') {
    return (
      <div
        style={{
          maxWidth: '430px',
          minHeight: '100vh',
          margin: '0 auto',
          background: 'linear-gradient(180deg, #16a34a 0%, #065f46 65%, #090d16 100%)',
          color: '#fff',
          padding: '28px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center', marginTop: '48px' }}>
          <div style={{ fontSize: '15px', fontWeight: 900, color: '#fde047' }}>EASYDRIVE-PAKISTAN</div>
          <h1 style={{ fontSize: '32px', fontWeight: 900, margin: '12px 0 0' }}>AB POORA CASH APKA</h1>
          <p style={{ fontSize: '13px', color: '#dcfce7', marginTop: '10px' }}>
            PKR 3,000 Monthly Plan • Direct {DIRECT_NUMBER} • 2% Fee
          </p>
        </div>

        <button
          onClick={() => setScreen('main')}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '14px',
            border: 'none',
            background: '#f59e0b',
            color: '#090d16',
            fontSize: '16px',
            fontWeight: 900,
            cursor: 'pointer'
          }}
        >
          Start App →
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '430px',
        minHeight: '100vh',
        margin: '0 auto',
        background: theme.bg,
        color: theme.text,
        padding: '12px',
        fontFamily: 'system-ui, sans-serif',
        paddingBottom: '40px'
      }}
    >
      {/* Top Tabs + Night / Sunlight Switch */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {[
          { id: 'driver', label: 'Driver Pro', Icon: Car },
          { id: 'passenger', label: 'Passenger', Icon: User },
          { id: 'admin', label: 'Admin', Icon: ShieldCheck }
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setPortal(id)}
            style={{
              flex: 1,
              padding: '9px 6px',
              borderRadius: '10px',
              border: portal === id ? 'none' : `1px solid ${theme.border}`,
              background: portal === id ? theme.green : theme.card,
              color: portal === id ? '#fff' : theme.text,
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
        ))}

        <button
          onClick={() => setSunlight((s) => !s)}
          style={{
            padding: '9px 10px',
            borderRadius: '10px',
            border: `1px solid ${theme.border}`,
            background: theme.card,
            color: theme.gold,
            fontSize: '11px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            cursor: 'pointer'
          }}
        >
          {sunlight ? <Moon size={14} /> : <Sun size={14} />}
          {sunlight ? 'Night' : 'Sun'}
        </button>
      </div>

      {welcomeMsg && (
        <div
          style={{
            background: theme.green,
            color: '#fff',
            padding: '12px',
            borderRadius: '12px',
            marginBottom: '10px',
            fontSize: '13px',
            fontWeight: 900,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <CheckCircle2 size={18} />
          <span>{welcomeMsg}</span>
        </div>
      )}

      {msg && (
        <div
          style={{
            background: theme.box,
            border: `1px solid ${theme.border}`,
            padding: '10px 12px',
            borderRadius: '10px',
            marginBottom: '10px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            justifyContent: 'space-between'
          }}
        >
          <span>{msg}</span>
          <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 900 }}>
            ×
          </button>
        </div>
      )}

      {/* ==================== DRIVER PRO ==================== */}
      {portal === 'driver' && (
        <>
          {driverStatus === 'approved' ? (
            <div style={{ background: theme.card, border: `1.5px solid ${theme.green}`, borderRadius: '16px', padding: '16px' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: theme.green }}>Driver Pro Active</div>
              <div style={{ fontSize: '13px', marginTop: '6px' }}>
                <strong>Name:</strong> {form.name || 'Driver'} • <strong>Gari:</strong> {form.model || 'Car'} ({form.regNo || 'Plate'})
              </div>
              <div style={{ fontSize: '12px', color: theme.muted, marginTop: '6px' }}>
                Ab Poora Cash Apka • PKR 3,000 Monthly Subscription Plan 
              </div>
              {ride.requested && (
                <div style={{ marginTop: '14px', background: theme.box, padding: '12px', borderRadius: '12px', fontSize: '12px' }}>
                  <div style={{ fontWeight: 900, color: theme.gold }}>New Passenger Ride Request!</div>
                  <div style={{ marginTop: '4px' }}>
                    {ride.pickup} → {ride.dropoff} (Rs. {ride.fare})
                  </div>
                  <button
                    onClick={() => {
                      setRide({ ...ride, requested: false });
                      setMsg('Ride accept aur complete ho gayi!');
                    }}
                    style={{
                      marginTop: '8px',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: theme.green,
                      color: '#fff',
                      fontWeight: 800
                    }}
                  >
                    Accept & Complete Ride
                  </button>
                </div>
              )}

              <button
                onClick={() => setDriverStatus('new')}
                style={{
                  marginTop: '14px',
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  border: `1px solid ${theme.border}`,
                  background: theme.box,
                  color: theme.text,
                  fontWeight: 800
                }}
              >
                Edit Registration Form
              </button>
            </div>
          ) : (
            <form onSubmit={submitRegistration} style={{ background: theme.card, border: `1.5px solid ${theme.border}`, borderRadius: '16px', padding: '14px' }}>
              <div style={{ fontSize: '16px', fontWeight: 900, color: theme.green, marginBottom: '10px' }}>
                Driver Registration & PKR 3,000 Payment
              </div>

              {/* Permissions */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                {[
                  { k: 'gps', l: 'GPS', Icon: MapPin },
                  { k: 'notif', l: 'Notification', Icon: Bell },
                  { k: 'camera', l: 'Camera', Icon: Camera },
                  { k: 'mic', l: 'Mic', Icon: Mic }
                ].map(({ k, l, Icon }) => (
                  <div
                    key={k}
                    style={{
                      background: theme.box,
                      border: `1px solid ${perms[k] ? theme.green : theme.border}`,
                      borderRadius: '8px',
                      padding: '7px 8px',
                      fontSize: '11px',
                      fontWeight: 800,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Icon size={13} /> {l}
                    </span>
                    <span style={{ color: perms[k] ? theme.green : theme.gold }}>{perms[k] ? 'ON' : 'OFF'}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={enablePermissions}
                style={{
                  width: '100%',
                  padding: '9px',
                  borderRadius: '9px',
                  border: 'none',
                  background: theme.box,
                  color: theme.text,
                  fontWeight: 800,
                  fontSize: '12px',
                  marginBottom: '10px',
                  cursor: 'pointer'
                }}
              >
                Enable GPS, Notification, Camera & Mic
              </button>

              {/* Fields */}
              {[
                { k: 'name', p: 'Driver Name' },
                { k: 'cnic', p: 'CNIC Number' },
                { k: 'mobile', p: 'Mobile Number' },
                { k: 'regNo', p: 'Vehicle Registration Number' },
                { k: 'model', p: 'Vehicle Model' }
              ].map((item) => (
                <input
                  key={item.k}
                  value={form[item.k]}
                  onChange={(e) => setForm({ ...form, [item.k]: e.target.value })}
                  placeholder={item.p}
                  style={{
                    width: '100%',
                    padding: '9px',
                    borderRadius: '9px',
                    border: `1px solid ${theme.border}`,
                    background: theme.bg,
                    color: theme.text,
                    fontSize: '13px',
                    marginBottom: '8px',
                    boxSizing: 'border-box'
                  }}
                />
              ))}

              {/* 10 Gallery + Camera Upload Slots */}
              <div style={{ fontSize: '12px', fontWeight: 800, margin: '6px 0' }}>
                Vehicle Photos & Docs (Gallery & Camera)
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
                {PHOTO_SLOTS.map((s) => (
                  <div
                    key={s.key}
                    style={{
                      background: theme.box,
                      border: `1px dashed ${files[s.key] ? theme.green : theme.border}`,
                      borderRadius: '10px',
                      padding: '8px',
                      textAlign: 'center',
                      fontSize: '11px',
                      fontWeight: 800
                    }}
                  >
                    {files[s.key] ? (
                      <img src={files[s.key].url} alt={s.label} style={{ width: '100%', height: '42px', objectFit: 'cover', borderRadius: '6px' }} />
                    ) : (
                      <Upload size={15} />
                    )}
                    <div style={{ margin: '4px 0 6px' }}>{s.label}</div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      {/* Gallery / File Picker (no capture attribute) */}
                      <label
                        style={{
                          flex: 1,
                          padding: '5px 4px',
                          borderRadius: '6px',
                          background: theme.green,
                          color: '#fff',
                          fontSize: '10px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '2px',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleUpload(s.key, e)}
                          style={{ display: 'none' }}
                        />
                        <ImageIcon size={11} /> Gallery
                      </label>

                      {/* Direct Camera Capture */}
                      <label
                        style={{
                          flex: 1,
                          padding: '5px 4px',
                          borderRadius: '6px',
                          background: theme.card,
                          border: `1px solid ${theme.border}`,
                          color: theme.text,
                          fontSize: '10px',
                          fontWeight: 800,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '2px',
                          cursor: 'pointer'
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) => handleUpload(s.key, e)}
                          style={{ display: 'none' }}
                        />
                        <Camera size={11} /> Camera
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment to 03338209526 */}
              <div style={{ background: theme.box, borderRadius: '10px', padding: '10px', marginBottom: '8px', border: `1px solid ${theme.border}` }}>
                <div style={{ fontSize: '11px', color: theme.muted }}>PKR 3,000 Monthly Subscription Payment Account</div>
                <div stylMonthly play: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                  <strong style={{ fontSize: '15px', color: theme.gold }}>{DIRECT_NUMBER}</strong>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(DIRECT_NUMBER);
                      setMsg(`${DIRECT_NUMBER} copy ho gaya.`);
                    }}
                    style={{ padding: '4px 8px', borderRadius: '6px', border: 'none', background: theme.green, color: '#fff', fontSize: '11px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Copy size={12} /> Copy
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                {['Easypaisa', 'JazzCash'].map((m) => (
                  <button
                    type="button"
                    key={m}
                    onClick={() => setForm({ ...form, method: m })}
                    style={{
                      flex: 1,
                      padding: '8px',
                      borderRadius: '8px',
                      border: form.method === m ? `2px solid ${theme.green}` : `1px solid ${theme.border}`,
                      background: form.method === m ? theme.box : theme.bg,
                      color: theme.text,
                      fontWeight: 800,
                      fontSize: '12px'
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>

              <input
                value={form.tid}
                onChange={(e) => setForm({ ...form, tid: e.target.value })}
                placeholder="Enter Payment Transaction ID (TID)"
                style={{
                  width: '100%',
                  padding: '9px',
                  borderRadius: '9px',
                  border: `1px solid ${theme.border}`,
                  background: theme.bg,
                  color: theme.text,
                  fontSize: '13px',
                  marginBottom: '10px',
                  boxSizing: 'border-box'
                }}
              />

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '11px',
                  border: 'none',
                  background: theme.green,
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 900,
                  cursor: 'pointer'
                }}
              >
                {driverStatus === 'pending' ? 'Pending Admin Approval...' : 'Submit Registration & TID'}
              </button>
            </form>
          )}
        </>
      )}

      {/* ==================== PASSENGER ==================== */}
      {portal === 'passenger' && (
        <div style={{ background: theme.card, border: `1.5px solid ${theme.border}`, borderRadius: '16px', padding: '14px' }}>
          <div style={{ fontSize: '16px', fontWeight: 900, color: theme.green, marginBottom: '10px' }}>
            EasyDrive Passenger Booking
            const [form, setForm] = useState({
            name: '',
            cnic: '',
            mobile: '',
          </div>
          <input
            value={ride.pickup}
            onChange={(e) => setRide({ ...ride, pickup: e.target.value })}
            placeholder="Pickup"
            style={{ width: '100%', padding: '9px', borderRadius: '9px', border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, marginBottom: '8px', boxSizing: 'border-box' }}
          />
          <input
            value={ride.dropoff}
            onChange={(e) => setRide({ ...ride, dropoff: e.target.value })}
            placeholder="Destination"
            style={{ width: '100%', padding: '9px', borderRadius: '9px', border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, marginBottom: '10px', boxSizing: 'border-box' }}
          />
          <div style={{ fontSize: '13px', fontWeight: 800, marginBottom: '10px' }}>
            Fare: Rs. {ride.fare} • 2% Fee: Rs. {(ride.fare * 0.02).toFixed(2)}
          </div>
          <button
            onClick={() => {
              setRide({ ...ride, requested: true });
              setMsg('Ride request bhej di gayi hai! Driver Pro tab check karein.');
            }}
            style={{ width: '100%', padding: '12px', borderRadius: '11px', border: 'none', background: theme.green, color: '#fff', fontWeight: 900, cursor: 'pointer' }}
          >
            Request Ride
          </button>
        </div>
      )}

      {/* ==================== ADMIN ==================== */}
      {portal === 'admin' && (
        <div style={{ background: theme.card, border: `1.5px solid ${theme.border}`, borderRadius: '16px', padding: '14px' }}>
          <div style={{ fontSize: '16px', fontWeight: 900, color: theme.green, marginBottom: '10px' }}>
            Super Admin Approval
          </div>
          <div style={{ background: theme.box, borderRadius: '10px', padding: '10px', fontSize: '12px', marginBottom: '12px' }}>
            <div><strong>Driver:</strong> {form.name || 'Not submitted yet'}</div>
            <div><strong>CNIC:</strong> {form.cnic || '-'} | <strong>Mobile:</strong> {form.mobile || '-'}</div>
            <div><strong>Vehicle:</strong> {form.model || '-'} ({form.regNo || '-'})</div>
JazzCash             <div><strong>Payment:</strong> PKR 3,000 via EasyPaisa/ JazzCash{form.method} to {DIRECT_NUMBER} • TID: {form.tid || '-'}</div>
            <div><strong>Status:</strong> <strong style={{ color: theme.gold }}>{driverStatus.toUpperCase()}</strong></div>
          </div>

          <button
            onClick={approveDriver}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '11px',
              border: 'none',
              background: theme.green,
              color: '#fff',
              fontSize: '14px',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            Approve & Send "Welcome aboard"
          </button>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import {
  Car,
  User,
  ShieldCheck,
  Sun,
  Moon,
  Camera,
  Upload,
  Copy,
  CheckCircle2,
  Image as ImageIcon,
  AlertTriangle,
  Share2,
  KeyRound,
  Megaphone,
  Route,
  Plus,
  Trash2,
  Clock,
  XCircle
} from 'lucide-react';

const DIRECT_NUMBER = '03338209526';

const PHOTO_SLOTS = [
  { key: 'front', label: 'Front Side' },
  { key: 'back', label: 'Back Side' },
  { key: 'left', label: 'Left Side' },
  { key: 'right', label: 'Right Side' },
  { key: 'doc', label: 'Vehicle Document' },
  { key: 'license', label: 'Driving License' },
  { key: 'paymentProof', label: 'PKR 3,000 Receipt' }
];

const KARACHI_ROUTES = [
  { label: 'Clifton → Dolmen Mall', pickup: 'Clifton, Karachi', dropoff: 'Dolmen Mall, Clifton', km: 6 },
  { label: 'Clifton → Lucky One Mall', pickup: 'Clifton, Karachi', dropoff: 'Lucky One Mall, Gulshan', km: 18 },
  { label: 'Tariq Rd → Cantt Station', pickup: 'Tariq Rd, Karachi', dropoff: 'Karachi Cantt Station', km: 8 },
  { label: 'Malir 15 → Shahrah-e-Faisal', pickup: 'Malir 15, Karachi', dropoff: 'Shahrah-e-Faisal, Karachi', km: 14 }
];

const TIERS = [
  { id: 'Economy', label: 'Economy', base: 140, perKm: 48 },
  { id: 'Business', label: 'Business', base: 220, perKm: 60 },
  { id: 'Comfort', label: 'Comfort', base: 300, perKm: 90 }
];

function LandingHeroGraphic() {
  return (
    <div
      style={{
        background: 'rgba(9, 13, 22, 0.45)',
        border: '1px solid rgba(255, 255, 255, 0.22)',
        borderRadius: '20px',
        padding: '12px',
        marginTop: '18px',
        boxShadow: '0 14px 30px rgba(0, 0, 0, 0.28)'
      }}
    >
      <svg
        viewBox="0 0 360 165"
        width="100%"
        height="auto"
        role="img"
        aria-label="EasyDrive Pakistan Ride Visual"
        style={{ display: 'block', borderRadius: '14px' }}
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#14532d" />
          </linearGradient>
          <linearGradient id="carBody" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#fde047" />
          </linearGradient>
        </defs>

        <rect x="0" y="0" width="360" height="165" rx="14" fill="url(#skyGrad)" />

        {/* City skyline silhouettes */}
        <rect x="24" y="42" width="32" height="68" rx="4" fill="#1e293b" opacity="0.85" />
        <rect x="64" y="28" width="40" height="82" rx="4" fill="#1e293b" opacity="0.9" />
        <rect x="112" y="50" width="28" height="60" rx="4" fill="#1e293b" opacity="0.75" />
        <rect x="225" y="34" width="38" height="76" rx="4" fill="#1e293b" opacity="0.85" />
        <rect x="270" y="48" width="34" height="62" rx="4" fill="#1e293b" opacity="0.8" />
        <rect x="310" y="38" width="28" height="72" rx="4" fill="#1e293b" opacity="0.9" />

        {/* Route pin & arc */}
        <path
          d="M 55 95 Q 180 18 302 92"
          fill="none"
          stroke="#4ade80"
          strokeWidth="2.5"
          strokeDasharray="6 5"
        />
        <circle cx="55" cy="95" r="6" fill="#fde047" />
        <circle cx="302" cy="92" r="6" fill="#22c55e" />

        {/* Highway & lane markings */}
        <rect x="0" y="110" width="360" height="55" fill="#090d16" />
        <line x1="16" y1="137" x2="344" y2="137" stroke="#f59e0b" strokeWidth="3" strokeDasharray="16 12" />

        {/* Modern Ride Car */}
        <g transform="translate(105, 86)">
          <rect x="12" y="18" width="126" height="30" rx="11" fill="url(#carBody)" />
          <path d="M 34 18 L 50 4 L 102 4 L 118 18 Z" fill="#f8fafc" />
          <rect x="53" y="7" width="21" height="10" rx="3" fill="#0f172a" />
          <rect x="79" y="7" width="21" height="10" rx="3" fill="#0f172a" />
          <circle cx="38" cy="48" r="11" fill="#0f172a" stroke="#e2e8f0" strokeWidth="3" />
          <circle cx="114" cy="48" r="11" fill="#0f172a" stroke="#e2e8f0" strokeWidth="3" />
          <circle cx="38" cy="48" r="4" fill="#94a3b8" />
          <circle cx="114" cy="48" r="4" fill="#94a3b8" />
        </g>
      </svg>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState('promo'); // 'promo' | 'main'
  const [portal, setPortal] = useState('driver'); // 'driver' | 'passenger' | 'admin'
  const [sunlight, setSunlight] = useState(false);

  // Driver registration, docs & subscription
  const [form, setForm] = useState({
    name: '',
    cnic: '',
    mobile: '',
    regNo: '',
    model: '',
    method: 'Easypaisa',
    tid: ''
  });
  const [files, setFiles] = useState({});

  // Status values: 'pending' | 'approved' | 'not_approved'
  const [regStatus, setRegStatus] = useState('pending');
  const [daysLeft, setDaysLeft] = useState(30);
  const [priority, setPriority] = useState(68);
  const [completedCount, setCompletedCount] = useState(0);
  const [driverEarnings, setDriverEarnings] = useState(0);
  const [welcomeMsg, setWelcomeMsg] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('Ab Poora Cash Apka — Aaj peak hours mein priority trips accept karein!');
  const [broadcastInput, setBroadcastInput] = useState('');

  // Passenger booking, multiple stops, same final fare & 4-digit PIN
  const [stops, setStops] = useState([]);
  const [newStopText, setNewStopText] = useState('');
  const [ride, setRide] = useState({
    pickup: 'Clifton, Karachi',
    dropoff: 'Dolmen Mall, Clifton',
    km: 6,
    tier: 'Economy',
    payment: 'JazzCash',
    pin: '4829',
    pinInput: '',
    stage: 'idle'
  });

  const [msg, setMsg] = useState('');
  const [sosActive, setSosActive] = useState(false);

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

  const regStatusLabel =
    regStatus === 'approved'
      ? 'Approved (Welcome aboard)'
      : regStatus === 'not_approved'
      ? 'Not Approved'
      : 'Registration (In-Progress Pending)';

  const selectedTier = TIERS.find((t) => t.id === ride.tier) || TIERS[0];
  const validStops = stops.map((s) => s.trim()).filter(Boolean);
  const extraStopsKm = validStops.length * 2;
  const totalRouteKm = Number(ride.km || 1) + extraStopsKm;
  const stopsFee = validStops.length * 60;
  const calculatedFare = Math.round(selectedTier.base + totalRouteKm * selectedTier.perKm + stopsFee);
  const feeTwoPercent = Number((calculatedFare * 0.02).toFixed(2));
  const driverNetCash = Number((calculatedFare - feeTwoPercent).toFixed(2));
  const estMinutes = Math.max(5, Math.round(totalRouteKm * 2.4 + validStops.length * 4));

  function handleUpload(key, e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFiles((prev) => ({
      ...prev,
      [key]: { name: file.name, url: URL.createObjectURL(file) }
    }));
    setMsg(`${file.name} attach ho gaya hai (Admin panel mein show hoga).`);
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
    setRegStatus('pending');
    setWelcomeMsg('');
    setMsg('Registration submit ho gayi hai! Status: Registration (In-Progress Pending).');
  }

  function setAdminDriverStatus(nextStatus) {
    setRegStatus(nextStatus);
    if (nextStatus === 'approved') {
      setDaysLeft(30);
      setWelcomeMsg('Welcome aboard! Aapka EasyDrive Driver Pro account approve ho gaya hai — Ab Poora Cash Apka!');
      setMsg('Status set to Approved (Welcome aboard).');
    } else if (nextStatus === 'not_approved') {
      setWelcomeMsg('');
      setMsg('Status set to Not Approved.');
    } else {
      setWelcomeMsg('');
      setMsg('Status set to Registration (In-Progress Pending).');
    }
  }

  function startPassengerRide() {
    if (!ride.pickup.trim() || !ride.dropoff.trim()) {
      setMsg('Please Pickup aur Final Destination dono enter karein.');
      return;
    }
    const randomPin = String(Math.floor(1000 + Math.random() * 9000));
    setRide((prev) => ({
      ...prev,
      pin: randomPin,
      pinInput: '',
      stage: 'searching'
    }));
    setMsg(`Ride request bhej di gayi hai! Fare: Rs. ${calculatedFare} • Start PIN: ${randomPin}.`);
  }

  function driverAcceptRide() {
    setRide((prev) => ({ ...prev, stage: 'arriving' }));
    setMsg('Trip accept ho gayi! Passenger se 4-digit PIN le kar trip start karein.');
  }

  function driverStartWithPin() {
    if (ride.pinInput.trim() !== ride.pin) {
      setMsg(`Ghalat PIN! Passenger ka 4-digit PIN (${ride.pin}) enter karein.`);
      return;
    }
    setRide((prev) => ({ ...prev, stage: 'in_progress' }));
    setMsg('PIN verify ho gaya! Trip In Progress hai.');
  }

  function driverCompleteRide() {
    setCompletedCount((c) => c + 1);
    setDriverEarnings((e) => e + calculatedFare);
    setPriority((p) => p + 2);
    setRide((prev) => ({ ...prev, stage: 'completed', pinInput: '' }));
    setMsg(`Trip complete! Final Fare: Rs. ${calculatedFare} | 2% Fee: Rs. ${feeTwoPercent} | Priority +2.`);
  }

  function triggerSOS() {
    setSosActive(true);
    const info = `SOS ALERT! Route: ${ride.pickup} → ${ride.dropoff} | Driver: ${form.name || 'Assigned Driver'} | Gari: ${form.regNo || 'BRG-739'}`;
    if (navigator.share) {
      navigator.share({ title: 'EasyDrive SOS Alert', text: info }).catch(() => {});
    }
    setMsg(info);
  }

  function sendBroadcast(e) {
    e.preventDefault();
    if (!broadcastInput.trim()) return;
    setBroadcastMsg(broadcastInput.trim());
    setBroadcastInput('');
    setMsg('Admin broadcast live drivers ko bhej diya gaya hai.');
  }

  const routeSummaryText = [ride.pickup, ...validStops, ride.dropoff].filter(Boolean).join(' → ');
  const attachedSlots = PHOTO_SLOTS.filter((s) => files[s.key]);

  if (screen === 'promo') {
    return (
      <div
        style={{
          maxWidth: '430px',
          minHeight: '100vh',
          margin: '0 auto',
          background: 'linear-gradient(180deg, #16a34a 0%, #065f46 65%, #090d16 100%)',
          color: '#fff',
          padding: '24px 20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          fontFamily: 'system-ui, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 900, color: '#fde047', letterSpacing: '1px' }}>
            EASYDRIVE-PAKISTAN
          </div>
          <h1 style={{ fontSize: '30px', fontWeight: 900, margin: '10px 0 0', lineHeight: 1.15 }}>
            AB POORA CASH APKA
          </h1>
          <p style={{ fontSize: '13px', color: '#dcfce7', marginTop: '8px' }}>
            PKR 3,000 / 30 Days • Smart City Rides
          </p>

          <LandingHeroGraphic />
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
            cursor: 'pointer',
            marginTop: '18px'
          }}
        >
          Launch EasyDrive-Pakistan →
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
        paddingBottom: '48px'
      }}
    >
      {/* Top Tabs + Night / Sunlight Switch */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
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

      {/* Live Admin Broadcast Banner */}
      {broadcastMsg && (
        <div
          style={{
            background: theme.box,
            border: `1px solid ${theme.gold}`,
            borderRadius: '10px',
            padding: '8px 10px',
            marginBottom: '10px',
            fontSize: '11px',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Megaphone size={14} color={theme.gold} />
          <span>{broadcastMsg}</span>
        </div>
      )}

      {/* Welcome Aboard Alert */}
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

      {/* SOS Alert Box */}
      {sosActive && (
        <div
          style={{
            background: '#991b1b',
            color: '#fff',
            padding: '10px 12px',
            borderRadius: '10px',
            marginBottom: '10px',
            fontSize: '12px',
            fontWeight: 800,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertTriangle size={16} /> SOS Emergency Active!
          </span>
          <button
            onClick={() => setSosActive(false)}
            style={{ background: '#fff', color: '#991b1b', border: 'none', borderRadius: '6px', padding: '3px 8px', fontWeight: 900, fontSize: '11px' }}
          >
            Clear SOS
          </button>
        </div>
      )}

      {/* Status / Notice Message */}
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
            justifyContent: 'space-between',
            gap: '8px'
          }}
        >
          <span>{msg}</span>
          <button onClick={() => setMsg('')} style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 900 }}>
            ×
          </button>
        </div>
      )}

      {/* ==================== 1. DRIVER PRO ==================== */}
      {portal === 'driver' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div
            style={{
              background: theme.card,
              border: `1.5px solid ${
                regStatus === 'approved' ? theme.green : regStatus === 'not_approved' ? '#dc2626' : theme.gold
              }`,
              borderRadius: '14px',
              padding: '12px'
            }}
          >
            <div style={{ fontSize: '11px', color: theme.muted, fontWeight: 800 }}>Registration Status</div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 900,
                marginTop: '3px',
                color: regStatus === 'approved' ? theme.green : regStatus === 'not_approved' ? '#ef4444' : theme.gold
              }}
            >
              {regStatusLabel}
            </div>
          </div>

          {regStatus === 'approved' && (
            <div style={{ background: theme.card, border: `1.5px solid ${theme.green}`, borderRadius: '16px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '17px', fontWeight: 900, color: theme.green }}>Driver Pro Active</span>
                <span style={{ background: theme.box, padding: '4px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: 800, color: theme.gold }}>
                  {daysLeft} Days Left
                </span>
              </div>

              <div style={{ fontSize: '12px', marginTop: '8px', color: theme.muted }}>
                <strong>Driver:</strong> {form.name || 'Verified Driver'} • <strong>Gari:</strong> {form.model || 'Car'} ({form.regNo || 'Plate'})
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '10px' }}>
                <div style={{ background: theme.box, padding: '9px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', color: theme.muted }}>Earnings</div>
                  <div style={{ fontSize: '14px', fontWeight: 900 }}>Rs. {driverEarnings}</div>
                </div>
                <div style={{ background: theme.box, padding: '9px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', color: theme.muted }}>Trips</div>
                  <div style={{ fontSize: '14px', fontWeight: 900 }}>{completedCount}</div>
                </div>
                <div style={{ background: theme.box, padding: '9px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', color: theme.muted }}>Priority</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: theme.gold }}>+{priority}</div>
                </div>
              </div>

              {ride.stage !== 'idle' && ride.stage !== 'completed' && (
                <div style={{ marginTop: '12px', background: theme.box, border: `1px solid ${theme.gold}`, borderRadius: '12px', padding: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 900, color: theme.gold }}>
                    Final Fare ({ride.tier}): Rs. {calculatedFare}
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    {routeSummaryText} ({totalRouteKm} km • ~{estMinutes} min)
                  </div>
                  <div style={{ fontSize: '11px', color: theme.muted, marginTop: '3px' }}>
                    Payment: {ride.payment} • 2% Fee: Rs. {feeTwoPercent} • Driver Net: Rs. {driverNetCash}
                  </div>

                  {ride.stage === 'searching' && (
                    <button
                      onClick={driverAcceptRide}
                      style={{ marginTop: '10px', width: '100%', padding: '9px', borderRadius: '9px', border: 'none', background: theme.green, color: '#fff', fontWeight: 800, cursor: 'pointer' }}
                    >
                      Accept Ride
                    </button>
                  )}

                  {ride.stage === 'arriving' && (
                    <div style={{ marginTop: '10px' }}>
                      <input
                        value={ride.pinInput}
                        onChange={(e) => setRide({ ...ride, pinInput: e.target.value })}
                        placeholder={`Enter 4-Digit Start PIN (Hint: ${ride.pin})`}
                        style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, marginBottom: '8px', boxSizing: 'border-box' }}
                      />
                      <button
                        onClick={driverStartWithPin}
                        style={{ width: '100%', padding: '9px', borderRadius: '9px', border: 'none', background: theme.gold, color: '#090d16', fontWeight: 900, cursor: 'pointer' }}
                      >
                        Verify PIN & Start Trip
                      </button>
                    </div>
                  )}

                  {ride.stage === 'in_progress' && (
                    <button
                      onClick={driverCompleteRide}
                      style={{ marginTop: '10px', width: '100%', padding: '9px', borderRadius: '9px', border: 'none', background: theme.green, color: '#fff', fontWeight: 900, cursor: 'pointer' }}
                    >
                      Complete Trip (Final Fare: Rs. {calculatedFare})
                    </button>
                  )}
                </div>
              )}

              <button
                onClick={triggerSOS}
                style={{ marginTop: '12px', width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
              >
                SOS Emergency Alert
              </button>
            </div>
          )}

          {/* Clean Driver Registration Form */}
          <form onSubmit={submitRegistration} style={{ background: theme.card, border: `1.5px solid ${theme.border}`, borderRadius: '16px', padding: '14px' }}>
            <div style={{ fontSize: '16px', fontWeight: 900, color: theme.green, marginBottom: '10px' }}>
              Driver Registration & PKR 3,000 Payment
            </div>

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
                style={{ width: '100%', padding: '9px', borderRadius: '9px', border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: '13px', marginBottom: '8px', boxSizing: 'border-box' }}
              />
            ))}

            <div style={{ fontSize: '12px', fontWeight: 800, margin: '6px 0' }}>
              Vehicle Photos, Docs & Payment Receipt (Gallery & Camera)
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
                    <label style={{ flex: 1, padding: '5px 4px', borderRadius: '6px', background: theme.green, color: '#fff', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', cursor: 'pointer' }}>
                      <input type="file" accept="image/*" onChange={(e) => handleUpload(s.key, e)} style={{ display: 'none' }} />
                      <ImageIcon size={11} /> Gallery
                    </label>
                    <label style={{ flex: 1, padding: '5px 4px', borderRadius: '6px', background: theme.card, border: `1px solid ${theme.border}`, color: theme.text, fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px', cursor: 'pointer' }}>
                      <input type="file" accept="image/*" capture="environment" onChange={(e) => handleUpload(s.key, e)} style={{ display: 'none' }} />
                      <Camera size={11} /> Camera
                    </label>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: theme.box, borderRadius: '10px', padding: '10px', marginBottom: '8px', border: `1px solid ${theme.border}` }}>
              <div style={{ fontSize: '11px', color: theme.muted }}>PKR 3,000 / 30 Days Payment Account</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
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
                  style={{ flex: 1, padding: '8px', borderRadius: '8px', border: form.method === m ? `2px solid ${theme.green}` : `1px solid ${theme.border}`, background: form.method === m ? theme.box : theme.bg, color: theme.text, fontWeight: 800, fontSize: '12px' }}
                >
                  {m}
                </button>
              ))}
            </div>

            <input
              value={form.tid}
              onChange={(e) => setForm({ ...form, tid: e.target.value })}
              placeholder="Enter Payment Transaction ID (TID)"
              style={{ width: '100%', padding: '9px', borderRadius: '9px', border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: '13px', marginBottom: '10px', boxSizing: 'border-box' }}
            />

            <button type="submit" style={{ width: '100%', padding: '12px', borderRadius: '11px', border: 'none', background: theme.green, color: '#fff', fontSize: '14px', fontWeight: 900, cursor: 'pointer' }}>
              Submit Registration ({regStatusLabel})
            </button>
          </form>
        </div>
      )}

      {/* ==================== 2. PASSENGER ==================== */}
      {portal === 'passenger' && (
        <div style={{ background: theme.card, border: `1.5px solid ${theme.border}`, borderRadius: '16px', padding: '14px' }}>
          <div style={{ fontSize: '16px', fontWeight: 900, color: theme.green, marginBottom: '8px' }}>
            EasyDrive Passenger • Custom Locations & Multi-Stops
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
            {KARACHI_ROUTES.map((r, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => setRide({ ...ride, pickup: r.pickup, dropoff: r.dropoff, km: r.km })}
                style={{ padding: '5px 8px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.box, color: theme.text, fontSize: '10px', fontWeight: 800, cursor: 'pointer' }}
              >
                <Route size={11} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                {r.label}
              </button>
            ))}
          </div>

          <input
            value={ride.pickup}
            onChange={(e) => setRide({ ...ride, pickup: e.target.value })}
            placeholder="Any Pickup Location"
            style={{ width: '100%', padding: '9px', borderRadius: '9px', border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, marginBottom: '8px', boxSizing: 'border-box' }}
          />

          <div style={{ background: theme.box, borderRadius: '10px', padding: '8px', marginBottom: '8px' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>
              Additional Stops / Destinations ({validStops.length})
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input
                value={newStopText}
                onChange={(e) => setNewStopText(e.target.value)}
                placeholder="Add another stop..."
                style={{ flex: 1, padding: '7px 8px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: '12px' }}
              />
              <button
                type="button"
                onClick={addDestinationStop}
                style={{ padding: '7px 10px', borderRadius: '8px', border: 'none', background: theme.green, color: '#fff', fontWeight: 800, fontSize: '11px', display: 'flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}
              >
                <Plus size={13} /> Add
              </button>
            </div>

            {validStops.map((st, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', padding: '6px 8px', borderRadius: '7px', background: theme.card, fontSize: '12px' }}>
                <span>Stop {idx + 1}: <strong>{st}</strong></span>
                <button
                  type="button"
                  onClick={() => removeDestinationStop(idx)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <input
            value={ride.dropoff}
            onChange={(e) => setRide({ ...ride, dropoff: e.target.value })}
            placeholder="Final Destination"
            style={{ width: '100%', padding: '9px', borderRadius: '9px', border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, marginBottom: '8px', boxSizing: 'border-box' }}
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: theme.box, padding: '8px 10px', borderRadius: '9px', marginBottom: '10px', fontSize: '12px' }}>
            <span>Base Route Distance (km):</span>
            <input
              type="number"
              min="1"
              max="150"
              value={ride.km}
              onChange={(e) => setRide({ ...ride, km: e.target.value })}
              style={{ width: '68px', padding: '5px', borderRadius: '6px', border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontWeight: 800 }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '10px' }}>
            {TIERS.map((t) => (
              <button
                type="button"
                key={t.id}
                onClick={() => setRide({ ...ride, tier: t.id })}
                style={{ padding: '8px 6px', borderRadius: '9px', border: ride.tier === t.id ? `2px solid ${theme.green}` : `1px solid ${theme.border}`, background: ride.tier === t.id ? theme.box : theme.bg, color: theme.text, fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
              >
                <div>{t.label}</div>
                <div style={{ fontSize: '10px', color: theme.muted }}>Rs.{t.perKm}/km</div>
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {['Cash', 'JazzCash', 'Easypaisa'].map((pm) => (
              <button
                type="button"
                key={pm}
                onClick={() => setRide({ ...ride, payment: pm })}
                style={{ flex: 1, padding: '7px', borderRadius: '8px', border: ride.payment === pm ? `2px solid ${theme.green}` : `1px solid ${theme.border}`, background: ride.payment === pm ? theme.box : theme.bg, color: theme.text, fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}
              >
                {pm}
              </button>
            ))}
          </div>

          <div style={{ background: theme.box, borderRadius: '12px', padding: '10px', marginBottom: '10px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900 }}>
              <span>Final Fare ({totalRouteKm} km • ~{estMinutes} min):</span>
              <span style={{ color: theme.gold, fontSize: '16px' }}>Rs. {calculatedFare}</span>
            </div>
            <div style={{ color: theme.muted, marginTop: '4px', fontSize: '11px' }}>
              {routeSummaryText}
            </div>
            <div style={{ color: theme.muted, marginTop: '3px', fontSize: '11px' }}>
              2% Fee: Rs. {feeTwoPercent} • Driver Net: Rs. {driverNetCash}
            </div>

            {ride.stage !== 'idle' && (
              <div style={{ marginTop: '8px', padding: '7px 9px', borderRadius: '8px', background: theme.card, border: `1px solid ${theme.green}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 800 }}>
                  <KeyRound size={14} color={theme.green} /> Start PIN:
                </span>
                <strong style={{ fontSize: '15px', letterSpacing: '2px', color: theme.gold }}>{ride.pin}</strong>
              </div>
            )}
          </div>

          <button
            onClick={startPassengerRide}
            style={{ width: '100%', padding: '12px', borderRadius: '11px', border: 'none', background: theme.green, color: '#fff', fontWeight: 900, fontSize: '14px', cursor: 'pointer' }}
          >
            {ride.stage === 'searching' ? 'Finding Driver...' : 'Request Ride & Get PIN'}
          </button>

          {ride.stage !== 'idle' && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={triggerSOS}
                style={{ flex: 1, padding: '9px', borderRadius: '9px', border: 'none', background: '#dc2626', color: '#fff', fontWeight: 800, fontSize: '12px', cursor: 'pointer' }}
              >
                SOS
              </button>
              <button
                onClick={() => {
                  const text = `EasyDrive Ride: ${routeSummaryText} | Final Fare Rs. ${calculatedFare} | PIN ${ride.pin}`;
                  navigator.clipboard?.writeText(text);
                  setMsg('Live trip details copied!');
                }}
                style={{ flex: 1, padding: '9px', borderRadius: '9px', border: `1px solid ${theme.border}`, background: theme.box, color: theme.text, fontWeight: 800, fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer' }}
              >
                <Share2 size={13} /> Share Trip
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== 3. ADMIN ==================== */}
      {portal === 'admin' && (
        <div style={{ background: theme.card, border: `1.5px solid ${theme.border}`, borderRadius: '16px', padding: '14px' }}>
          <div style={{ fontSize: '16px', fontWeight: 900, color: theme.green, marginBottom: '10px' }}>
            Super Admin Control & Document Review
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: theme.box, padding: '10px', borderRadius: '10px' }}>
              <div style={{ fontSize: '10px', color: theme.muted }}>Sub Revenue (30d)</div>
              <div style={{ fontSize: '15px', fontWeight: 900 }}>PKR {regStatus === 'approved' ? '3,000' : '0'}</div>
            </div>
            <div style={{ background: theme.box, padding: '10px', borderRadius: '10px' }}>
              <div style={{ fontSize: '10px', color: theme.muted }}>2% Ride Fee Earned</div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: theme.green }}>Rs. {(completedCount * feeTwoPercent).toFixed(2)}</div>
            </div>
          </div>

          <div style={{ background: theme.box, borderRadius: '10px', padding: '10px', fontSize: '12px', marginBottom: '12px' }}>
            <div><strong>Driver:</strong> {form.name || 'Not submitted yet'}</div>
            <div><strong>CNIC:</strong> {form.cnic || '-'} | <strong>Mobile:</strong> {form.mobile || '-'}</div>
            <div><strong>Vehicle:</strong> {form.model || '-'} ({form.regNo || '-'})</div>
            <div><strong>Payment:</strong> PKR 3,000 via {form.method} to {DIRECT_NUMBER} • TID: {form.tid || '-'}</div>
            <div style={{ marginTop: '4px' }}>
              <strong>Current Status:</strong>{' '}
              <strong style={{ color: regStatus === 'approved' ? theme.green : regStatus === 'not_approved' ? '#ef4444' : theme.gold }}>
                {regStatusLabel}
              </strong>
            </div>
          </div>

          <div style={{ background: theme.box, borderRadius: '12px', padding: '10px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 900, marginBottom: '8px' }}>
              Attached Documents & Vehicle Photos ({attachedSlots.length}/{PHOTO_SLOTS.length})
            </div>

            {attachedSlots.length === 0 ? (
              <div style={{ fontSize: '11px', color: theme.muted }}>Koi document ya photo attach nahi hui.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {attachedSlots.map((slot) => {
                  const docItem = files[slot.key];
                  return (
                    <div
                      key={slot.key}
                      style={{
                        background: theme.card,
                        border: `1px solid ${theme.border}`,
                        borderRadius: '10px',
                        padding: '6px',
                        fontSize: '11px'
                      }}
                    >
                      <img
                        src={docItem.url}
                        alt={slot.label}
                        style={{ width: '100%', height: '64px', objectFit: 'cover', borderRadius: '7px', marginBottom: '4px' }}
                      />
                      <div style={{ fontWeight: 800, color: theme.green }}>{slot.label}</div>
                      <div style={{ fontSize: '10px', color: theme.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {docItem.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>
            Driver Registration Decision:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '12px' }}>
            <button
              type="button"
              onClick={() => setAdminDriverStatus('approved')}
              style={{
                padding: '10px 6px',
                borderRadius: '10px',
                border: 'none',
                background: theme.green,
                color: '#fff',
                fontWeight: 900,
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                cursor: 'pointer'
              }}
            >
              <CheckCircle2 size={13} /> Approved
            </button>

            <button
              type="button"
              onClick={() => setAdminDriverStatus('not_approved')}
              style={{
                padding: '10px 6px',
                borderRadius: '10px',
                border: 'none',
                background: '#dc2626',
                color: '#fff',
                fontWeight: 900,
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                cursor: 'pointer'
              }}
            >
              <XCircle size={13} /> Not Approved
            </button>

            <button
              type="button"
              onClick={() => setAdminDriverStatus('pending')}
              style={{
                padding: '10px 6px',
                borderRadius: '10px',
                border: 'none',
                background: theme.gold,
                color: '#090d16',
                fontWeight: 900,
                fontSize: '11px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '3px',
                cursor: 'pointer'
              }}
            >
              <Clock size={13} /> Pending
            </button>
          </div>

          <form onSubmit={sendBroadcast} style={{ background: theme.box, borderRadius: '10px', padding: '10px' }}>
            <div style={{ fontSize: '12px', fontWeight: 800, marginBottom: '6px' }}>Send Broadcast / Warning to Drivers</div>
            <input
              value={broadcastInput}
              onChange={(e) => setBroadcastInput(e.target.value)}
              placeholder="Write alert or bonus message..."
              style={{ width: '100%', padding: '8px', borderRadius: '8px', border: `1px solid ${theme.border}`, background: theme.bg, color: theme.text, fontSize: '12px', marginBottom: '8px', boxSizing: 'border-box' }}
            />
            <button type="submit" style={{ width: '100%', padding: '9px', borderRadius: '8px', border: 'none', background: theme.gold, color: '#090d16', fontWeight: 900, fontSize: '12px', cursor: 'pointer' }}>
              Broadcast Message
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

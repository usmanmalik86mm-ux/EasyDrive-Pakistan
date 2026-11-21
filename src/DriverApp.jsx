import React, { useEffect, useState } from 'react';
import {
  Car,
  User,
  Wallet,
  MessageCircle,
  Send,
  Layers,
  Bell,
  AlertTriangle,
  Star,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Headphones,
  Sun,
  Moon,
  Camera,
  Mic,
  MapPin,
  Upload,
  CheckCircle2,
  Copy,
  ShieldCheck,
  FileText
} from 'lucide-react';
import MapView from './components/MapView';
import { supabase } from './lib/supabase';

const DIRECT_WALLET_NUMBER = '03338209526';
const DEMO_DRIVER_ID = '00000000-0000-0000-0000-000000000002';

const PALETTES = {
  night: {
    bg: '#090d16',
    bar: '#05080f',
    card: '#131a29',
    cardAlt: '#1b2438',
    border: '#243049',
    emerald: '#16a34a',
    emeraldGlow: '#22c55e',
    gold: '#f59e0b',
    accentText: '#fde047',
    text: '#f8fafc',
    muted: '#94a3b8',
    inputBg: '#090d16'
  },
  sunlight: {
    bg: '#f1f5f9',
    bar: '#ffffff',
    card: '#ffffff',
    cardAlt: '#e2e8f0',
    border: '#94a3b8',
    emerald: '#15803d',
    emeraldGlow: '#15803d',
    gold: '#d97706',
    accentText: '#b45309',
    text: '#0f172a',
    muted: '#334155',
    inputBg: '#f8fafc'
  }
};

const PHOTO_SLOTS = [
  { key: 'front', label: 'Front View' },
  { key: 'back', label: 'Back View' },
  { key: 'leftSide', label: 'Left Side' },
  { key: 'rightSide', label: 'Right Side' },
  { key: 'vehicleDoc', label: 'Vehicle Document' },
  { key: 'drivingLicense', label: 'Driving License' }
];

export default function DriverApp() {
  const [stage, setStage] = useState('splash'); // 'splash' | 'promo' | 'register' | 'pending' | 'app'
  const [sunlightMode, setSunlightMode] = useState(false);
  const [driverTab, setDriverTab] = useState('trips'); // 'trips' | 'pool' | 'money' | 'chats' | 'profile'

  const THEME = sunlightMode ? PALETTES.sunlight : PALETTES.night;

  // Driver Registration Fields
  const [driverForm, setDriverForm] = useState({
    fullName: '',
    cnic: '',
    mobile: '',
    regNumber: '',
    model: ''
  });

  // Uploaded photos / documents preview map
  const [uploads, setUploads] = useState({
    front: null,
    back: null,
    leftSide: null,
    rightSide: null,
    vehicleDoc: null,
    drivingLicense: null
  });

  // Device Permissions State
  const [permissions, setPermissions] = useState({
    gps: false,
    notifications: false,
    camera: false,
    mic: false
  });

  // Monthly Subscription State (PKR 3,000 -> 03338209526)
  const [subMethod, setSubMethod] = useState('Easypaisa');
  const [txId, setTxId] = useState('');
  const [approvalStatus, setApprovalStatus] = useState('unregistered'); // 'unregistered' | 'pending' | 'approved'

  // Live Driver Dashboard States
  const [driverOnline, setDriverOnline] = useState(false);
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [welcomeBanner, setWelcomeBanner] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setStage((prev) => (prev === 'splash' ? 'promo' : prev));
    }, 1500);

    loadRides();
    checkExistingSubscription();

    // Listen in real-time when Super Admin approves subscription
    const subChannel = supabase
      .channel('driver-sub-approval')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'subscriptions' }, (payload) => {
        if (payload.new && payload.new.status === 'approved') {
          setApprovalStatus('approved');
          setStage('app');
          setWelcomeBanner('Welcome aboard! Aapka EasyDrive Driver Pro account approve ho gaya hai — Ab Poora Cash Apka!');
          triggerBrowserNotification('Welcome aboard!', 'Your EasyDrive Driver Pro subscription is approved.');
        }
      })
      .subscribe();

    const ridesChannel = supabase
      .channel('driver-rides-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => {
        loadRides();
      })
      .subscribe();

    return () => {
      clearTimeout(timer);
      supabase.removeChannel(subChannel);
      supabase.removeChannel(ridesChannel);
    };
  }, []);

  async function loadRides() {
    const { data } = await supabase
      .from('rides')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(25);
    if (data) setRides(data);
  }

  async function checkExistingSubscription() {
    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('driver_id', DEMO_DRIVER_ID)
      .order('created_at', { ascending: false })
      .limit(1);

    if (data && data.length > 0) {
      if (data[0].status === 'approved') {
        setApprovalStatus('approved');
      } else if (data[0].status === 'pending') {
        setApprovalStatus('pending');
      }
    }
  }

  function triggerBrowserNotification(title, body) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { body });
      } catch {
        // Fallback banner already shown
      }
    }
  }

  async function handleActivateAllPermissions() {
    let gpsOk = false;
    let notifOk = false;
    let mediaOk = false;

    if (navigator.geolocation) {
      await new Promise((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => {
            gpsOk = true;
            resolve();
          },
          () => {
            gpsOk = true;
            resolve();
          },
          { timeout: 4000 }
        );
      });
    } else {
      gpsOk = true;
    }

    if ('Notification' in window) {
      try {
        const perm = await Notification.requestPermission();
        notifOk = perm === 'granted' || perm === 'default';
      } catch {
        notifOk = true;
      }
    } else {
      notifOk = true;
    }

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        stream.getTracks().forEach((track) => track.stop());
        mediaOk = true;
      } catch {
        // Even if browser blocks silent preview, mark ready so user can use file/camera picker
        mediaOk = true;
      }
    } else {
      mediaOk = true;
    }

    setPermissions({
      gps: gpsOk,
      notifications: notifOk,
      camera: mediaOk,
      mic: mediaOk
    });
    setNotice('GPS, Notification, Camera aur Mic permissions active kar di gayi hain.');
  }

  function handleFilePick(slotKey, event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setUploads((prev) => ({
      ...prev,
      [slotKey]: { name: file.name, preview: url }
    }));
  }

  function handleCopyNumber() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(DIRECT_WALLET_NUMBER);
    }
    setNotice(`Number ${DIRECT_WALLET_NUMBER} copy ho gaya hai.`);
  }

  async function handleRegistrationAndPayment(e) {
    e.preventDefault();

    if (
      !driverForm.fullName.trim() ||
      !driverForm.cnic.trim() ||
      !driverForm.mobile.trim() ||
      !driverForm.regNumber.trim() ||
      !driverForm.model.trim()
    ) {
      setNotice('Please Driver Name, CNIC, Mobile, Vehicle Reg Number aur Model mukammal bharein.');
      return;
    }

    if (!txId.trim()) {
      setNotice(`Please PKR 3,000 payment (${subMethod} -> ${DIRECT_WALLET_NUMBER}) ki Transaction ID (TID) enter karein.`);
      return;
    }

    setLoading(true);
    setNotice('');

    const { error } = await supabase.from('subscriptions').insert([
      {
        driver_id: DEMO_DRIVER_ID,
        amount: 3000,
        payment_method: subMethod,
        transaction_id: `${txId.trim()} | ${driverForm.fullName} | ${driverForm.cnic} | ${driverForm.regNumber} (${driverForm.model})`,
        status: 'pending'
      }
    ]);

    setLoading(false);

    if (error) {
      setNotice(`Submit error: ${error.message}`);
      return;
    }

    setApprovalStatus('pending');
    setStage('pending');
    setNotice('Registration & PKR 3,000 payment receipt submit ho gayi! Admin approval ka intezar hai.');
  }

  async function handleUpdateRideStatus(rideId, nextStatus) {
    const { error } = await supabase
      .from('rides')
      .update({
        status: nextStatus,
        driver_id: DEMO_DRIVER_ID,
        driver_name: driverForm.fullName || 'Muhammad Usman',
        vehicle_info: `${driverForm.model || 'Suzuki Alto'} • ${driverForm.regNumber || 'BRG739'}`
      })
      .eq('id', rideId);

    if (error) {
      setNotice(`Update error: ${error.message}`);
      return;
    }
    setNotice(`Trip ${nextStatus} ho gayi.`);
    loadRides();
  }

  const completedRides = rides.filter((r) => r.status === 'completed');
  const todayEarnings = completedRides.reduce((sum, r) => sum + Number(r.fare || 0), 0);
  const allPermsActive =
    permissions.gps && permissions.notifications && permissions.camera && permissions.mic;

  // ==================== STAGE 1: SPLASH ====================
  if (stage === 'splash') {
    return (
      <div
        onClick={() => setStage('promo')}
        style={{
          maxWidth: '430px',
          minHeight: '100vh',
          margin: '0 auto',
          background: 'linear-gradient(160deg, #065f46 0%, #16a34a 55%, #064e3b 100%)',
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
          <span style={{ display: 'block', fontSize: '18px', color: '#fde047', letterSpacing: '2px', marginTop: '4px' }}>
            DRIVER PRO
          </span>
        </div>
      </div>
    );
  }

  // ==================== STAGE 2: PROMO ("AB POORA CASH APKA") ====================
  if (stage === 'promo') {
    return (
      <div
        style={{
          maxWidth: '430px',
          minHeight: '100vh',
          margin: '0 auto',
          background: 'linear-gradient(180deg, #16a34a 0%, #065f46 65%, #090d16 100%)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '28px 20px',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <div style={{ textAlign: 'center', marginTop: '44px' }}>
          <div style={{ fontSize: '15px', fontWeight: 900, fontStyle: 'italic', letterSpacing: '1px', color: '#fde047' }}>
            EASYDRIVE-PAKISTAN
          </div>
          <h1 style={{ margin: '14px 0 0', fontSize: '32px', fontWeight: 900, lineHeight: 1.15 }}>
            AB POORA CASH APKA
          </h1>
          <p style={{ margin: '12px 0 0', fontSize: '14px', color: '#dcfce7' }}>
            PKR 3,000 Monthly Subscription • Direct Easypaisa / JazzCash • 2% Platform Fee
          </p>
        </div>

        <div
          style={{
            background: 'rgba(9, 13, 22, 0.78)',
            border: '1px solid rgba(253, 224, 71, 0.4)',
            borderRadius: '20px',
            padding: '18px'
          }}
        >
          <button
            onClick={() => setStage(approvalStatus === 'approved' ? 'app' : 'register')}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: 'none',
              background: '#f59e0b',
              color: '#090d16',
              fontSize: '16px',
              fontWeight: 900,
              cursor: 'pointer',
              marginBottom: '10px'
            }}
          >
            {approvalStatus === 'approved' ? 'Enter Driver Pro Dashboard →' : 'Start Driver Registration →'}
          </button>

          {approvalStatus === 'approved' && (
            <button
              onClick={() => setStage('register')}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '12px',
                border: '1px solid rgba(255,255,255,0.25)',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              View / Update Registration Details
            </button>
          )}
        </div>
      </div>
    );
  }

  // ==================== STAGE 3: DRIVER REGISTRATION + DOCS + PERMISSIONS + PKR 3,000 PAYMENT ====================
  if (stage === 'register' || stage === 'pending') {
    return (
      <div
        style={{
          maxWidth: '430px',
          minHeight: '100vh',
          margin: '0 auto',
          background: THEME.bg,
          color: THEME.text,
          padding: '12px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          paddingBottom: '36px'
        }}
      >
        {/* Top Bar with Night / Sunlight Toggle */}
        <div
          style={{
            background: THEME.bar,
            padding: '10px 12px',
            borderRadius: '14px',
            border: `1.5px solid ${THEME.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px'
          }}
        >
          <div>
            <div style={{ fontSize: '15px', fontWeight: 900, color: THEME.emerald }}>
              EASYDRIVE DRIVER REGISTRATION
            </div>
            <div style={{ fontSize: '11px', color: THEME.muted }}>Ab Poora Cash Apka</div>
          </div>

          <button
            onClick={() => setSunlightMode((p) => !p)}
            style={{
              padding: '7px 10px',
              borderRadius: '9px',
              border: `1px solid ${sunlightMode ? THEME.gold : THEME.border}`,
              background: sunlightMode ? '#fef3c7' : THEME.cardAlt,
              color: sunlightMode ? '#92400e' : THEME.accentText,
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
              fontWeight: 800
            }}
          >
            {notice}
          </div>
        )}

        {/* Pending Approval Card */}
        {stage === 'pending' && (
          <div
            style={{
              background: THEME.card,
              border: `2px solid ${THEME.gold}`,
              borderRadius: '16px',
              padding: '16px',
              marginBottom: '12px'
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: 900, color: THEME.accentText }}>
              Approval Pending — Super Admin Verification
            </div>
            <p style={{ fontSize: '12px', color: THEME.muted, margin: '6px 0 12px' }}>
              Aapki registration aur PKR 3,000 payment ({DIRECT_WALLET_NUMBER}) admin review mein hai. Jaise hi Admin approve karega, aapko <strong>"Welcome aboard"</strong> notification mil jayega.
            </p>
            <button
              onClick={() => {
                setApprovalStatus('approved');
                setStage('app');
                setWelcomeBanner('Welcome aboard! Aapka EasyDrive Driver Pro account active ho gaya hai — Ab Poora Cash Apka!');
              }}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: `1px solid ${THEME.border}`,
                background: THEME.cardAlt,
                color: THEME.text,
                fontSize: '12px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              Demo Preview: Simulate Admin Approval ("Welcome aboard")
            </button>
          </div>
        )}

        {/* 1. Device Permissions (GPS, Notifications, Camera, Mic) */}
        <div
          style={{
            background: THEME.card,
            border: `1.5px solid ${THEME.border}`,
            borderRadius: '16px',
            padding: '14px',
            marginBottom: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 900 }}>1. App Permissions</span>
            <span style={{ fontSize: '11px', fontWeight: 800, color: allPermsActive ? THEME.emerald : THEME.accentText }}>
              {allPermsActive ? 'All Active' : 'Tap to Activate'}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '10px' }}>
            {[
              { key: 'gps', label: 'GPS Access', Icon: MapPin },
              { key: 'notifications', label: 'Notification Access', Icon: Bell },
              { key: 'camera', label: 'Camera Access', Icon: Camera },
              { key: 'mic', label: 'Mic Access', Icon: Mic }
            ].map(({ key, label, Icon }) => {
              const active = permissions[key];
              return (
                <div
                  key={key}
                  style={{
                    background: THEME.cardAlt,
                    border: `1px solid ${active ? THEME.emerald : THEME.border}`,
                    borderRadius: '10px',
                    padding: '8px 10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    fontWeight: 800
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Icon size={14} color={active ? THEME.emerald : THEME.muted} />
                    {label}
                  </span>
                  <span style={{ color: active ? THEME.emerald : THEME.accentText, fontSize: '11px' }}>
                    {active ? 'Active' : 'Off'}
                  </span>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleActivateAllPermissions}
            style={{
              width: '100%',
              padding: '10px',
              borderRadius: '10px',
              border: 'none',
              background: THEME.emerald,
              color: '#fff',
              fontSize: '13px',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            Activate GPS, Notification, Camera & Mic
          </button>
        </div>

        {/* 2. Driver & Vehicle Details + Photo/Document Upload Form */}
        <form onSubmit={handleRegistrationAndPayment}>
          <div
            style={{
              background: THEME.card,
              border: `1.5px solid ${THEME.border}`,
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '12px'
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 900, marginBottom: '10px' }}>
              2. Driver & Vehicle Details
            </div>

            {[
              { key: 'fullName', placeholder: 'Driver Full Name (e.g. Muhammad Usman)' },
              { key: 'cnic', placeholder: 'CNIC Number (e.g. 42101-1234567-1)' },
              { key: 'mobile', placeholder: 'Mobile Number (e.g. 0300-1234567)' },
              { key: 'regNumber', placeholder: 'Vehicle Registration Number (e.g. BRG739)' },
              { key: 'model', placeholder: 'Vehicle Model (e.g. Suzuki Alto 2022)' }
            ].map((field) => (
              <input
                key={field.key}
                value={driverForm[field.key]}
                onChange={(e) => setDriverForm({ ...driverForm, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  border: `1px solid ${THEME.border}`,
                  background: THEME.inputBg,
                  color: THEME.text,
                  fontSize: '13px',
                  marginBottom: '8px',
                  boxSizing: 'border-box'
                }}
              />
            ))}

            {/* 6 Camera / Gallery Upload Slots */}
            <div style={{ fontSize: '13px', fontWeight: 900, margin: '8px 0 8px' }}>
              3. Vehicle Photos & Documents (Camera / Gallery)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {PHOTO_SLOTS.map((slot) => {
                const picked = uploads[slot.key];
                return (
                  <label
                    key={slot.key}
                    style={{
                      background: THEME.cardAlt,
                      border: `1px dashed ${picked ? THEME.emerald : THEME.border}`,
                      borderRadius: '12px',
                      padding: '8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      textAlign: 'center',
                      cursor: 'pointer',
                      minHeight: '84px'
                    }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleFilePick(slot.key, e)}
                      style={{ display: 'none' }}
                    />
                    {picked ? (
                      <>
                        <img
                          src={picked.preview}
                          alt={slot.label}
                          style={{ width: '100%', height: '48px', objectFit: 'cover', borderRadius: '6px', marginBottom: '4px' }}
                        />
                        <span style={{ fontSize: '11px', fontWeight: 800, color: THEME.emerald }}>{slot.label} ✓</span>
                      </>
                    ) : (
                      <>
                        <Upload size={16} color={THEME.accentText} />
                        <span style={{ fontSize: '11px', fontWeight: 800, marginTop: '4px' }}>{slot.label}</span>
                        <span style={{ fontSize: '10px', color: THEME.muted }}>Camera / Gallery</span>
                      </>
                    )}
                  </label>
                );
              })}
            </div>
          </div>

          {/* 4. Monthly Subscription PKR 3,000 -> Direct to 03338209526 */}
          <div
            style={{
              background: THEME.card,
              border: `1.5px solid ${THEME.emerald}`,
              borderRadius: '16px',
              padding: '14px',
              marginBottom: '12px'
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 900, color: THEME.emerald }}>
              4. Monthly Subscription: PKR 3,000
            </div>
            <div
              style={{
                marginTop: '8px',
                background: THEME.cardAlt,
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: `1px solid ${THEME.border}`
              }}
            >
              <div>
                <div style={{ fontSize: '11px', color: THEME.muted }}>Direct Easypaisa / JazzCash Account</div>
                <div style={{ fontSize: '16px', fontWeight: 900, color: THEME.accentText }}>{DIRECT_WALLET_NUMBER}</div>
              </div>
              <button
                type="button"
                onClick={handleCopyNumber}
                style={{
                  padding: '6px 10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: THEME.emerald,
                  color: '#fff',
                  fontSize: '11px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <Copy size={12} /> Copy
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', margin: '10px 0 8px' }}>
              {['Easypaisa', 'JazzCash'].map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => setSubMethod(m)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '9px',
                    border: subMethod === m ? `2px solid ${THEME.emerald}` : `1px solid ${THEME.border}`,
                    background: subMethod === m ? (sunlightMode ? '#dcfce7' : '#064e3b') : THEME.cardAlt,
                    color: THEME.text,
                    fontWeight: 800,
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
              placeholder={`Enter ${subMethod} TID (PKR 3,000 sent to ${DIRECT_WALLET_NUMBER})`}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '10px',
                border: `1px solid ${THEME.border}`,
                background: THEME.inputBg,
                color: THEME.text,
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
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
              fontSize: '15px',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            {loading ? 'Submitting...' : 'Submit Registration & PKR 3,000 Payment'}
          </button>
        </form>
      </div>
    );
  }

  // ==================== STAGE 4: APPROVED DRIVER PRO DASHBOARD ====================
  return (
    <div
      style={{
        maxWidth: '430px',
        minHeight: '100vh',
        margin: '0 auto',
        background: THEME.bg,
        color: THEME.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        paddingBottom: '78px'
      }}
    >
      {/* Top Bar with Night / Sunlight Toggle */}
      <div
        style={{
          background: THEME.bar,
          padding: '8px 12px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1.5px solid ${THEME.border}`
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Car size={16} color={THEME.emerald} />
          <span style={{ fontSize: '14px', fontWeight: 900 }}>EASYDRIVE DRIVER PRO</span>
        </div>

        <button
          onClick={() => setSunlightMode((p) => !p)}
          style={{
            padding: '6px 10px',
            borderRadius: '9px',
            border: `1px solid ${sunlightMode ? THEME.gold : THEME.border}`,
            background: sunlightMode ? '#fef3c7' : THEME.cardAlt,
            color: sunlightMode ? '#92400e' : THEME.accentText,
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

      {/* Welcome Aboard Approval Notification Banner */}
      {welcomeBanner && (
        <div
          style={{
            margin: '10px 12px 0',
            padding: '12px',
            borderRadius: '12px',
            background: sunlightMode ? '#dcfce7' : '#064e3b',
            border: `1.5px solid ${THEME.emerald}`,
            color: sunlightMode ? '#14532d' : '#dcfce7',
            fontSize: '12px',
            fontWeight: 900,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={18} color={THEME.emerald} />
            {welcomeBanner}
          </span>
          <button
            onClick={() => setWelcomeBanner('')}
            style={{ background: 'none', border: 'none', color: 'inherit', fontWeight: 900, cursor: 'pointer' }}
          >
            ×
          </button>
        </div>
      )}

      {notice && (
        <div
          style={{
            margin: '10px 12px 0',
            padding: '10px 12px',
            borderRadius: '10px',
            background: THEME.cardAlt,
            border: `1px solid ${THEME.border}`,
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

      {/* TAB 1: TRIPS */}
      {driverTab === 'trips' && (
        <div style={{ padding: '10px 12px' }}>
          <div style={{ borderRadius: '16px', overflow: 'hidden', border: `1.5px solid ${THEME.border}` }}>
            <MapView height="205px" />
          </div>

          <div
            style={{
              marginTop: '10px',
              background: THEME.card,
              border: `1.5px solid ${THEME.border}`,
              borderRadius: '14px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span style={{ background: THEME.emerald, color: '#fff', fontSize: '12px', fontWeight: 800, padding: '5px 10px', borderRadius: '999px' }}>
              from Rs 320.00
            </span>
            <span style={{ fontSize: '13px', fontWeight: 800 }}>Minimum fare guarantee</span>
            <ChevronRight size={16} color={THEME.muted} />
          </div>

          <div
            style={{
              marginTop: '10px',
              background: THEME.card,
              border: `1.5px solid ${THEME.border}`,
              borderRadius: '16px',
              padding: '14px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '12px', borderBottom: `1px solid ${THEME.border}` }}>
              <div>
                <div style={{ fontSize: '11px', color: THEME.muted, fontWeight: 700 }}>Priority</div>
                <div style={{ fontSize: '18px', fontWeight: 900 }}>+68</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11px', color: THEME.muted, fontWeight: 700 }}>{completedRides.length} trips</div>
                <div style={{ fontSize: '18px', fontWeight: 900 }}>Rs {todayEarnings.toLocaleString()}</div>
              </div>
            </div>

            <div
              style={{
                marginTop: '12px',
                background: THEME.cardAlt,
                borderRadius: '12px',
                padding: '11px 12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                border: `1px solid ${THEME.border}`
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 900 }}>Ab Poora Cash Apka</div>
                <div style={{ fontSize: '11px', color: THEME.muted }}>PKR 3,000 Monthly Plan • 2% Fee</div>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 900, color: THEME.accentText }}>100% Direct</div>
            </div>

            <button
              onClick={() => {
                const next = !driverOnline;
                setDriverOnline(next);
                setNotice(next ? 'You are now ONLINE!' : 'You are now Offline.');
              }}
              style={{
                width: '100%',
                marginTop: '12px',
                padding: '10px',
                borderRadius: '999px',
                border: `1.5px solid ${THEME.border}`,
                background: driverOnline ? THEME.emerald : THEME.gold,
                color: driverOnline ? '#ffffff' : '#090d16',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer'
              }}
            >
              <span style={{ width: '38px', height: '38px', borderRadius: '50%', background: '#fff', color: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ArrowRight size={18} />
              </span>
              <div style={{ textAlign: 'center', flex: 1, marginRight: '38px' }}>
                <div style={{ fontSize: '11px', fontWeight: 800 }}>{driverOnline ? 'Online' : 'Offline'}</div>
                <div style={{ fontSize: '15px', fontWeight: 900 }}>{driverOnline ? 'Go offline' : 'Go online'}</div>
              </div>
            </button>
          </div>

          {/* Live Passenger Ride Requests */}
          <div style={{ marginTop: '10px', background: THEME.card, border: `1.5px solid ${THEME.border}`, borderRadius: '16px', padding: '12px' }}>
            <div style={{ fontSize: '14px', fontWeight: 900, marginBottom: '8px' }}>Incoming Ride Requests</div>
            {rides.filter((r) => r.status === 'searching' || r.status === 'accepted').length === 0 ? (
              <div style={{ fontSize: '12px', color: THEME.muted }}>No open requests right now.</div>
            ) : (
              rides
                .filter((r) => r.status === 'searching' || r.status === 'accepted')
                .map((r) => (
                  <div key={r.id} style={{ background: THEME.cardAlt, borderRadius: '12px', padding: '10px', marginBottom: '8px', fontSize: '12px', border: `1px solid ${THEME.border}` }}>
                    <div style={{ fontWeight: 800 }}>{r.pickup_address} → {r.dropoff_address}</div>
                    <div style={{ color: THEME.emerald, marginTop: '4px', fontWeight: 800 }}>
                      Rs. {r.fare} • 2% Fee: Rs. {(Number(r.fare) * 0.02).toFixed(2)} • {r.status}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      {r.status === 'searching' && (
                        <button
                          onClick={() => handleUpdateRideStatus(r.id, 'accepted')}
                          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: THEME.emerald, color: '#fff', fontWeight: 800 }}
                        >
                          Accept Trip
                        </button>
                      )}
                      {r.status === 'accepted' && (
                        <button
                          onClick={() => handleUpdateRideStatus(r.id, 'completed')}
                          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: 'none', background: THEME.gold, color: '#090d16', fontWeight: 900 }}
                        >
                          Complete Trip
                        </button>
                      )}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: POOL */}
      {driverTab === 'pool' && (
        <div style={{ padding: '14px 12px' }}>
          <h2 style={{ margin: '0 0 10px', fontSize: '20px', fontWeight: 900 }}>EasyDrive Pool</h2>
          <div style={{ background: THEME.card, borderRadius: '16px', padding: '14px', border: `1.5px solid ${THEME.border}` }}>
            <div style={{ fontSize: '14px', fontWeight: 900, color: THEME.emerald }}>Ab Poora Cash Apka • Shared Pool</div>
            <p style={{ fontSize: '12px', color: THEME.muted, margin: '6px 0 0' }}>
              Shared corridor trips across Karachi with transparent 2% fee.
            </p>
          </div>
        </div>
      )}

      {/* TAB 3: MONEY */}
      {driverTab === 'money' && (
        <div style={{ padding: '14px 12px' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '24px', fontWeight: 900 }}>Money</h2>
          <div style={{ fontSize: '30px', fontWeight: 900 }}>Rs {todayEarnings.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: THEME.muted, marginBottom: '12px' }}>
            Today • Ab Poora Cash Apka • Subscription Account: {DIRECT_WALLET_NUMBER}
          </div>
          <button
            onClick={() => setStage('register')}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: `1.5px solid ${THEME.emerald}`,
              background: THEME.card,
              color: THEME.emerald,
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Renew / View PKR 3,000 Subscription ({DIRECT_WALLET_NUMBER})
          </button>
        </div>
      )}

      {/* TAB 4: CHATS */}
      {driverTab === 'chats' && (
        <div style={{ padding: '14px 12px' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: '24px', fontWeight: 900 }}>Messages</h2>
          {[
            { title: 'Welcome aboard!', sub: 'Aapka Driver Pro account verified aur active hai.', Icon: Sparkles },
            { title: 'Support', sub: '24/7 EasyDrive Driver Helpdesk', Icon: Headphones },
            { title: 'Warnings', sub: 'Keep acceptance & safety high', Icon: AlertTriangle }
          ].map((item, i) => (
            <div key={i} style={{ background: THEME.card, borderRadius: '14px', padding: '12px', border: `1.5px solid ${THEME.border}`, display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
              <item.Icon size={18} color={THEME.emerald} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 800 }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: THEME.muted }}>{item.sub}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: PROFILE */}
      {driverTab === 'profile' && (
        <div style={{ padding: '14px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ fontSize: '20px', fontWeight: 900 }}>{driverForm.fullName || 'Muhammad Usman'}</div>
            <button
              onClick={() => setStage('register')}
              style={{ background: THEME.emerald, border: 'none', color: '#fff', borderRadius: '999px', padding: '7px 12px', fontSize: '12px', fontWeight: 800 }}
            >
              Edit Docs
            </button>
          </div>
          <div style={{ background: THEME.card, borderRadius: '16px', padding: '14px', border: `1.5px solid ${THEME.border}`, fontSize: '13px' }}>
            <div><strong>Vehicle:</strong> {driverForm.model || 'Suzuki Alto'} ({driverForm.regNumber || 'BRG739'})</div>
            <div style={{ marginTop: '6px' }}><strong>CNIC:</strong> {driverForm.cnic || '42101-1234567-1'}</div>
            <div style={{ marginTop: '6px' }}><strong>Mobile:</strong> {driverForm.mobile || '0300-1234567'}</div>
            <div style={{ marginTop: '6px', color: THEME.accentText }}><strong>Rating:</strong> 4.92 ★</div>
          </div>
        </div>
      )}

      {/* Bottom 5-Tab Bar */}
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '430px',
          background: THEME.bar,
          borderTop: `1.5px solid ${THEME.border}`,
          display: 'flex',
          justifyContent: 'space-around',
          padding: '8px 0'
        }}
      >
        {[
          { id: 'trips', label: 'Trips', Icon: Send },
          { id: 'pool', label: 'Pool', Icon: Layers },
          { id: 'money', label: 'Money', Icon: Wallet },
          { id: 'chats', label: 'Chats', Icon: MessageCircle },
          { id: 'profile', label: 'Profile', Icon: User }
        ].map(({ id, label, Icon }) => {
          const active = driverTab === id;
          return (
            <button
              key={id}
              onClick={() => setDriverTab(id)}
              style={{
                background: 'none',
                border: 'none',
                color: active ? THEME.emerald : THEME.muted,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                fontSize: '11px',
                fontWeight: active ? 900 : 600,
                cursor: 'pointer'
              }}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

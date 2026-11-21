import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Check,
  X,
  Car,
  Wallet,
  Sun,
  Moon,
  RefreshCw,
  Sparkles,
  MapPin
} from 'lucide-react';
import { supabase } from './lib/supabase';

const DIRECT_WALLET_NUMBER = '03338209526';

const PALETTES = {
  night: {
    bg: '#090d16',
    bar: '#05080f',
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
    bar: '#ffffff',
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

export default function AdminApp() {
  const [sunlightMode, setSunlightMode] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [rides, setRides] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  const THEME = sunlightMode ? PALETTES.sunlight : PALETTES.night;

  useEffect(() => {
    loadAdminData();

    const channel = supabase
      .channel('admin-live-monitor')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'rides' }, () => {
        loadAdminData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'subscriptions' }, () => {
        loadAdminData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function loadAdminData() {
    setLoading(true);
    const { data: ridesData } = await supabase
      .from('rides')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    const { data: subsData } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30);

    if (ridesData) setRides(ridesData);
    if (subsData) setSubscriptions(subsData);
    setLoading(false);
  }

  async function handleSubscriptionDecision(subId, status) {
    const { error } = await supabase
      .from('subscriptions')
      .update({ status })
      .eq('id', subId);

    if (error) {
      setNotice(`Update error: ${error.message}`);
      return;
    }

    if (status === 'approved') {
      setNotice('Approved! Driver ko "Welcome aboard" live notification bhej diya gaya hai.');
    } else {
      setNotice('Subscription rejected.');
    }
    loadAdminData();
  }

  const totalCommission = rides
    .reduce((sum, r) => sum + Number(r.fare || 0) * 0.02, 0)
    .toFixed(2);
  const approvedSubs = subscriptions.filter((s) => s.status === 'approved');
  const subRevenue = approvedSubs.length * 3000;

  return (
    <div
      style={{
        maxWidth: '430px',
        minHeight: '100vh',
        margin: '0 auto',
        background: THEME.bg,
        color: THEME.text,
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '12px',
        paddingBottom: '36px'
      }}
    >
      {/* Top Bar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={18} color={THEME.emerald} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 900 }}>EASYDRIVE SUPER ADMIN</div>
            <div style={{ fontSize: '10px', color: THEME.muted }}>Wallet: {DIRECT_WALLET_NUMBER}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={loadAdminData}
            style={{
              padding: '7px 9px',
              borderRadius: '9px',
              border: `1px solid ${THEME.border}`,
              background: THEME.card,
              color: THEME.text,
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer'
            }}
          >
            <RefreshCw size={14} />
          </button>

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

      {!unlocked ? (
        <div
          style={{
            background: THEME.card,
            borderRadius: '16px',
            padding: '18px',
            border: `1.5px solid ${THEME.border}`
          }}
        >
          <h2 style={{ margin: '0 0 6px', fontSize: '17px', fontWeight: 900 }}>Super Admin Live Console</h2>
          <p style={{ margin: '0 0 12px', fontSize: '12px', color: THEME.muted }}>
            Enter Admin PIN to manage Driver registrations, PKR 3,000 payments & live rides (Demo PIN: <strong>1234</strong>).
          </p>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter Admin PIN"
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '10px',
              border: `1px solid ${THEME.border}`,
              background: THEME.inputBg,
              color: THEME.text,
              marginBottom: '10px',
              boxSizing: 'border-box'
            }}
          />
          <button
            onClick={() => {
              if (pin === '1234') {
                setUnlocked(true);
                setNotice('Super Admin Live Console unlocked.');
              } else {
                setNotice('Invalid PIN. Use 1234.');
              }
            }}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              border: 'none',
              background: THEME.emerald,
              color: '#fff',
              fontWeight: 900,
              cursor: 'pointer'
            }}
          >
            Unlock Management App
          </button>
        </div>
      ) : (
        <>
          {/* Live KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            <div style={{ background: THEME.card, padding: '12px', borderRadius: '14px', border: `1.5px solid ${THEME.border}` }}>
              <div style={{ fontSize: '11px', color: THEME.muted }}>Live / Total Rides</div>
              <div style={{ fontSize: '20px', fontWeight: 900 }}>{rides.length}</div>
            </div>
            <div style={{ background: THEME.card, padding: '12px', borderRadius: '14px', border: `1.5px solid ${THEME.border}` }}>
              <div style={{ fontSize: '11px', color: THEME.muted }}>2% Platform Fee</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: THEME.emerald }}>Rs. {totalCommission}</div>
            </div>
            <div style={{ background: THEME.card, padding: '12px', borderRadius: '14px', border: `1.5px solid ${THEME.border}` }}>
              <div style={{ fontSize: '11px', color: THEME.muted }}>Approved Drivers</div>
              <div style={{ fontSize: '20px', fontWeight: 900, color: THEME.accentText }}>{approvedSubs.length}</div>
            </div>
            <div style={{ background: THEME.card, padding: '12px', borderRadius: '14px', border: `1.5px solid ${THEME.border}` }}>
              <div style={{ fontSize: '11px', color: THEME.muted }}>Sub Revenue</div>
              <div style={{ fontSize: '18px', fontWeight: 900 }}>PKR {subRevenue.toLocaleString()}</div>
            </div>
          </div>

          {/* Driver Registration & PKR 3,000 Subscription Approvals */}
          <div
            style={{
              background: THEME.card,
              borderRadius: '16px',
              padding: '12px',
              border: `1.5px solid ${THEME.border}`,
              marginBottom: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '14px', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Wallet size={16} color={THEME.emerald} /> Driver Approvals (PKR 3,000)
              </span>
              {loading && <span style={{ fontSize: '11px', color: THEME.muted }}>Syncing...</span>}
            </div>

            {subscriptions.length === 0 ? (
              <div style={{ fontSize: '12px', color: THEME.muted }}>No driver registration/payment requests yet.</div>
            ) : (
              subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  style={{
                    background: THEME.cardAlt,
                    borderRadius: '12px',
                    padding: '10px',
                    marginBottom: '8px',
                    border: `1px solid ${THEME.border}`,
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800 }}>
                    <span>{sub.payment_method} • PKR {sub.amount}</span>
                    <span style={{ color: sub.status === 'approved' ? THEME.emerald : THEME.accentText }}>
                      {sub.status.toUpperCase()}
                    </span>
                  </div>
                  <div style={{ color: THEME.muted, marginTop: '4px', wordBreak: 'break-word' }}>
                    {sub.transaction_id}
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                      onClick={() => handleSubscriptionDecision(sub.id, 'approved')}
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: THEME.emerald,
                        color: '#fff',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Check size={14} /> Approve & Notify
                    </button>
                    <button
                      onClick={() => handleSubscriptionDecision(sub.id, 'rejected')}
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#dc2626',
                        color: '#fff',
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={14} /> Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Live Rides Stream */}
          <div
            style={{
              background: THEME.card,
              borderRadius: '16px',
              padding: '12px',
              border: `1.5px solid ${THEME.border}`
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 900, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Car size={16} color={THEME.emerald} /> Live Passenger & Driver Rides
            </div>

            {rides.length === 0 ? (
              <div style={{ fontSize: '12px', color: THEME.muted }}>No rides recorded yet.</div>
            ) : (
              rides.slice(0, 8).map((r) => (
                <div
                  key={r.id}
                  style={{
                    background: THEME.cardAlt,
                    borderRadius: '10px',
                    padding: '9px 10px',
                    marginBottom: '6px',
                    border: `1px solid ${THEME.border}`,
                    fontSize: '12px'
                  }}
                >
                  <div style={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={13} color={THEME.emerald} />
                    {r.pickup_address} → {r.dropoff_address}
                  </div>
                  <div style={{ color: THEME.muted, marginTop: '3px' }}>
                    Fare: Rs. {r.fare} • 2% Fee: Rs. {(Number(r.fare) * 0.02).toFixed(2)} • Status: <strong>{r.status}</strong>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}

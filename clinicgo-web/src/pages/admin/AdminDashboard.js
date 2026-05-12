import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { adminAPI } from '../../services/api';

// ── Animated counter ────────────────────────────────────────────────
function useCountUp(target, duration = 900) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    if (target === null || target === undefined || target === '-') return;
    const numeric = parseFloat(String(target).replace(/[^0-9.]/g, ''));
    if (isNaN(numeric)) { setCount(target); return; }
    let start = null;
    const step = (ts) => {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * numeric));
      if (progress < 1) raf.current = requestAnimationFrame(step);
      else setCount(numeric);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
}

// ── KPI Card ────────────────────────────────────────────────────────
const KpiCard = ({ title, value, sub, icon, accentColor, delay, loading }) => {
  const animated = useCountUp(loading ? null : value);
  const display  = loading
    ? null
    : (typeof value === 'number' ? animated : value);

  return (
    <div className={`card-hover bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0]
                     flex flex-col gap-4 anim-fade-up anim-fade-up-${delay}`}>
      {loading ? (
        <>
          <div className="skeleton h-3 w-24 rounded" />
          <div className="skeleton h-8 w-16 rounded" />
          <div className="skeleton h-3 w-32 rounded" />
        </>
      ) : (
        <>
          <div className="flex justify-between items-start">
            <span className="text-sm font-medium text-[#64748B]">{title}</span>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: `${accentColor}15` }}>
              <span className="material-symbols-outlined text-base"
                    style={{ color: accentColor, fontVariationSettings: "'FILL' 1" }}>
                {icon}
              </span>
            </div>
          </div>
          <div>
            <span className="text-3xl font-bold text-[#0F172A]">{display}</span>
          </div>
          {sub && <p className="text-xs text-[#64748B] -mt-2">{sub}</p>}
        </>
      )}
    </div>
  );
};

// ── Custom tooltip ───────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0F172A] text-white text-xs px-3 py-2 rounded-lg shadow-lg">
      <p className="font-semibold mb-0.5">{label}</p>
      <p>{payload[0].value} appointments</p>
    </div>
  );
};

const BAR_COLORS = ['#1e88e5','#1976d2','#1565c0','#0d47a1','#1976d2','#1e88e5','#42a5f5'];

export default function AdminDashboard() {
  const [snapshots,    setSnapshots]    = useState({});
  const [loading,      setLoading]      = useState(true);
  const [computing,    setComputing]    = useState(false);
  const [lastComputed, setLastComputed] = useState(null);

  const loadSnapshots = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSnapshot();
      const map = {};
      (res.data || []).forEach(s => {
        try { map[s.metricKey] = JSON.parse(s.metricValue); }
        catch { map[s.metricKey] = s.metricValue; }
      });
      setSnapshots(map);
      if (res.data?.length) setLastComputed(res.data[0].computedAt);
    } catch {}
    setLoading(false);
  };

  const compute = async () => {
    setComputing(true);
    try { await adminAPI.computeAnalytics(); await loadSnapshots(); }
    catch {} finally { setComputing(false); }
  };

  useEffect(() => { loadSnapshots(); }, []);

  // DAILY_SUMMARY has: { totalPatients, appointmentsToday, revenueToday, activeDoctors }
  const dailySummary = snapshots['DAILY_SUMMARY'];
  const byHour       = snapshots['APPOINTMENT_VOLUME_BY_HOUR'] || [];
  const cancelRate   = snapshots['CANCELLATION_RATE'];
  const docPerf      = snapshots['DOCTOR_PERFORMANCE'] || [];

  const heatmapData = byHour.map((h, i) => ({
    hour:  `${String(h.hour ?? h.Hour ?? 0).padStart(2,'0')}:00`,
    count: h.count ?? h.Count ?? 0,
    fill:  BAR_COLORS[i % BAR_COLORS.length],
  }));

  // Revenue: prefer DAILY_SUMMARY.revenueToday; fall back to DAILY_REVENUE.revenue
  const revenueValue = dailySummary?.revenueToday
    ?? snapshots['DAILY_REVENUE']?.revenue;
  const revenueDisplay = revenueValue != null
    ? `₹${Number(revenueValue).toLocaleString('en-IN')}`
    : '-';

  const kpis = [
    {
      title: 'Revenue Today',
      value: revenueDisplay,
      sub:   'Online + cash combined',
      icon:  'payments', accentColor: '#1976d2', delay: 1,
    },
    {
      title: 'Appointments',
      value: cancelRate?.total ?? '-',
      sub:   cancelRate ? `${cancelRate.cancelled} cancelled today` : 'No data yet',
      icon:  'calendar_today', accentColor: '#0891b2', delay: 2,
    },
    {
      title: 'Cancellation Rate',
      value: cancelRate ? `${cancelRate.rate}%` : '-',
      sub:   cancelRate ? `${cancelRate.cancelled} of ${cancelRate.total}` : '',
      icon:  'cancel', accentColor: '#e65100', delay: 3,
    },
    {
      title: 'Active Doctors',
      value: docPerf.length || (loading ? null : 0),
      sub:   'On duty today',
      icon:  'stethoscope', accentColor: '#059669', delay: 4,
    },
  ];

  return (
    <div className="h-full bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center
                         px-8 py-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Dashboard</h2>
          <p className="text-xs text-[#64748B]">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
        </div>
        <button onClick={compute} disabled={computing}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E2E8F0]
                     text-sm font-semibold text-[#0F172A] hover:bg-[#F1F5F9] transition-colors disabled:opacity-50">
          <span className={`material-symbols-outlined text-sm ${computing ? 'animate-spin' : ''}`}>refresh</span>
          {computing ? 'Computing...' : 'Refresh'}
        </button>
      </header>

      <div className="px-8 py-8 space-y-8 max-w-[1400px] mx-auto">
        {/* KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {kpis.map((k, i) => (
            <KpiCard key={i} {...k} loading={loading} />
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Peak hours — 2/3 width */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] anim-fade-up anim-fade-up-5">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">Peak Hours</h3>
                <p className="text-xs text-[#64748B] mt-0.5">Appointment volume by hour today</p>
              </div>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[80,60,95,40,70,85,50].map((h,i) => (
                  <div key={i} className="skeleton rounded" style={{ height: `${h}px` }} />
                ))}
              </div>
            ) : heatmapData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={heatmapData} barCategoryGap="28%">
                  <XAxis dataKey="hour" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(25,118,210,0.06)' }} />
                  <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                    {heatmapData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-56 flex flex-col items-center justify-center text-[#94a3b8] gap-2">
                <span className="material-symbols-outlined text-3xl">bar_chart</span>
                <span className="text-sm">Click Refresh to load data</span>
              </div>
            )}
          </div>

          {/* Doctor performance — 1/3 width */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] anim-fade-up anim-fade-up-6">
            <h3 className="text-base font-bold text-[#0F172A] mb-5">Doctor Performance</h3>
            {loading ? (
              <div className="space-y-5">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="skeleton w-9 h-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="skeleton h-3 rounded w-3/4" />
                      <div className="skeleton h-2 rounded w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : docPerf.length > 0 ? (
              <div className="space-y-5">
                {docPerf.map((d, i) => {
                  // snapshot field is "doctor", not "name"
                  const doctorName = d.doctor ?? d.name ?? 'Unknown';
                  const pct = d.total > 0 ? Math.round((d.completed / d.total) * 100) : 0;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-[#1976d2]">
                          {doctorName.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-semibold text-[#0F172A]">
                            {doctorName.split(' ').slice(1).join(' ') || doctorName}
                          </span>
                          <span className="text-xs font-bold text-[#1976d2]">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-[#F1F5F9] rounded-full overflow-hidden">
                          <div className="h-full bg-[#1976d2] rounded-full transition-all duration-700"
                               style={{ width: `${pct}%` }} />
                        </div>
                        <p className="text-[10px] text-[#94a3b8] mt-1">{d.completed}/{d.total} completed</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-[#94a3b8] gap-2 py-10">
                <span className="material-symbols-outlined text-3xl">stethoscope</span>
                <span className="text-sm text-center">No data — click Refresh</span>
              </div>
            )}
          </div>
        </div>

        {lastComputed && (
          <p className="text-xs text-[#94a3b8] text-right">
            Last computed: {new Date(lastComputed).toLocaleString('en-IN')}
          </p>
        )}
      </div>
    </div>
  );
}

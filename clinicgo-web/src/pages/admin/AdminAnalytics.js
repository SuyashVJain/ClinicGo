import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  LineChart, Line, CartesianGrid, Area, AreaChart,
} from 'recharts';
import { adminAPI } from '../../services/api';

// ── Design tokens ────────────────────────────────────────────────────
const PIE_COLORS  = ['#1976d2', '#ef4444'];
const BAR_COLORS  = ['#1e88e5','#1976d2','#1565c0','#0d47a1','#1976d2','#1e88e5','#42a5f5'];

// ── Custom tooltips ──────────────────────────────────────────────────
const HourTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0F172A] text-white text-xs px-3 py-2 rounded-lg shadow-lg">
      <p className="font-semibold mb-0.5">{label}</p>
      <p>{payload[0].value} appointment{payload[0].value !== 1 ? 's' : ''}</p>
    </div>
  );
};

const DocTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0F172A] text-white text-xs px-3 py-2 rounded-lg shadow-lg space-y-0.5">
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
};

// ── KPI card with colored left border ────────────────────────────────
const StatCard = ({ label, value, sub, borderColor, delay = 1 }) => (
  <div className={`card-hover bg-white rounded-xl shadow-sm border border-[#E2E8F0]
                   overflow-hidden anim-fade-up anim-fade-up-${delay}`}
       style={{ borderLeft: `4px solid ${borderColor}` }}>
    <div className="p-5">
      <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">{label}</p>
      <p className="text-3xl font-bold text-[#0F172A]">{value ?? '-'}</p>
      {sub && <p className="text-xs text-[#94a3b8] mt-1">{sub}</p>}
    </div>
  </div>
);

// ── Empty state ──────────────────────────────────────────────────────
const EmptyChart = ({ icon = 'bar_chart', message = 'Click Recompute to load data' }) => (
  <div className="flex flex-col items-center justify-center h-44 text-[#94a3b8] gap-2">
    <span className="material-symbols-outlined text-3xl">{icon}</span>
    <span className="text-sm">{message}</span>
  </div>
);

export default function AdminAnalytics() {
  const [snapshots, setSnapshots] = useState({});
  const [loading,   setLoading]   = useState(true);
  const [computing, setComputing] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getSnapshot();
      const map = {};
      (res.data || []).forEach(s => {
        try { map[s.metricKey] = JSON.parse(s.metricValue); }
        catch { map[s.metricKey] = s.metricValue; }
      });
      setSnapshots(map);
    } catch {}
    setLoading(false);
  };

  const compute = async () => {
    setComputing(true);
    try { await adminAPI.computeAnalytics(); await load(); }
    catch {} finally { setComputing(false); }
  };

  useEffect(() => { load(); }, []);

  // ── Data extraction ────────────────────────────────────────────────
  const dailySummary = snapshots['DAILY_SUMMARY'];
  const byHour       = snapshots['APPOINTMENT_VOLUME_BY_HOUR'] || [];
  const docPerf      = snapshots['DOCTOR_PERFORMANCE'] || [];
  const cancel       = snapshots['CANCELLATION_RATE'];
  const revTrend     = snapshots['REVENUE_TREND'] || [];

  // Fix: snapshot field is "doctor", not "name"
  const docData = docPerf.map(d => ({
    name:      d.doctor ?? d.name ?? 'Unknown',
    completed: d.completed ?? 0,
    noShow:    d.noShow ?? 0,
    revenue:   d.revenue ?? 0,
  }));

  const hourData = byHour.map((h, i) => ({
    hour:  `${String(h.hour ?? h.Hour ?? 0).padStart(2, '0')}:00`,
    count: h.count ?? h.Count ?? 0,
    fill:  BAR_COLORS[i % BAR_COLORS.length],
  }));

  const pieData = cancel ? [
    { name: 'Completed', value: Math.max(0, (cancel.total ?? 0) - (cancel.cancelled ?? 0)) },
    { name: 'Cancelled', value: cancel.cancelled ?? 0 },
  ].filter(d => d.value > 0) : [];

  const trendData = revTrend.map(r => ({
    date:    r.date ?? r.Date,
    revenue: r.revenue ?? r.Revenue ?? 0,
  }));

  const revenueToday = dailySummary?.revenueToday ?? dailySummary?.revenue ?? '-';

  return (
    <div className="h-full bg-[#F8FAFC]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center
                         px-8 py-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Analytics</h2>
          <p className="text-xs text-[#64748B]">
            Pre-computed · {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
          </p>
        </div>
        <button onClick={compute} disabled={computing}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E2E8F0]
                     text-sm font-semibold text-[#0F172A] hover:bg-[#F1F5F9] transition-colors disabled:opacity-50">
          <span className={`material-symbols-outlined text-sm ${computing ? 'animate-spin' : ''}`}>refresh</span>
          {computing ? 'Computing...' : 'Recompute'}
        </button>
      </header>

      <div className="px-8 py-8 max-w-[1400px] mx-auto space-y-6">

        {/* KPI row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard
            label="Revenue Today"
            value={loading ? '…' : (revenueToday !== '-' ? `₹${Number(revenueToday).toLocaleString('en-IN')}` : '-')}
            sub="All payment methods"
            borderColor="#1976d2"
            delay={1}
          />
          <StatCard
            label="Total Appointments"
            value={loading ? '…' : (cancel?.total ?? '-')}
            sub={cancel ? `${cancel.cancelled} cancelled` : undefined}
            borderColor="#059669"
            delay={2}
          />
          <StatCard
            label="Cancellation Rate"
            value={loading ? '…' : (cancel ? `${cancel.rate}%` : '-')}
            sub={cancel ? `${cancel.cancelled} of ${cancel.total} appointments` : undefined}
            borderColor="#e65100"
            delay={3}
          />
        </div>

        {/* Row 1: Peak hours + Outcomes donut */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Peak hours bar chart */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] anim-fade-up anim-fade-up-4">
            <h3 className="text-base font-bold text-[#0F172A]">Peak Hours</h3>
            <p className="text-xs text-[#64748B] mt-0.5 mb-5">Appointment volume — Hour of Day</p>
            {loading ? (
              <div className="space-y-1.5">
                {[60,90,45,75,50,80,40].map((h,i) => (
                  <div key={i} className="skeleton rounded" style={{ height: `${h}px` }} />
                ))}
              </div>
            ) : hourData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={hourData} barCategoryGap="28%">
                  <XAxis
                    dataKey="hour"
                    label={{ value: 'Hour of Day', position: 'insideBottom', offset: -2, fontSize: 10, fill: '#94a3b8' }}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false} tickLine={false}
                    height={36}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<HourTooltip />} cursor={{ fill: 'rgba(25,118,210,0.06)' }} />
                  <Bar dataKey="count" radius={[5,5,0,0]}>
                    {hourData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart icon="bar_chart" />
            )}
          </div>

          {/* Appointment outcomes donut */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] anim-fade-up anim-fade-up-5">
            <h3 className="text-base font-bold text-[#0F172A]">Appointment Outcomes</h3>
            <p className="text-xs text-[#64748B] mt-0.5 mb-5">Completed vs cancelled today</p>
            {loading ? (
              <div className="flex items-center justify-around mt-4">
                <div className="skeleton w-36 h-36 rounded-full" />
                <div className="space-y-3">
                  {[1,2].map(i => (
                    <div key={i} className="space-y-1">
                      <div className="skeleton h-3 rounded w-24" />
                      <div className="skeleton h-3 rounded w-16" />
                    </div>
                  ))}
                </div>
              </div>
            ) : pieData.length > 0 ? (
              <div className="flex items-center justify-around">
                {/* Donut with total in center */}
                <div className="relative" style={{ width: 180, height: 180 }}>
                  <PieChart width={180} height={180}>
                    <Pie
                      data={pieData}
                      cx={90} cy={90}
                      innerRadius={52} outerRadius={78}
                      dataKey="value"
                      startAngle={90} endAngle={-270}
                    >
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                    </Pie>
                  </PieChart>
                  {/* Center label overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold text-[#0F172A]">{cancel?.total ?? 0}</span>
                    <span className="text-[10px] text-[#94a3b8]">total</span>
                  </div>
                </div>
                <div className="space-y-4">
                  {pieData.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: PIE_COLORS[i] }} />
                      <div>
                        <p className="text-sm font-semibold text-[#0F172A]">{p.name}</p>
                        <p className="text-xs text-[#64748B]">{p.value} appointments</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <EmptyChart icon="pie_chart" />
            )}
          </div>
        </div>

        {/* Row 2: Doctor performance bar chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] anim-fade-up anim-fade-up-6">
          <h3 className="text-base font-bold text-[#0F172A]">Doctor Performance Today</h3>
          <p className="text-xs text-[#64748B] mt-0.5 mb-5">Completed appointments and no-shows per doctor</p>
          {loading ? (
            <div className="skeleton rounded-xl" style={{ height: 200 }} />
          ) : docData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={docData} barCategoryGap="32%" barGap={4}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false} tickLine={false}
                  interval={0}
                  angle={docData.length > 3 ? -20 : 0}
                  textAnchor={docData.length > 3 ? 'end' : 'middle'}
                  height={docData.length > 3 ? 48 : 30}
                />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<DocTooltip />} cursor={{ fill: 'rgba(25,118,210,0.06)' }} />
                <Legend
                  wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                  formatter={(value) => <span style={{ color: '#64748b' }}>{value}</span>}
                />
                <Bar dataKey="completed" name="Completed" fill="#1976d2" radius={[4,4,0,0]} />
                <Bar dataKey="noShow"    name="No Show"   fill="#fed7aa" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart icon="stethoscope" message="No doctor performance data — click Recompute" />
          )}
        </div>

        {/* Row 3: Revenue trend (if available) */}
        {(trendData.length > 0 || !loading) && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#E2E8F0] anim-fade-up anim-fade-up-6">
            <h3 className="text-base font-bold text-[#0F172A]">Revenue Trend</h3>
            <p className="text-xs text-[#64748B] mt-0.5 mb-5">Daily revenue over time</p>
            {loading ? (
              <div className="skeleton rounded-xl" style={{ height: 200 }} />
            ) : trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#1976d2" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#1976d2" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false} tickLine={false}
                    tickFormatter={v => `₹${(v/1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(v) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Revenue']}
                    contentStyle={{ background: '#0F172A', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }}
                    labelStyle={{ color: '#94a3b8', marginBottom: 4 }}
                    cursor={{ stroke: '#1976d2', strokeWidth: 1 }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#1976d2"
                    strokeWidth={2}
                    fill="url(#revenueGrad)"
                    dot={{ r: 3, fill: '#1976d2', strokeWidth: 0 }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart icon="trending_up" message="No revenue trend data available" />
            )}
          </div>
        )}

      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { adminAPI } from '../../services/api';

const KpiCard = ({ title, value, sub, badge, live }) => (
  <div className="bg-surface-container-lowest p-6 rounded-[14px] shadow-sm border border-outline-variant/10 flex flex-col justify-between">
    <div className="flex justify-between items-start mb-4">
      <span className="text-sm font-medium text-on-surface-variant">{title}</span>
      {live && (
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          <span className="text-[10px] font-semibold text-primary">Live</span>
        </div>
      )}
      {badge && <span className="text-primary-container bg-secondary-container/30 px-2 py-0.5 rounded text-[10px] font-bold">{badge}</span>}
    </div>
    <div>
      <span className="text-3xl font-bold text-on-background">{value}</span>
      {sub && <p className="text-xs text-outline mt-1">{sub}</p>}
    </div>
  </div>
);

const COLORS = ['#005dac', '#1976d2', '#a5c8ff', '#bee1fe'];

export default function AdminDashboard() {
  const [snapshots, setSnapshots] = useState({});
  const [computing, setComputing] = useState(false);
  const [lastComputed, setLastComputed] = useState(null);

  const loadSnapshots = async () => {
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
  };

  const compute = async () => {
    setComputing(true);
    try {
      await adminAPI.computeAnalytics();
      await loadSnapshots();
    } catch {}
    setComputing(false);
  };

  useEffect(() => { loadSnapshots(); }, []);

  const revenue   = snapshots['DAILY_REVENUE'];
  const byHour    = snapshots['APPOINTMENT_VOLUME_BY_HOUR'] || [];
  const cancelRate = snapshots['CANCELLATION_RATE'];
  const docPerf   = snapshots['DOCTOR_PERFORMANCE'] || [];

  const heatmapData = byHour.map(h => ({
    hour: `${h.hour}:00`,
    count: h.count
  }));

  return (
    <div className="h-full bg-surface-container-low">
      {/* TopBar */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center px-8 py-4 border-b border-outline-variant/10">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Dashboard</h2>
          <p className="text-xs text-outline">{new Date().toDateString()}</p>
        </div>
        <button onClick={compute} disabled={computing}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-sm font-semibold text-on-surface hover:bg-surface-container transition-colors disabled:opacity-60">
          <span className="material-symbols-outlined text-sm">refresh</span>
          {computing ? 'Computing...' : 'Refresh Analytics'}
        </button>
      </header>

      <div className="px-8 py-8 space-y-8 max-w-[1400px] mx-auto">
        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard
            title="Revenue Today"
            value={revenue ? `₹${revenue.revenue?.toLocaleString('en-IN') || 0}` : '-'}
            sub="Online + cash payments"
            badge="Today"
          />
          <KpiCard
            title="Appointments Today"
            value={cancelRate?.total ?? '-'}
            sub={cancelRate ? `${cancelRate.cancelled} cancelled` : ''}
            badge={cancelRate ? `${cancelRate.rate}% cancel rate` : ''}
          />
          <KpiCard
            title="Cancellation Rate"
            value={cancelRate ? `${cancelRate.rate}%` : '-'}
            sub={cancelRate ? `${cancelRate.cancelled} of ${cancelRate.total}` : ''}
          />
          <KpiCard
            title="Active Doctors"
            value={docPerf.length || '-'}
            sub="On duty today"
            live
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Peak Hours */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
            <h3 className="text-lg font-bold text-on-surface mb-1">Peak Hours</h3>
            <p className="text-sm text-outline mb-6">Appointment volume by hour today</p>
            {heatmapData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={heatmapData}>
                  <XAxis dataKey="hour" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#005dac" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-52 flex items-center justify-center text-outline text-sm">
                Click "Refresh Analytics" to load data
              </div>
            )}
          </div>

          {/* Doctor Performance */}
          <div className="bg-surface-container-lowest p-8 rounded-xl shadow-sm border border-outline-variant/10">
            <h3 className="text-lg font-bold text-on-surface mb-6">Doctor Performance</h3>
            {docPerf.length > 0 ? (
              <div className="space-y-4">
                {docPerf.map((d, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-on-secondary-container">
                        {d.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-semibold text-on-background">{d.name}</span>
                        <span className="text-xs text-outline">{d.completed}/{d.total} done</span>
                      </div>
                      <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full"
                             style={{ width: d.total > 0 ? `${(d.completed / d.total) * 100}%` : '0%' }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-52 flex items-center justify-center text-outline text-sm">
                No data yet - click Refresh Analytics
              </div>
            )}
          </div>
        </div>

        {lastComputed && (
          <p className="text-xs text-outline text-right">
            Last computed: {new Date(lastComputed).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}

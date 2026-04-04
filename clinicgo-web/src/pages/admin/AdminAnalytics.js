import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { adminAPI } from '../../services/api';

const COLORS = ['#005dac', '#1976d2', '#a5c8ff', '#bee1fe', '#40627b'];

export default function AdminAnalytics() {
  const [snapshots, setSnapshots] = useState({});
  const [computing, setComputing] = useState(false);

  const load = async () => {
    try {
      const res = await adminAPI.getSnapshot();
      const map = {};
      (res.data || []).forEach(s => {
        try { map[s.metricKey] = JSON.parse(s.metricValue); }
        catch { map[s.metricKey] = s.metricValue; }
      });
      setSnapshots(map);
    } catch {}
  };

  const compute = async () => {
    setComputing(true);
    try { await adminAPI.computeAnalytics(); await load(); }
    catch {} finally { setComputing(false); }
  };

  useEffect(() => { load(); }, []);

  const byHour   = snapshots['APPOINTMENT_VOLUME_BY_HOUR'] || [];
  const docPerf  = snapshots['DOCTOR_PERFORMANCE'] || [];
  const cancel   = snapshots['CANCELLATION_RATE'];
  const revenue  = snapshots['DAILY_REVENUE'];

  const hourData = byHour.map(h => ({ hour: `${h.hour}:00`, appointments: h.count }));
  const docData  = docPerf.map(d => ({ name: d.name?.split(' ')[0], completed: d.completed, noShow: d.noShow }));

  const pieData = cancel ? [
    { name: 'Completed', value: (cancel.total - cancel.cancelled) },
    { name: 'Cancelled', value: cancel.cancelled },
  ] : [];

  return (
    <div className="h-full bg-surface-container-low">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center px-8 py-4 border-b border-outline-variant/10">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Analytics</h2>
          <p className="text-xs text-outline">Pre-computed metrics · {new Date().toDateString()}</p>
        </div>
        <button onClick={compute} disabled={computing}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-sm font-semibold hover:bg-surface-container transition-colors disabled:opacity-60">
          <span className="material-symbols-outlined text-sm">refresh</span>
          {computing ? 'Computing...' : 'Recompute'}
        </button>
      </header>

      <div className="px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        {/* Summary row */}
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
            <p className="text-sm text-outline mb-2">Revenue Today</p>
            <p className="text-3xl font-bold text-on-background">
              {revenue ? `₹${revenue.revenue?.toLocaleString('en-IN')}` : '—'}
            </p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
            <p className="text-sm text-outline mb-2">Total Appointments</p>
            <p className="text-3xl font-bold text-on-background">{cancel?.total ?? '—'}</p>
          </div>
          <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
            <p className="text-sm text-outline mb-2">Cancellation Rate</p>
            <p className="text-3xl font-bold text-on-background">{cancel ? `${cancel.rate}%` : '—'}</p>
          </div>
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Peak hours */}
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10">
            <h3 className="text-lg font-bold text-on-surface mb-1">Peak Hours Heatmap</h3>
            <p className="text-sm text-outline mb-6">Appointments by hour of day</p>
            {hourData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={hourData}>
                  <XAxis dataKey="hour" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="appointments" fill="#005dac" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-56 flex items-center justify-center text-outline text-sm">No data — click Recompute</div>
            )}
          </div>

          {/* Cancellation pie */}
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10">
            <h3 className="text-lg font-bold text-on-surface mb-6">Appointment Outcomes</h3>
            {pieData.length > 0 ? (
              <div className="flex items-center justify-around">
                <PieChart width={180} height={180}>
                  <Pie data={pieData} cx={90} cy={90} innerRadius={55} outerRadius={80} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                </PieChart>
                <div className="space-y-3">
                  {pieData.map((p, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i] }}></div>
                      <div>
                        <p className="text-sm font-semibold text-on-background">{p.name}</p>
                        <p className="text-xs text-outline">{p.value} appointments</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-44 flex items-center justify-center text-outline text-sm">No data — click Recompute</div>
            )}
          </div>
        </div>

        {/* Doctor performance */}
        {docData.length > 0 && (
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10">
            <h3 className="text-lg font-bold text-on-surface mb-6">Doctor Performance Today</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={docData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="completed" name="Completed" fill="#005dac" radius={[4,4,0,0]} />
                <Bar dataKey="noShow"    name="No Show"   fill="#bee1fe" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

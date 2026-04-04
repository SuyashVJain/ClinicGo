import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { appointmentAPI } from '../../services/api';

export default function DoctorStats() {
  const [appointments, setAppts] = useState([]);
  const [loading, setLoading]    = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        // Load today's appointments for stats
        const res = await appointmentAPI.getTodayByDoctor(1);
        setAppts(res.data || []);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, []);

  const total     = appointments.length;
  const completed = appointments.filter(a => a.status === 'COMPLETED').length;
  const noShow    = appointments.filter(a => a.status === 'NO_SHOW').length;
  const pending   = appointments.filter(a => a.status === 'CONFIRMED').length;
  const rate      = total > 0 ? Math.round((completed / total) * 100) : 0;

  const pieData = [
    { name: 'Completed', value: completed },
    { name: 'Pending',   value: pending   },
    { name: 'No Show',   value: noShow    },
  ].filter(d => d.value > 0);

  const COLORS = ['#005dac', '#bee1fe', '#e2e2e2'];

  return (
    <div className="h-full bg-surface-container-low">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md px-8 py-4 border-b border-outline-variant/10">
        <h2 className="text-xl font-bold text-on-surface">My Performance</h2>
        <p className="text-xs text-outline">Today's statistics · {new Date().toDateString()}</p>
      </header>

      <div className="px-8 py-8 max-w-4xl mx-auto space-y-6">
        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Today', value: total,     color: 'text-primary' },
            { label: 'Completed',   value: completed, color: 'text-[#2E7D32]' },
            { label: 'No Shows',    value: noShow,    color: 'text-error' },
            { label: 'Completion',  value: `${rate}%`, color: 'text-primary' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
              <p className="text-sm text-outline mb-2">{label}</p>
              <p className={`text-3xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Completion rate bar */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant/10">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-on-background">Completion Rate</span>
            <span className="text-sm font-bold text-primary">{rate}%</span>
          </div>
          <div className="h-3 bg-surface-container rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500"
                 style={{ width: `${rate}%` }} />
          </div>
          <p className="text-xs text-outline mt-2">{completed} completed of {total} total appointments</p>
        </div>

        {/* Pie chart */}
        {pieData.length > 0 && (
          <div className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/10">
            <h3 className="text-base font-bold text-on-surface mb-6">Today's Breakdown</h3>
            <div className="flex items-center justify-around">
              <PieChart width={180} height={180}>
                <Pie data={pieData} cx={90} cy={90} innerRadius={55} outerRadius={80} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
              </PieChart>
              <div className="space-y-4">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm" style={{ background: COLORS[i] }}></div>
                    <div>
                      <p className="text-sm font-semibold text-on-background">{d.name}</p>
                      <p className="text-xs text-outline">{d.value} patients</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center text-outline text-sm py-12">Loading stats...</div>
        )}
      </div>
    </div>
  );
}

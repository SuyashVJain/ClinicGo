import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { appointmentAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function DoctorStats() {
  const { user }                 = useAuth();
  const [appointments, setAppts] = useState([]);
  const [loading, setLoading]    = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user?.doctorId) return;
      try {
        const res = await appointmentAPI.getTodayByDoctor(user.doctorId);
        setAppts(res.data || []);
      } catch {} finally { setLoading(false); }
    };
    load();
  }, [user]);

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

  const kpis = [
    { label: 'Total Today',    value: loading ? '…' : total,       color: 'text-[#1976d2]', border: '#1976d2' },
    { label: 'Completed',      value: loading ? '…' : completed,   color: 'text-[#166534]', border: '#059669' },
    { label: 'No Shows',       value: loading ? '…' : noShow,      color: 'text-[#dc2626]', border: '#dc2626' },
    { label: 'Completion Rate',value: loading ? '…' : `${rate}%`,  color: 'text-[#1976d2]', border: '#f97316' },
  ];

  return (
    <div className="h-full bg-[#F8FAFC]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-8 py-4 border-b border-[#E2E8F0]">
        <h2 className="text-xl font-bold text-[#0F172A]">My Performance</h2>
        <p className="text-xs text-[#64748B]">
          Today's statistics · {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}
        </p>
      </header>

      <div className="px-8 py-8 max-w-4xl mx-auto space-y-6 page-enter">
        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map(({ label, value, color, border }, i) => (
            <div key={label}
                 className={`card-hover bg-white rounded-xl border border-[#E2E8F0] shadow-sm overflow-hidden
                             anim-fade-up anim-fade-up-${i + 1}`}
                 style={{ borderLeft: `4px solid ${border}` }}>
              <div className="p-5">
                <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-2">{label}</p>
                <p className={`text-3xl font-bold ${color}`}>{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Completion rate bar */}
        <div className="bg-white p-6 rounded-2xl border border-[#E2E8F0] shadow-sm anim-fade-up anim-fade-up-5">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-[#0F172A]">Completion Rate</span>
            <span className="text-sm font-bold text-[#1976d2]">{rate}%</span>
          </div>
          <div className="h-3 bg-[#F1F5F9] rounded-full overflow-hidden">
            <div className="h-full bg-[#1976d2] rounded-full transition-all duration-700"
                 style={{ width: `${rate}%` }} />
          </div>
          <p className="text-xs text-[#64748B] mt-2">{completed} completed of {total} appointments today</p>
        </div>

        {/* Pie chart */}
        {!loading && pieData.length > 0 && (
          <div className="bg-white p-8 rounded-2xl border border-[#E2E8F0] shadow-sm anim-fade-up anim-fade-up-6">
            <h3 className="text-base font-bold text-[#0F172A] mb-6">Today's Breakdown</h3>
            <div className="flex items-center justify-around">
              <div className="relative" style={{ width: 180, height: 180 }}>
                <PieChart width={180} height={180}>
                  <Pie data={pieData} cx={90} cy={90} innerRadius={52} outerRadius={78} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                </PieChart>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-[#0F172A]">{total}</span>
                  <span className="text-[10px] text-[#94a3b8]">total</span>
                </div>
              </div>
              <div className="space-y-4">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: COLORS[i] }} />
                    <div>
                      <p className="text-sm font-semibold text-[#0F172A]">{d.name}</p>
                      <p className="text-xs text-[#64748B]">{d.value} patients</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="space-y-4">
            {[1,2].map(i => (
              <div key={i} className="skeleton rounded-2xl" style={{ height: 100 }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

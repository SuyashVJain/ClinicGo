import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, prescriptionAPI, patientAPI } from '../../services/api';

const STATUS_META = {
  CONFIRMED:            { cls: 'bg-[#EFF6FF] text-[#1d4ed8]', bar: '#1976d2', label: 'Confirmed' },
  COMPLETED:            { cls: 'bg-[#F0FDF4] text-[#166534]', bar: '#059669', label: 'Completed' },
  NO_SHOW:              { cls: 'bg-[#F8FAFC] text-[#64748b]', bar: '#94a3b8', label: 'No Show'   },
  CANCELLED:            { cls: 'bg-[#FEF2F2] text-[#dc2626]', bar: '#dc2626', label: 'Cancelled' },
  PENDING_CONFIRMATION: { cls: 'bg-[#FFF7ED] text-[#c2410c]', bar: '#f97316', label: 'Pending'   },
};

export default function DoctorSchedule() {
  const { user }                    = useAuth();
  const [appointments, setAppts]    = useState([]);
  const [selected, setSelected]     = useState(null);
  const [history, setHistory]       = useState(null);
  const [loading, setLoading]       = useState(true);

  useEffect(() => { load(); }, [user]);

  const load = async () => {
    if (!user?.doctorId) return;
    setLoading(true);
    try {
      const res = await appointmentAPI.getTodayByDoctor(user.doctorId);
      setAppts(res.data || []);
    } catch {} finally { setLoading(false); }
  };

  const selectPatient = async (appt) => {
    setSelected(appt);
    try {
      const res = await patientAPI.getHistory(appt.patientId);
      setHistory(res.data);
    } catch { setHistory(null); }
  };

  const markComplete = async (id) => {
    try { await appointmentAPI.complete(id); load(); } catch {}
  };

  const today = new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' });

  return (
    <div className="h-full bg-[#F8FAFC] flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center
                         px-8 py-4 border-b border-[#E2E8F0]">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-[#0F172A]">Today's Schedule</h2>
          <span className="text-sm text-[#64748B]">{today}</span>
          <span className="bg-[#EFF6FF] text-[#1d4ed8] text-xs font-bold px-3 py-1 rounded-full">
            {appointments.length} Appointments
          </span>
        </div>
        <button onClick={load}
          className="p-2 rounded-full hover:bg-[#F1F5F9] transition-colors">
          <span className="material-symbols-outlined text-[#64748B]">refresh</span>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left - appointment list */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          {loading ? (
            <div className="space-y-3">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="bg-white rounded-xl p-4 border border-[#E2E8F0] flex items-center gap-4">
                  <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 rounded w-1/3" />
                    <div className="skeleton h-3 rounded w-1/4" />
                  </div>
                  <div className="skeleton h-5 rounded-full w-20" />
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-[#94a3b8] gap-3">
              <span className="material-symbols-outlined text-4xl">calendar_today</span>
              <p className="text-sm font-medium">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-2 page-enter">
              {appointments.map((a, i) => {
                const meta = STATUS_META[a.status] || { cls: 'bg-[#F1F5F9] text-[#64748B]', bar: '#94a3b8', label: a.status };
                const isSelected = selected?.appointmentId === a.appointmentId;
                return (
                  <div key={a.appointmentId}
                    onClick={() => selectPatient(a)}
                    className={`flex items-center gap-4 px-4 py-4 rounded-xl cursor-pointer
                                transition-all duration-150 border anim-fade-up anim-fade-up-${Math.min(i+1,6)}
                                ${isSelected
                                  ? 'bg-[#EFF6FF] border-[#1976d2]/30 shadow-sm'
                                  : 'bg-white border-[#E2E8F0] hover:border-[#1976d2]/20 hover:bg-[#F8FAFC]'}`}>
                    {/* Status left bar */}
                    <div className="w-1 self-stretch rounded-full shrink-0"
                         style={{ background: meta.bar }} />
                    {/* Token */}
                    <span className="text-xs font-bold text-[#94a3b8] w-7 shrink-0">#{a.tokenNumber}</span>
                    {/* Patient */}
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold text-white"
                           style={{ background: 'linear-gradient(135deg, #1565c0, #1e88e5)' }}>
                        {a.patientName?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                      </div>
                      <span className="text-sm font-semibold text-[#0F172A] truncate">{a.patientName}</span>
                    </div>
                    <span className="text-sm text-[#64748B] w-14 shrink-0">{a.slotTime?.slice(0,5)}</span>
                    <span className="text-xs text-[#94a3b8] w-20 shrink-0">{a.type}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${meta.cls}`}>
                      {meta.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right - patient detail panel */}
        {selected && (
          <div className="w-72 bg-white border-l border-[#E2E8F0] overflow-y-auto no-scrollbar p-5 space-y-5 anim-fade-in">
            {/* Patient header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
                   style={{ background: 'linear-gradient(135deg, #1565c0, #1e88e5)' }}>
                {selected.patientName?.split(' ').map(w=>w[0]).join('').slice(0,2)}
              </div>
              <div>
                <p className="font-bold text-[#0F172A] text-sm">{selected.patientName}</p>
                <p className="text-xs text-[#64748B]">Token #{selected.tokenNumber} · {selected.type}</p>
              </div>
            </div>

            {/* Action */}
            {selected.status === 'CONFIRMED' && (
              <button onClick={() => markComplete(selected.appointmentId)}
                className="w-full text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
                style={{ background: 'linear-gradient(135deg, #1565c0, #1976d2)', boxShadow: '0 3px 10px rgba(25,118,210,0.3)' }}>
                ✓ Mark Complete
              </button>
            )}

            {/* Visit history */}
            {history && (
              <div>
                <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider mb-3">
                  {history.totalVisits} previous visits
                </p>
                <div className="space-y-2">
                  {history.history?.slice(0, 5).map(h => (
                    <div key={h.appointmentId}
                         className="bg-[#F8FAFC] p-3 rounded-xl border border-[#E2E8F0]">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-[#0F172A]">
                          {typeof h.appointmentDate === 'string'
                            ? h.appointmentDate.slice(0, 10)
                            : h.appointmentDate}
                        </span>
                        <span className="text-[10px] text-[#94a3b8]">{h.type}</span>
                      </div>
                      {h.prescription && (
                        <p className="text-xs text-[#64748B] mt-1 line-clamp-2">
                          {h.prescription.diagnosis}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

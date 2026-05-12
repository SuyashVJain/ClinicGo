import React, { useState, useEffect } from 'react';
import { adminAPI, appointmentAPI } from '../../services/api';

const STATUS_META = {
  CONFIRMED:            { cls: 'bg-[#EFF6FF] text-[#1d4ed8]',  pulse: false, label: 'Confirmed' },
  PENDING_CONFIRMATION: { cls: 'bg-[#FFF7ED] text-[#c2410c]',  pulse: true,  label: 'Pending'   },
  COMPLETED:            { cls: 'bg-[#F0FDF4] text-[#166534]',  pulse: false, label: 'Completed' },
  CANCELLED:            { cls: 'bg-[#FEF2F2] text-[#dc2626]',  pulse: false, label: 'Cancelled' },
  NO_SHOW:              { cls: 'bg-[#F8FAFC] text-[#64748b]',  pulse: false, label: 'No Show'   },
};

export default function AdminOperations() {
  const [doctors, setDoctors]   = useState([]);
  const [queues, setQueues]     = useState({});
  const [loading, setLoading]   = useState(true);

  const load = async () => {
    try {
      const docRes = await adminAPI.getDoctors();
      setDoctors(docRes.data);
      const queueMap = {};
      await Promise.all(docRes.data.map(async (d) => {
        try {
          const q = await appointmentAPI.getTodayByDoctor(d.doctorId);
          queueMap[d.doctorId] = q.data;
        } catch { queueMap[d.doctorId] = []; }
      }));
      setQueues(queueMap);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); const t = setInterval(load, 30000); return () => clearInterval(t); }, []);

  return (
    <div className="h-full bg-[#F8FAFC]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center
                         px-8 py-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Live Operations</h2>
          <p className="text-xs text-[#64748B]">Auto-refreshes every 30s</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#E2E8F0]
                     text-sm font-semibold text-[#0F172A] hover:bg-[#F1F5F9] transition-colors">
          <span className="material-symbols-outlined text-sm">refresh</span>
          Refresh
        </button>
      </header>

      <div className="px-8 py-8 max-w-[1400px] mx-auto">
        {loading ? (
          <div className="space-y-6">
            {[1,2].map(i => (
              <div key={i} className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
                <div className="flex items-center gap-4 px-6 py-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  <div className="skeleton w-10 h-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <div className="skeleton h-4 rounded w-1/4" />
                    <div className="skeleton h-3 rounded w-1/6" />
                  </div>
                </div>
                {[1,2,3].map(j => (
                  <div key={j} className="flex items-center gap-4 px-6 py-3 border-b border-[#F8FAFC]">
                    <div className="skeleton h-3 rounded w-8" />
                    <div className="skeleton h-3 rounded flex-1" />
                    <div className="skeleton h-5 rounded-full w-20" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6 page-enter">
            {doctors.map((doc, di) => {
              const appts = queues[doc.doctorId] || [];
              const done  = appts.filter(a => a.status === 'COMPLETED').length;
              const total = appts.length;
              const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
              return (
                <div key={doc.doctorId}
                     className={`bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden
                                 anim-fade-up anim-fade-up-${Math.min(di + 1, 6)}`}>
                  {/* Doctor header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[#F1F5F9]
                                  bg-[#F8FAFC]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0
                                      text-sm font-bold text-white"
                           style={{ background: 'linear-gradient(135deg, #1565c0, #1e88e5)' }}>
                        {doc.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-[#0F172A]">{doc.name}</p>
                        <p className="text-xs text-[#64748B]">{doc.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#0F172A]">{done}/{total}</span>
                        <span className="text-xs text-[#64748B] ml-1">done</span>
                      </div>
                      <div className="w-28 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div className="h-full bg-[#1976d2] rounded-full transition-all duration-700"
                             style={{ width: `${pct}%` }} />
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        doc.isAvailable
                          ? 'bg-[#DCFCE7] text-[#166534]'
                          : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                        {doc.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  {/* Appointment rows */}
                  {appts.length === 0 ? (
                    <div className="px-6 py-8 text-center text-[#94a3b8] text-sm">
                      No appointments today
                    </div>
                  ) : (
                    <div className="divide-y divide-[#F8FAFC]">
                      {appts.map(a => {
                        const meta = STATUS_META[a.status] || { cls: 'bg-[#F1F5F9] text-[#64748B]', pulse: false, label: a.status };
                        return (
                          <div key={a.appointmentId} className="flex items-center gap-4 px-6 py-3
                                                                  hover:bg-[#F8FAFC] transition-colors">
                            <span className="text-xs font-bold text-[#94a3b8] w-8">#{a.tokenNumber}</span>
                            <span className="text-sm font-semibold text-[#0F172A] flex-1">{a.patientName}</span>
                            <span className="text-xs text-[#64748B] w-12">{a.slotTime?.slice(0,5)}</span>
                            <span className="text-xs text-[#94a3b8] w-20">{a.type}</span>
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold
                                             px-2.5 py-1 rounded-full ${meta.cls}`}>
                              {meta.pulse && (
                                <span className="w-1.5 h-1.5 rounded-full bg-[#c2410c] pulse-dot shrink-0" />
                              )}
                              {meta.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

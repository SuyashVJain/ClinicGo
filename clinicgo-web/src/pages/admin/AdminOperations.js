import React, { useState, useEffect } from 'react';
import { adminAPI, appointmentAPI } from '../../services/api';

const STATUS_COLORS = {
  CONFIRMED:            'bg-blue-100 text-blue-700',
  PENDING_CONFIRMATION: 'bg-amber-100 text-amber-700',
  COMPLETED:            'bg-green-100 text-green-700',
  CANCELLED:            'bg-red-100 text-red-700',
  NO_SHOW:              'bg-gray-100 text-gray-500',
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
    <div className="h-full bg-surface-container-low">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center px-8 py-4 border-b border-outline-variant/10">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Live Operations</h2>
          <p className="text-xs text-outline">Read-only · Auto-refreshes every 30s</p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-outline-variant text-sm font-semibold hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-sm">refresh</span>
          Refresh
        </button>
      </header>

      <div className="px-8 py-8 max-w-[1400px] mx-auto">
        {loading ? (
          <div className="text-center text-outline text-sm py-20">Loading operations data...</div>
        ) : (
          <div className="space-y-6">
            {doctors.map(doc => {
              const appts = queues[doc.doctorId] || [];
              const done  = appts.filter(a => a.status === 'COMPLETED').length;
              const total = appts.length;
              return (
                <div key={doc.doctorId} className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
                  {/* Doctor header */}
                  <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10 bg-surface-container-low">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-on-secondary-container">
                          {doc.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-on-background">{doc.name}</p>
                        <p className="text-xs text-outline">{doc.specialization}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-outline">{done}/{total} completed</span>
                      <div className="w-24 h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full"
                             style={{ width: total > 0 ? `${(done/total)*100}%` : '0%' }} />
                      </div>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${doc.isAvailable ? 'bg-[#E8F5E9] text-[#2E7D32]' : 'bg-surface-container text-outline'}`}>
                        {doc.isAvailable ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  {/* Appointment list */}
                  {appts.length === 0 ? (
                    <div className="px-6 py-8 text-center text-outline text-sm">No appointments today</div>
                  ) : (
                    <div className="divide-y divide-outline-variant/10">
                      {appts.map(a => (
                        <div key={a.appointmentId} className="flex items-center gap-4 px-6 py-3">
                          <span className="text-xs font-bold text-outline w-8">#{a.tokenNumber}</span>
                          <span className="text-sm font-semibold text-on-background flex-1">{a.patientName}</span>
                          <span className="text-xs text-outline">{a.slotTime?.slice(0,5)}</span>
                          <span className="text-xs text-outline">{a.type}</span>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${STATUS_COLORS[a.status] || 'bg-surface-container text-outline'}`}>
                            {a.status?.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
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

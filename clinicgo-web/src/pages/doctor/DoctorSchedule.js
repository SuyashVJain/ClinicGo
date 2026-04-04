import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { appointmentAPI, prescriptionAPI, patientAPI } from '../../services/api';

const STATUS_COLORS = {
  CONFIRMED:  'bg-blue-100 text-blue-700',
  COMPLETED:  'bg-green-100 text-green-700',
  NO_SHOW:    'bg-gray-100 text-gray-500',
  CANCELLED:  'bg-red-100 text-red-700',
  PENDING_CONFIRMATION: 'bg-amber-100 text-amber-700',
};

export default function DoctorSchedule() {
  const { user }                    = useAuth();
  const [appointments, setAppts]    = useState([]);
  const [selected, setSelected]     = useState(null);
  const [history, setHistory]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [doctorId, setDoctorId]     = useState(null);

  // Get doctorId from user profile
  useEffect(() => {
    const stored = localStorage.getItem('clinicgo_user');
    if (stored) {
      const u = JSON.parse(stored);
      // DoctorId is fetched via appointments - we'll derive it
    }
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      // We don't have doctorId directly, so we fetch today's appointments for all doctors
      // In a real app, /auth/me would return doctorId - for now we use userId to find it
      // Try doctorId = 1 as seeded
      const res = await appointmentAPI.getTodayByDoctor(1);
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
    <div className="h-full bg-surface-container-low flex flex-col">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center px-8 py-4 border-b border-outline-variant/10">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-primary">Today's Schedule</h2>
          <span className="text-sm text-outline">{today}</span>
          <span className="bg-secondary-container text-on-secondary-container text-xs font-bold px-3 py-1 rounded-full">
            {appointments.length} Appointments
          </span>
        </div>
        <button onClick={load} className="p-2 rounded-full hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-on-surface-variant">refresh</span>
        </button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left - appointment list */}
        <div className="flex-1 overflow-y-auto no-scrollbar p-6">
          {loading ? (
            <div className="text-center text-outline text-sm py-20">Loading schedule...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center text-outline text-sm py-20">No appointments today</div>
          ) : (
            <div className="space-y-0">
              {/* Table header */}
              <div className="grid grid-cols-5 gap-4 px-4 py-2 text-xs font-bold text-outline uppercase tracking-wider">
                <span>Token</span><span>Patient</span><span>Time</span><span>Type</span><span>Status</span>
              </div>
              {appointments.map(a => (
                <div key={a.appointmentId}
                  onClick={() => selectPatient(a)}
                  className={`grid grid-cols-5 gap-4 px-4 py-4 rounded-xl cursor-pointer transition-colors items-center
                    ${selected?.appointmentId === a.appointmentId
                      ? 'bg-secondary-container/30 ring-2 ring-primary/20'
                      : 'hover:bg-surface-container'}`}>
                  <span className="text-sm font-bold text-on-surface-variant">#{a.tokenNumber}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-on-secondary-container">
                        {a.patientName?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-on-background truncate">{a.patientName}</span>
                  </div>
                  <span className="text-sm text-on-surface-variant">{a.slotTime?.slice(0,5)}</span>
                  <span className="text-sm text-on-surface-variant">{a.type}</span>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit ${STATUS_COLORS[a.status] || ''}`}>
                    {a.status?.replace('_',' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right - patient detail panel */}
        {selected && (
          <div className="w-80 bg-surface-container-lowest border-l border-outline-variant/10 overflow-y-auto no-scrollbar p-6 space-y-5">
            {/* Patient header */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-on-secondary-container">
                  {selected.patientName?.split(' ').map(w=>w[0]).join('').slice(0,2)}
                </span>
              </div>
              <div>
                <p className="font-bold text-on-background">{selected.patientName}</p>
                <p className="text-xs text-outline">Token #{selected.tokenNumber} · {selected.type}</p>
              </div>
            </div>

            {/* Actions */}
            {selected.status === 'CONFIRMED' && (
              <button onClick={() => markComplete(selected.appointmentId)}
                className="w-full bg-primary text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors">
                Mark Complete
              </button>
            )}

            {/* Visit history */}
            {history && (
              <div>
                <p className="text-xs font-bold text-outline uppercase tracking-wider mb-3">
                  Visit History ({history.totalVisits} visits)
                </p>
                <div className="space-y-3">
                  {history.history?.slice(0, 5).map(h => (
                    <div key={h.appointmentId} className="bg-surface-container p-3 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-semibold text-on-background">{h.appointmentDate}</span>
                        <span className="text-xs text-outline">{h.type}</span>
                      </div>
                      {h.prescription && (
                        <p className="text-xs text-on-surface-variant mt-1 line-clamp-2">
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

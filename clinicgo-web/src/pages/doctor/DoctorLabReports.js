import React, { useState } from 'react';
import { labAPI, patientAPI } from '../../services/api';

export default function DoctorLabReports() {
  const [patientId, setPatientId]   = useState('');
  const [reports, setReports]       = useState([]);
  const [patient, setPatient]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  const search = async (e) => {
    e.preventDefault();
    if (!patientId) return;
    setLoading(true); setError('');
    try {
      const [rRes, pRes] = await Promise.all([
        labAPI.getByPatient(patientId),
        patientAPI.getHistory(patientId),
      ]);
      setReports(rRes.data || []);
      setPatient(pRes.data);
    } catch {
      setError('Patient not found or no reports available.');
      setReports([]); setPatient(null);
    } finally { setLoading(false); }
  };

  const download = async (reportId, fileName) => {
    try {
      const res = await labAPI.download(reportId);
      const url = URL.createObjectURL(new Blob([res.data]));
      const a   = document.createElement('a');
      a.href = url; a.download = fileName; a.click();
      URL.revokeObjectURL(url);
    } catch {}
  };

  const fileIcon = (type) => {
    if (type === 'PDF') return 'picture_as_pdf';
    if (type === 'JPG' || type === 'PNG') return 'image';
    return 'attach_file';
  };

  return (
    <div className="h-full bg-[#F8FAFC]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md px-8 py-4 border-b border-[#E2E8F0]">
        <h2 className="text-xl font-bold text-[#0F172A]">Lab Reports</h2>
        <p className="text-xs text-[#64748B]">View patient-uploaded lab documents</p>
      </header>

      <div className="px-8 py-8 max-w-3xl mx-auto space-y-6 page-enter">
        {/* Search */}
        <form onSubmit={search} className="flex gap-3">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-lg">
              person_search
            </span>
            <input
              className="soft-input pl-10"
              type="number"
              placeholder="Enter Patient ID (e.g. 5)"
              value={patientId}
              onChange={e => setPatientId(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-[#1976d2] text-white rounded-xl text-sm font-semibold
                       hover:bg-[#1565c0] transition-colors disabled:opacity-60 shrink-0">
            {loading ? 'Loading...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-2 bg-[#FEF2F2] text-[#dc2626] text-sm rounded-xl px-4 py-3 border border-[#FCA5A5]">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            {error}
          </div>
        )}

        {patient && (
          <div className="bg-[#EFF6FF] rounded-xl p-4 flex items-center gap-3 border border-[#BFDBFE]">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-sm font-bold text-white"
                 style={{ background: 'linear-gradient(135deg, #1565c0, #1e88e5)' }}>
              {patient.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
            </div>
            <div>
              <p className="font-semibold text-[#0F172A]">{patient.name}</p>
              <p className="text-xs text-[#64748B]">{patient.email} · {patient.totalVisits} visits</p>
            </div>
          </div>
        )}

        {reports.length > 0 ? (
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider">{reports.length} Reports</p>
            {reports.map((r, i) => (
              <div key={r.reportId}
                className={`card-hover bg-white rounded-xl p-4 flex items-center gap-4
                             border border-[#E2E8F0] shadow-sm anim-fade-up anim-fade-up-${Math.min(i+1,6)}`}>
                <div className="w-11 h-11 rounded-xl bg-[#EFF6FF] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[#1976d2] text-xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}>
                    {fileIcon(r.fileType)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#0F172A] truncate">{r.fileName}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {r.fileType} · {new Date(r.uploadedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <button onClick={() => download(r.reportId, r.fileName)}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-[#1976d2]
                             hover:bg-[#EFF6FF] px-3 py-2 rounded-lg transition-colors border border-[#BFDBFE]">
                  <span className="material-symbols-outlined text-base">download</span>
                  Download
                </button>
              </div>
            ))}
          </div>
        ) : patient ? (
          <div className="flex flex-col items-center justify-center py-16 text-[#94a3b8] gap-3
                          bg-white rounded-2xl border border-[#E2E8F0]">
            <span className="material-symbols-outlined text-4xl">folder_open</span>
            <p className="text-sm font-medium">No lab reports uploaded by this patient yet</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

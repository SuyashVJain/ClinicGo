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
    <div className="h-full bg-surface-container-low">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md px-8 py-4 border-b border-outline-variant/10">
        <h2 className="text-xl font-bold text-on-surface">Lab Reports</h2>
        <p className="text-xs text-outline">View patient-uploaded lab documents</p>
      </header>

      <div className="px-8 py-8 max-w-3xl mx-auto space-y-6">
        {/* Search */}
        <form onSubmit={search} className="flex gap-3">
          <input
            className="soft-input flex-1"
            type="number"
            placeholder="Enter Patient ID (e.g. 5)"
            value={patientId}
            onChange={e => setPatientId(e.target.value)}
          />
          <button type="submit" disabled={loading}
            className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-60 shrink-0">
            {loading ? 'Loading...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="bg-error-container text-error text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        {patient && (
          <div className="bg-secondary-container/30 rounded-xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-on-secondary-container">
                {patient.name?.split(' ').map(w=>w[0]).join('').slice(0,2)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-on-background">{patient.name}</p>
              <p className="text-xs text-outline">{patient.email} · {patient.totalVisits} visits</p>
            </div>
          </div>
        )}

        {reports.length > 0 ? (
          <div className="space-y-3">
            <p className="text-xs font-bold text-outline uppercase tracking-wider">{reports.length} Reports</p>
            {reports.map(r => (
              <div key={r.reportId}
                className="bg-surface-container-lowest rounded-xl p-4 flex items-center gap-4 border border-outline-variant/10">
                <div className="w-11 h-11 rounded-xl bg-secondary-container flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary text-xl"
                        style={{ fontVariationSettings: "'FILL' 1" }}>
                    {fileIcon(r.fileType)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-on-background truncate">{r.fileName}</p>
                  <p className="text-xs text-outline mt-0.5">
                    {r.fileType} · {new Date(r.uploadedAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <button onClick={() => download(r.reportId, r.fileName)}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-primary hover:bg-secondary-container px-3 py-2 rounded-lg transition-colors">
                  <span className="material-symbols-outlined text-base">download</span>
                  Download
                </button>
              </div>
            ))}
          </div>
        ) : patient ? (
          <div className="text-center text-outline text-sm py-12 bg-surface-container-lowest rounded-xl border border-outline-variant/10">
            No lab reports uploaded by this patient yet
          </div>
        ) : null}
      </div>
    </div>
  );
}

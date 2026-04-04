import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';

export default function AdminDoctors() {
  const [doctors, setDoctors]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState({ name:'', email:'', password:'', phone:'', specialization:'', newPatientFee:300, followUpFee:200 });
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState('');

  const load = async () => {
    try {
      const res = await adminAPI.getDoctors();
      setDoctors(res.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      await adminAPI.createDoctor(form);
      setShowForm(false);
      setForm({ name:'', email:'', password:'', phone:'', specialization:'', newPatientFee:300, followUpFee:200 });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create doctor.');
    } finally { setSaving(false); }
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm('Deactivate this doctor?')) return;
    try { await adminAPI.deactivateDoctor(id); load(); } catch {}
  };

  return (
    <div className="h-full bg-surface-container-low">
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center px-8 py-4 border-b border-outline-variant/10">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Doctors</h2>
          <p className="text-xs text-outline">{doctors.length} registered doctors</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors">
          <span className="material-symbols-outlined text-sm">add</span>
          Add Doctor
        </button>
      </header>

      <div className="px-8 py-8 max-w-[1400px] mx-auto space-y-6">
        {/* Add form */}
        {showForm && (
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/10">
            <h3 className="text-base font-bold text-on-background mb-5">New Doctor Account</h3>
            {error && <div className="bg-error-container text-error text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text', placeholder: 'Dr. Anil Mehta' },
                { label: 'Email', key: 'email', type: 'email', placeholder: 'doctor@clinic.com' },
                { label: 'Password', key: 'password', type: 'password', placeholder: 'Min 8 characters' },
                { label: 'Phone', key: 'phone', type: 'tel', placeholder: '9876543210' },
                { label: 'Specialization', key: 'specialization', type: 'text', placeholder: 'General Physician' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">{label}</label>
                  <input className="soft-input" type={type} placeholder={placeholder}
                    value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} required />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">New Patient Fee (₹)</label>
                  <input className="soft-input" type="number" value={form.newPatientFee}
                    onChange={e => setForm({ ...form, newPatientFee: Number(e.target.value) })} required />
                </div>
                <div>
                  <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-1.5">Follow-up Fee (₹)</label>
                  <input className="soft-input" type="number" value={form.followUpFee}
                    onChange={e => setForm({ ...form, followUpFee: Number(e.target.value) })} required />
                </div>
              </div>
              <div className="md:col-span-2 flex gap-3 mt-2">
                <button type="submit" disabled={saving}
                  className="px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary-container transition-colors disabled:opacity-60">
                  {saving ? 'Creating...' : 'Create Doctor'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 bg-surface-container text-on-surface-variant rounded-xl text-sm font-semibold hover:bg-surface-container-high transition-colors">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-outline text-sm">Loading doctors...</div>
          ) : doctors.length === 0 ? (
            <div className="p-12 text-center text-outline text-sm">No doctors yet — add one above</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  {['Doctor', 'Specialization', 'New Patient Fee', 'Follow-up Fee', 'Status', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs font-bold text-outline uppercase tracking-wider px-6 py-4">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {doctors.map(d => (
                  <tr key={d.doctorId} className="hover:bg-surface-container-low transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-on-secondary-container">
                            {d.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-background">{d.name}</p>
                          <p className="text-xs text-outline">{d.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-on-surface-variant">{d.specialization}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-background">₹{d.newPatientFee}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-on-background">₹{d.followUpFee}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                        d.status === 'ACTIVE'
                          ? 'bg-[#E8F5E9] text-[#2E7D32]'
                          : 'bg-surface-container text-outline'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {d.status === 'ACTIVE' && (
                        <button onClick={() => handleDeactivate(d.doctorId)}
                          className="text-xs text-error hover:bg-error-container px-3 py-1.5 rounded-lg transition-colors">
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

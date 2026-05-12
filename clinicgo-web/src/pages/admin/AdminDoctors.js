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

        {/* Doctor cards grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-[#E2E8F0] space-y-4">
                <div className="flex items-center gap-3">
                  <div className="skeleton w-12 h-12 rounded-full shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="skeleton h-4 rounded w-3/4" />
                    <div className="skeleton h-3 rounded w-1/2" />
                  </div>
                </div>
                <div className="skeleton h-3 rounded w-full" />
                <div className="skeleton h-3 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : doctors.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-[#E2E8F0]">
            <span className="material-symbols-outlined text-4xl text-[#CBD5E1] mb-3 block">stethoscope</span>
            <p className="text-[#64748B] text-sm">No doctors yet — add one above</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {doctors.map((d, i) => (
              <div key={d.doctorId}
                   className={`card-hover bg-white rounded-2xl p-6 border border-[#E2E8F0] shadow-sm
                               anim-fade-up anim-fade-up-${Math.min(i + 1, 6)}`}>
                {/* Doctor header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 text-sm font-bold"
                         style={{ background: 'linear-gradient(135deg, #1565c0, #1e88e5)', color: '#fff' }}>
                      {d.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-bold text-[#0F172A] text-sm leading-tight">{d.name}</p>
                      <p className="text-xs text-[#64748B] mt-0.5">{d.email}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${
                    d.status === 'ACTIVE'
                      ? 'bg-[#DCFCE7] text-[#166534]'
                      : 'bg-[#F1F5F9] text-[#64748B]'}`}>
                    {d.status}
                  </span>
                </div>

                {/* Specialization */}
                <div className="flex items-center gap-1.5 mb-4">
                  <span className="material-symbols-outlined text-xs text-[#1976d2]"
                        style={{ fontVariationSettings: "'FILL' 1" }}>
                    medical_services
                  </span>
                  <span className="text-sm text-[#475569]">{d.specialization}</span>
                </div>

                {/* Fee badges */}
                <div className="flex gap-2 mb-5">
                  <div className="flex-1 bg-[#EFF6FF] rounded-xl p-3 text-center">
                    <p className="text-[10px] text-[#64748B] mb-0.5">New Patient</p>
                    <p className="text-sm font-bold text-[#1976d2]">₹{d.newPatientFee}</p>
                  </div>
                  <div className="flex-1 bg-[#F0FDF4] rounded-xl p-3 text-center">
                    <p className="text-[10px] text-[#64748B] mb-0.5">Follow-up</p>
                    <p className="text-sm font-bold text-[#059669]">₹{d.followUpFee}</p>
                  </div>
                </div>

                {/* Action */}
                {d.status === 'ACTIVE' && (
                  <button onClick={() => handleDeactivate(d.doctorId)}
                    className="w-full text-xs font-semibold text-[#dc2626] hover:bg-[#FEF2F2]
                               py-2 rounded-lg transition-colors border border-[#FCA5A5]">
                    Deactivate
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

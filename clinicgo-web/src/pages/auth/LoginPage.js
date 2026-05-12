import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { token, role, userId, name, status, doctorId } = res.data;

      if (role !== 'ADMIN' && role !== 'DOCTOR') {
        setError('This portal is for Admin and Doctor access only.');
        setLoading(false);
        return;
      }

      login({ userId, name, role, status, doctorId }, token);
      navigate(role === 'ADMIN' ? '/admin/dashboard' : '/doctor/schedule');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: 'calendar_today',   text: 'Manage today\'s appointments in real-time' },
    { icon: 'medical_services', text: 'Write prescriptions and track patient history' },
    { icon: 'analytics',        text: 'Revenue analytics and performance metrics' },
    { icon: 'group',            text: 'Patient registration and approval workflow' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* ── Left panel — dark navy branding ─────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12"
           style={{ background: 'linear-gradient(160deg, #0D1B2A 0%, #1A2F45 100%)' }}>

        {/* Logo */}
        <div className="flex items-center gap-3 anim-fade-up anim-fade-up-1">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
               style={{ background: 'linear-gradient(135deg, #1976d2, #42a5f5)' }}>
            <span className="material-symbols-outlined text-white text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
              medical_services
            </span>
          </div>
          <div>
            <span className="text-white font-bold text-xl tracking-tight">ClinicGo</span>
            <p className="text-xs" style={{ color: '#64748b' }}>Smart Clinic Management</p>
          </div>
        </div>

        {/* Tagline */}
        <div className="anim-fade-up anim-fade-up-2">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            The smarter way<br />to run your clinic.
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.7' }}>
            From appointment queues to prescriptions and analytics — everything your
            clinic needs in one place.
          </p>

          {/* Feature list */}
          <div className="mt-10 space-y-4">
            {features.map((f, i) => (
              <div key={i} className={`flex items-center gap-3 anim-fade-up anim-fade-up-${i + 3}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                     style={{ background: 'rgba(25, 118, 210, 0.15)' }}>
                  <span className="material-symbols-outlined text-sm"
                        style={{ color: '#42a5f5', fontVariationSettings: "'FILL' 1" }}>
                    {f.icon}
                  </span>
                </div>
                <span style={{ color: '#cbd5e1', fontSize: '14px' }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <p style={{ color: '#334155', fontSize: '12px' }}>
          ClinicGo v1.0 · MedCare Clinic, Indore
        </p>
      </div>

      {/* ── Right panel — login form ─────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md page-enter">

          {/* Mobile logo (hidden on desktop) */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-base"
                    style={{ fontVariationSettings: "'FILL' 1" }}>
                medical_services
              </span>
            </div>
            <span className="font-bold text-lg text-on-background">ClinicGo</span>
          </div>

          <h2 className="text-3xl font-bold text-on-background mb-1">Welcome back</h2>
          <p className="text-sm text-outline mb-8">Sign in to your admin or doctor account</p>

          {error && (
            <div className="flex items-center gap-2 bg-error-container text-error text-sm rounded-xl px-4 py-3 mb-6">
              <span className="material-symbols-outlined text-base shrink-0">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
                Email Address
              </label>
              <input
                className="soft-input"
                type="email"
                placeholder="you@clinicgo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider block mb-2">
                Password
              </label>
              <input
                className="soft-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3.5 rounded-xl font-semibold text-sm
                         transition-all disabled:opacity-60 mt-2"
              style={{
                background: loading
                  ? '#1976d2'
                  : 'linear-gradient(135deg, #1565c0 0%, #1976d2 50%, #1e88e5 100%)',
                boxShadow: loading ? 'none' : '0 4px 14px rgba(25,118,210,0.35)',
              }}
            >
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-outline-variant/20">
            <p className="text-xs text-outline text-center">
              Patient booking available on the ClinicGo Android app
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

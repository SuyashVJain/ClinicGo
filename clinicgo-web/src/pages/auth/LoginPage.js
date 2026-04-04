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
      const { token, role, userId, name, status } = res.data;

      if (role !== 'ADMIN' && role !== 'DOCTOR') {
        setError('This portal is for Admin and Doctor access only.');
        setLoading(false);
        return;
      }

      login({ userId, name, role, status }, token);
      navigate(role === 'ADMIN' ? '/admin/dashboard' : '/doctor/schedule');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-low flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-2xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
              medical_services
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-on-background tracking-tight">ClinicGo</h1>
            <p className="text-xs text-outline">Admin & Doctor Portal</p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-on-background mb-1">Welcome back</h2>
          <p className="text-sm text-outline mb-8">Sign in to your account</p>

          {error && (
            <div className="bg-error-container text-error text-sm rounded-xl px-4 py-3 mb-6">
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
              className="w-full bg-primary text-white py-3.5 rounded-xl font-semibold text-sm
                         hover:bg-primary-container transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-outline-variant/20">
            <p className="text-xs text-outline text-center">
              Patient app available on Android
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-outline mt-6">
          ClinicGo v1.0 · MedCare Clinic, Indore
        </p>
      </div>
    </div>
  );
}

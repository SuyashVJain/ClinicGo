import React, { useState, useEffect, useCallback, useRef } from 'react';
import { patientAPI } from '../../services/api';

export default function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [query, setQuery]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const debounceRef             = useRef(null);

  const search = useCallback(async (name) => {
    setLoading(true);
    setError('');
    try {
      const res = await patientAPI.search(name);
      setPatients(res.data || []);
    } catch {
      setError('Failed to load patients.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { search(''); }, [search]);

  const handleSubmit = (e) => { e.preventDefault(); search(query); };

  const handleQueryChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const approve = async (id) => {
    try {
      await patientAPI.approve(id);
      search(query);
    } catch {}
  };

  const reject = async (id) => {
    if (!window.confirm('Reject this patient registration?')) return;
    try {
      await patientAPI.reject(id);
      search(query);
    } catch {}
  };

  const statusBadge = (status) => {
    const map = {
      ACTIVE:   'bg-[#E8F5E9] text-[#2E7D32]',
      PENDING:  'bg-[#FFF3E0] text-[#E65100]',
      INACTIVE: 'bg-surface-container text-outline',
    };
    return map[status] || 'bg-surface-container text-outline';
  };

  return (
    <div className="h-full bg-[#F8FAFC]">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md flex justify-between items-center
                         px-8 py-4 border-b border-[#E2E8F0]">
        <div>
          <h2 className="text-xl font-bold text-[#0F172A]">Patients</h2>
          <p className="text-xs text-[#64748B]">{patients.length} patients found</p>
        </div>
      </header>

      <div className="px-8 py-8 max-w-[1400px] mx-auto space-y-6 page-enter">
        {/* Search bar */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="flex-1 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8] text-lg">
              search
            </span>
            <input
              className="soft-input pl-10"
              type="text"
              placeholder="Search by name… (auto-searches as you type)"
              value={query}
              onChange={handleQueryChange}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-[#1976d2] text-white rounded-xl text-sm font-semibold
                       hover:bg-[#1565c0] transition-colors disabled:opacity-60 shrink-0"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="flex items-center gap-2 bg-[#FEF2F2] text-[#dc2626] text-sm rounded-xl px-4 py-3 border border-[#FCA5A5]">
            <span className="material-symbols-outlined text-base shrink-0">error</span>
            {error}
          </div>
        )}

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#E2E8F0] overflow-hidden">
          {loading ? (
            <div className="divide-y divide-[#F1F5F9]">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="skeleton w-9 h-9 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 rounded w-1/3" />
                    <div className="skeleton h-3 rounded w-1/4" />
                  </div>
                  <div className="skeleton h-5 rounded-full w-16" />
                  <div className="skeleton h-3 rounded w-20" />
                </div>
              ))}
            </div>
          ) : patients.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-3 text-[#94a3b8]">
              <span className="material-symbols-outlined text-4xl">person_search</span>
              <p className="text-sm font-medium">No patients found</p>
              <p className="text-xs">Try a different name or clear the search</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#F1F5F9] bg-[#F8FAFC]">
                  {['Patient', 'Phone', 'Status', 'Registered', 'Actions'].map((h) => (
                    <th key={h}
                        className="text-left text-[10px] font-bold text-[#94a3b8] uppercase tracking-wider px-6 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9]">
                {patients.map((p, i) => (
                  <tr key={p.userId}
                      className="hover:bg-[#F8FAFC] transition-colors anim-fade-up"
                      style={{ animationDelay: `${i * 40}ms` }}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0
                                        text-xs font-bold text-white"
                             style={{ background: 'linear-gradient(135deg, #1565c0, #1e88e5)' }}>
                          {p.name?.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#0F172A]">{p.name}</p>
                          <p className="text-xs text-[#64748B]">{p.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#475569]">{p.phone || '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full ${statusBadge(p.status)}`}>
                        {p.status === 'PENDING' && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#E65100] pulse-dot shrink-0" />
                        )}
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-[#64748B]">
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {p.status === 'PENDING' && (
                          <button onClick={() => approve(p.userId)}
                            className="text-xs font-semibold text-[#166534] bg-[#DCFCE7] hover:bg-[#BBF7D0]
                                       px-3 py-1.5 rounded-lg transition-colors">
                            Approve
                          </button>
                        )}
                        {p.status === 'PENDING' && (
                          <button onClick={() => reject(p.userId)}
                            className="text-xs font-semibold text-[#dc2626] hover:bg-[#FEF2F2]
                                       px-3 py-1.5 rounded-lg transition-colors border border-[#FCA5A5]">
                            Reject
                          </button>
                        )}
                      </div>
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

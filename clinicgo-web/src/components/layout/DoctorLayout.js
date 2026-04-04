import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/doctor/schedule',    icon: 'calendar_today', label: "Today's Schedule" },
  { to: '/doctor/lab-reports', icon: 'biotech',        label: 'Lab Reports'      },
  { to: '/doctor/stats',       icon: 'leaderboard',    label: 'My Stats'         },
];

export default function DoctorLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-container-low">
      {/* Sidebar */}
      <aside className="w-52 flex-shrink-0 bg-primary flex flex-col py-4">
        <div className="px-6 py-4 mb-2">
          <h1 className="text-white font-bold text-xl tracking-tight">ClinicGo</h1>
          <p className="text-white/50 text-xs uppercase tracking-widest mt-0.5">Medical Portal</p>
        </div>

        <nav className="flex-1 px-2 space-y-1">
          {navItems.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all
                 ${isActive
                   ? 'bg-white/10 text-white font-semibold'
                   : 'text-blue-100/70 hover:text-white hover:bg-white/5'}`
              }>
              <span className="material-symbols-outlined text-xl">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-2 space-y-1 mt-auto">
          <NavLink to="/doctor/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-blue-100/70 hover:text-white hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-xl">settings</span>
            Settings
          </NavLink>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-blue-100/70 hover:text-white hover:bg-white/5 transition-all">
            <span className="material-symbols-outlined text-xl">logout</span>
            Sign Out
          </button>
          <div className="mx-4 pt-4 border-t border-white/10 flex items-center gap-2 pb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">
                {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-white/40 text-xs">Doctor</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto no-scrollbar">
        <Outlet />
      </main>
    </div>
  );
}

import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { to: '/admin/dashboard',  icon: 'dashboard',       label: 'Dashboard'   },
  { to: '/admin/analytics',  icon: 'analytics',       label: 'Analytics'   },
  { to: '/admin/doctors',    icon: 'medical_services', label: 'Doctors'    },
  { to: '/admin/operations', icon: 'monitor_heart',   label: 'Operations'  },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-container-low">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-sidebar-dark flex flex-col py-6">
        {/* Logo */}
        <div className="px-6 mb-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-container rounded-xl flex items-center justify-center">
            <span className="material-symbols-outlined text-white text-xl"
                  style={{ fontVariationSettings: "'FILL' 1" }}>
              medical_services
            </span>
          </div>
          <div>
            <h1 className="text-white font-bold tracking-tight text-xl">ClinicGo</h1>
            <p className="text-blue-200/60 text-xs">Admin Portal</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-2">
          {navItems.map(({ to, icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150
                 ${isActive
                   ? 'bg-white/10 text-white border-l-4 border-primary'
                   : 'text-blue-200/70 hover:text-white hover:bg-white/5'}`
              }>
              <span className="material-symbols-outlined text-xl">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-2 mt-auto space-y-1">
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3 px-4">
            <div className="w-9 h-9 rounded-full bg-secondary-container flex items-center justify-center shrink-0">
              <span className="text-on-secondary-container text-xs font-bold">
                {user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
              <p className="text-blue-200/50 text-xs">{user?.role}</p>
            </div>
            <button onClick={handleLogout}
              className="text-blue-200/70 hover:text-error transition-colors p-1">
              <span className="material-symbols-outlined text-xl">logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto no-scrollbar">
        <Outlet />
      </main>
    </div>
  );
}

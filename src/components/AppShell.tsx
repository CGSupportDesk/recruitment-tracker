import {
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  FileText,
  LayoutDashboard,
  Search,
  Settings,
} from 'lucide-react';
import { NavLink, Outlet } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', to: '/', icon: LayoutDashboard },
  { label: 'Clients', to: '/clients', icon: Building2 },
  { label: 'Roles', to: '/roles', icon: BriefcaseBusiness },
  { label: 'Reports', to: '/reports', icon: FileText },
  { label: 'Settings', to: '/settings', icon: Settings },
];

export function AppShell() {
  return (
    <div className="min-h-screen bg-canvas">
      <div className="fixed inset-x-0 top-0 h-[330px] bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] gap-6 px-4 py-8 sm:px-6 lg:px-10">
        <aside className="hidden w-[132px] shrink-0 lg:block">
          <div className="sticky top-8 rounded-lg bg-white px-3 py-5 shadow-soft">
            <div className="mx-auto mb-5 flex h-9 w-9 items-center justify-center rounded-md bg-brand-600 text-white">
              <BarChart3 size={18} />
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex flex-col items-center gap-2 rounded-md px-2 py-4 text-[10px] font-semibold uppercase tracking-[0.08em] transition ${
                      isActive ? 'bg-brand-600 text-white shadow-lift' : 'text-slate-400 hover:bg-slate-50 hover:text-ink'
                    }`
                  }
                >
                  <item.icon size={18} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="mb-8 flex flex-col gap-4 text-white md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/65">Beyond ClosingGap Pvt Ltd</p>
              <h1 className="mt-2 text-2xl font-semibold">Recruitment Tracker</h1>
            </div>
            <div className="flex items-center gap-3">
              <label className="relative hidden sm:block">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/55" size={16} />
                <input
                  className="h-10 w-[280px] rounded-md border border-white/10 bg-brand-900/20 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/55 focus:border-white/30"
                  placeholder="Search clients, roles"
                />
              </label>
              <button className="rounded-md p-2.5 text-white/80 hover:bg-white/10" aria-label="Notifications">
                <Bell size={18} />
              </button>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-sm font-bold text-brand-700">
                CG
              </div>
            </div>
          </header>

          <nav className="mb-5 grid grid-cols-5 rounded-lg bg-white p-1 shadow-soft lg:hidden">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-1 rounded-md px-1 py-2 text-[10px] font-semibold ${
                    isActive ? 'bg-brand-600 text-white' : 'text-slate-500'
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <Outlet />
        </div>
      </div>
    </div>
  );
}

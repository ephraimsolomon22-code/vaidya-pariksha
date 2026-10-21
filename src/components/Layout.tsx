import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Role } from '../types';
import { useAlerts } from '../lib/useAlerts';
import {
  LayoutDashboard,
  FileUp,
  FlaskConical,
  ShieldCheck,
  MapPin,
  Users,
  CalendarCheck,
  HeartPulse,
  Sparkles,
  BrainCircuit,
  BarChart3,
  Share2,
  ScrollText,
  LogOut,
  Bell
} from 'lucide-react';

const NAV: { to: string; label: string; icon: any; roles: Role[] | 'all' }[] = [
  { to: '/', label: 'Overview', icon: LayoutDashboard, roles: 'all' },
  { to: '/protocol', label: 'AI Protocol Setup', icon: FileUp, roles: ['Admin', 'Investigator'] },
  { to: '/trials', label: 'Trial Management', icon: FlaskConical, roles: 'all' },
  { to: '/ethics', label: 'Ethics & Regulatory', icon: ShieldCheck, roles: ['Admin', 'Investigator', 'Regulatory'] },
  { to: '/sites', label: 'Sites', icon: MapPin, roles: ['Admin', 'Investigator', 'Coordinator'] },
  { to: '/participants', label: 'Participants', icon: Users, roles: ['Admin', 'Investigator', 'Coordinator'] },
  { to: '/visits', label: 'Visits', icon: CalendarCheck, roles: ['Admin', 'Investigator', 'Coordinator'] },
  { to: '/safety', label: 'Safety', icon: HeartPulse, roles: ['Admin', 'Safety', 'Investigator'] },
  { to: '/data-quality', label: 'Data Quality', icon: Sparkles, roles: ['Admin', 'Data Manager'] },
  { to: '/risk', label: 'AI & Risk', icon: BrainCircuit, roles: ['Admin', 'Investigator', 'Safety'] },
  { to: '/analytics', label: 'Analytics', icon: BarChart3, roles: ['Admin', 'Investigator', 'Data Manager'] },
  { to: '/export', label: 'Export & Interop', icon: Share2, roles: ['Admin', 'Regulatory', 'Data Manager'] },
  { to: '/audit', label: 'Audit Log', icon: ScrollText, roles: ['Admin', 'Regulatory', 'Investigator'] }
];

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function Layout() {
  const { profile, signOut } = useAuth();
  const { alerts } = useAlerts();
  const items = NAV.filter((n) => n.roles === 'all' || (profile && n.roles.includes(profile.role)));
  const openAlerts = alerts.filter((a) => !a.resolved).length;

  return (
    <div className="min-h-screen flex bg-paper">
      <aside className="w-60 shrink-0 text-white p-4 flex flex-col bg-teal-dark">
        <div className="flex items-center gap-2 mb-1 px-1">
          <div className="w-8 h-8 rounded-lg bg-teal flex items-center justify-center font-serifh text-sm">V</div>
          <div className="font-serifh text-lg tracking-tight">VaidyaPariksha</div>
        </div>
        <div className="text-[11px] text-[#9dc4be] mb-6 px-1">Ministry of Ayush · AIIA</div>

        <nav className="space-y-1 flex-1 overflow-y-auto pr-1">
          {items.map((n) => {
            const Icon = n.icon;
            return (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive ? 'bg-teal text-white font-medium shadow-pop' : 'text-[#cfe4e0] hover:bg-[#134a44] hover:text-white'
                  }`
                }
              >
                <Icon size={16} strokeWidth={2} />
                {n.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-[#1c5a53] pt-3 mt-3">
          {profile && (
            <div className="flex items-center gap-2 px-1 mb-2">
              <div className="w-8 h-8 rounded-full bg-teal flex items-center justify-center text-xs font-semibold shrink-0">
                {initials(profile.full_name)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{profile.full_name}</div>
                <div className="text-[11px] text-[#9dc4be]">{profile.role}</div>
              </div>
            </div>
          )}
          <button
            onClick={signOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-[#cfe4e0] hover:bg-[#134a44] hover:text-white"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="flex items-center justify-between px-7 py-4 border-b border-line bg-panel/80 backdrop-blur">
          <div className="text-xs text-muted font-medium tracking-wide uppercase">AIIA Clinical Trials Dashboard</div>
          <div className="relative flex items-center gap-1.5 border border-line rounded-full pl-3 pr-2.5 py-1.5 text-sm bg-paper">
            <Bell size={15} className={openAlerts ? 'text-red' : 'text-muted'} />
            <span className="text-xs font-semibold">{openAlerts}</span>
          </div>
        </header>
        <div className="p-7 max-w-6xl w-full mx-auto flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

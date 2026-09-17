import { NavLink } from 'react-router-dom';
import { Home, CalendarCheck, Wallet, BookOpen } from 'lucide-react';

const items = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/sessions', label: 'Sessions', icon: CalendarCheck, end: false },
  { to: '/earnings', label: 'Earnings', icon: Wallet, end: false },
  { to: '/guide', label: 'Guide', icon: BookOpen, end: false },
];

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="max-w-[480px] mx-auto grid grid-cols-4" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {items.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-0.5 py-2 tap-target ${
                isActive ? 'text-primary' : 'text-gray-400'
              }`
            }
          >
            <Icon size={22} />
            <span className="text-[11px] font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

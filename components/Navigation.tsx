'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { Home, CheckSquare, Target, BarChart3, Settings, Trophy } from 'lucide-react';

const childNav = [
  { href: '/', icon: Home, label: 'Hjem' },
  { href: '/tasks', icon: CheckSquare, label: 'Oppgaver' },
  { href: '/goals', icon: Target, label: 'Mål' },
  { href: '/stats', icon: BarChart3, label: 'Statistikk' },
  { href: '/profile', icon: Trophy, label: 'Profil' },
];

const adminNav = [
  { href: '/', icon: Home, label: 'Hjem' },
  { href: '/tasks', icon: CheckSquare, label: 'Oppgaver' },
  { href: '/goals', icon: Target, label: 'Mål' },
  { href: '/stats', icon: BarChart3, label: 'Statistikk' },
  { href: '/admin', icon: Settings, label: 'Admin' },
];

export default function Navigation() {
  const pathname = usePathname();
  const { isAdmin, getPendingApprovals } = useApp();
  const nav = isAdmin ? adminNav : childNav;
  const pending = getPendingApprovals().length;

  // Hide navigation on the home/user-selection screen
  if (pathname === '/') return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-gray-900/95 backdrop-blur-lg border-t border-white/10">
      <div className="max-w-lg mx-auto flex">
        {nav.map(({ href, icon: Icon, label }) => {
          const active = href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href);
          const showBadge = href === '/admin' && pending > 0;
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center py-2.5 gap-0.5 relative group">
              <div className={`relative p-2 rounded-xl transition-all duration-200 ${active ? 'bg-indigo-600 scale-110' : 'group-hover:bg-white/10'}`}>
                <Icon size={20} className={active ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                {showBadge && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {pending}
                  </span>
                )}
              </div>
              <span className={`text-xs font-medium transition-colors ${active ? 'text-indigo-400' : 'text-gray-600 group-hover:text-gray-300'}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

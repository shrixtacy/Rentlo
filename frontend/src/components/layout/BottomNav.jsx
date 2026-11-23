import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Compass, Package, MessageSquare, User } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/rentals', icon: Package, label: 'Rentals' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function BottomNav() {
  return (
    <nav className="lg:hidden fixed bottom-4 left-4 right-4 z-30">
      <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-full px-2 py-2 flex items-center justify-around border border-gray-100">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all min-w-[52px]',
                isActive ? 'text-dark font-bold' : 'text-muted',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={20} className={isActive ? 'text-primary' : ''} />
                <span className="text-[10px] leading-tight">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

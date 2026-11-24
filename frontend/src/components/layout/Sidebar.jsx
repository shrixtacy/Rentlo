import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Compass, Package, MessageSquare, User } from 'lucide-react';
import Button from '../ui/Button';

const navItems = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/rentals', icon: Package, label: 'My Rentals' },
  { to: '/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-100 px-4 py-6 z-30">
      {/* Logo */}
      <div className="mb-8 px-2">
        <h1 className="text-2xl font-extrabold text-dark tracking-tight">
          Rentlo<span className="text-primary">.</span>
        </h1>
        <p className="text-xs text-muted mt-0.5">Borrow &amp; Lend Nearby</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all',
                isActive
                  ? 'font-bold text-dark bg-primary/10 border-l-4 border-primary pl-2'
                  : 'text-muted hover:bg-gray-50 hover:text-dark',
              ].join(' ')
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* CTA */}
      <div className="mt-6">
        <Button
          variant="primary"
          className="w-full"
          onClick={() => navigate('/listings/create')}
        >
          + List Item
        </Button>
      </div>
    </aside>
  );
}

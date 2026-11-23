import React from 'react';
import { Bell } from 'lucide-react';

const MOCK_NOTIFICATION_COUNT = 3;

export default function Header() {
  return (
    <header className="lg:hidden sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      {/* Mobile: logo centered */}
      <div className="flex-1" />
      <h1 className="text-xl font-extrabold text-dark tracking-tight">
        Rentlo<span className="text-primary">.</span>
      </h1>
      <div className="flex-1 flex justify-end">
        <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Notifications">
          <Bell size={20} className="text-dark" />
          {MOCK_NOTIFICATION_COUNT > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-error text-white text-[9px] font-bold flex items-center justify-center">
              {MOCK_NOTIFICATION_COUNT}
            </span>
          )}
        </button>
      </div>
    </header>
  );
}

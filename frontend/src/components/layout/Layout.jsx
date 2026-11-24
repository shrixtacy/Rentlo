import React from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import FAB from './FAB';
import Header from './Header';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Mobile header */}
      <Header />

      {/* Main content */}
      <main className="lg:ml-64 lg:p-6 pb-32 lg:pb-6 min-h-screen">
        {children}
      </main>

      {/* Mobile bottom nav + FAB */}
      <BottomNav />
      <FAB />
    </div>
  );
}

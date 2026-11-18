import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-50">
        <header className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight">RENTLO</span>
            <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full uppercase font-semibold">PWA</span>
          </div>
          <nav className="flex gap-4 text-sm font-medium">
            <Link to="/" className="hover:text-orange-400">Explore</Link>
            <Link to="/bookings" className="hover:text-orange-400">My Bookings</Link>
            <Link to="/dashboard" className="hover:text-orange-400">Dashboard</Link>
            <Link to="/login" className="bg-orange-500 hover:bg-orange-600 px-3 py-1.5 rounded-md text-white">Login</Link>
          </nav>
        </header>

        <main className="flex-1 max-w-7xl w-full mx-auto p-6">
          <Routes>
            <Route path="/" element={<h2 className="text-2xl font-bold text-slate-800">Explore Items Available to Rent</h2>} />
            <Route path="/bookings" element={<h2 className="text-2xl font-bold text-slate-800">Your Active & Past Bookings</h2>} />
            <Route path="/dashboard" element={<h2 className="text-2xl font-bold text-slate-800">Owner & Renter Dashboard</h2>} />
            <Route path="/login" element={<h2 className="text-2xl font-bold text-slate-800">Login / Register to Rentlo</h2>} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;

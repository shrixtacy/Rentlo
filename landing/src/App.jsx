import React from 'react';

const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:5173';

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Navigation */}
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-blue-900 tracking-tight">RENTLO</span>
            <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded">P2P</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#how-it-works" className="hover:text-blue-900">How It Works</a>
            <a href="#categories" className="hover:text-blue-900">Browse Categories</a>
            <a href="#trust" className="hover:text-blue-900">Trust & Safety</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href={`${APP_URL}/login`}
              className="text-sm font-semibold text-slate-700 hover:text-blue-900 px-3 py-2"
            >
              Sign In
            </a>
            <a
              href={`${APP_URL}/login?mode=register`}
              className="text-sm font-semibold text-white bg-blue-900 hover:bg-blue-800 px-4 py-2 rounded-lg shadow-sm"
            >
              Open Web App
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50/50 to-white py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full uppercase tracking-wider">
            Peer-to-Peer Rental Marketplace
          </span>
          <h1 className="mt-6 text-5xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Don't buy what you only need once. <br className="hidden sm:block" />
            <span className="text-blue-900">Rent nearby or monetize your gear.</span>
          </h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            Rent cameras, camping gear, tools, bikes, and party equipment from verified people in your neighborhood with secure deposits and damage protection.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`${APP_URL}`}
              className="px-6 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-lg transition"
            >
              Browse Items on App
            </a>
            <a
              href={`${APP_URL}/login?mode=register&role=owner`}
              className="px-6 py-3.5 bg-white border border-slate-300 hover:border-slate-400 text-slate-800 font-semibold rounded-xl shadow-sm transition"
            >
              List an Item & Earn
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t py-8 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Rentlo Marketplace Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

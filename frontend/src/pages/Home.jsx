import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApi } from '../hooks/useApi';
import ListingGrid from '../components/listings/ListingGrid';
import ListingCard from '../components/listings/ListingCard';
import Spinner from '../components/ui/Spinner';

const CATEGORIES = [
  { label: 'Cameras', value: 'cameras', emoji: '📷' },
  { label: 'Tools', value: 'tools', emoji: '🔧' },
  { label: 'Bikes', value: 'bikes', emoji: '🚲' },
  { label: 'Camping', value: 'camping', emoji: '⛺' },
  { label: 'Electronics', value: 'electronics', emoji: '💻' },
  { label: 'Sports', value: 'sports', emoji: '⚽' },
  { label: 'Books', value: 'books', emoji: '📚' },
  { label: 'Party', value: 'party', emoji: '🎉' },
  { label: 'Other', value: 'other', emoji: '📦' },
];

export default function Home() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { get } = useApi();

  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyListings, setNearbyListings] = useState([]);
  const [recentListings, setRecentListings] = useState([]);
  const [nearbyLoading, setNearbyLoading] = useState(true);
  const [recentLoading, setRecentLoading] = useState(true);
  const [stats, setStats] = useState({ activeRentals: 0, listedItems: 0 });

  useEffect(() => {
    const fetchNearby = async () => {
      setNearbyLoading(true);
      try {
        const res = await get('/listings?limit=8');
        setNearbyListings(res.data?.listings || []);
      } catch {
        // silent
      } finally {
        setNearbyLoading(false);
      }
    };

    const fetchRecent = async () => {
      setRecentLoading(true);
      try {
        const res = await get('/listings?sortBy=newest&limit=6');
        setRecentListings(res.data?.listings || []);
      } catch {
        // silent
      } finally {
        setRecentLoading(false);
      }
    };

    fetchNearby();
    fetchRecent();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchStats = async () => {
      try {
        const res = await get('/bookings/my');
        const asRenter = res.data?.asRenter || [];
        const activeRentals = asRenter.filter((b) => ['ACTIVE', 'CONFIRMED', 'APPROVED'].includes(b.status)).length;
        setStats((prev) => ({ ...prev, activeRentals }));
      } catch {
        // silent
      }
    };
    fetchStats();
  }, [isAuthenticated]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  const handleCategoryClick = (category) => {
    navigate(`/explore?category=${encodeURIComponent(category)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 lg:p-6 max-w-6xl mx-auto"
    >
      {/* Greeting */}
      <div className="mb-6">
        {isAuthenticated && user ? (
          <h1 className="text-2xl font-extrabold text-dark">
            Hey {user.name?.split(' ')[0]} 👋
          </h1>
        ) : (
          <h1 className="text-2xl font-extrabold text-dark">Find what you need</h1>
        )}
        <p className="text-muted text-sm mt-1">Discover items available to borrow nearby</p>
      </div>

      {/* Stats bar (logged in only) */}
      {isAuthenticated && (
        <div className="flex gap-3 mb-6">
          <div className="flex-1 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
            <p className="text-xs text-muted">Active Rentals</p>
            <p className="text-2xl font-bold text-dark">{stats.activeRentals}</p>
          </div>
          <div className="flex-1 bg-primary/10 rounded-2xl border border-primary/20 p-4">
            <p className="text-xs text-dark/60">Items Listed</p>
            <p className="text-2xl font-bold text-dark">{stats.listedItems}</p>
          </div>
        </div>
      )}

      {/* Hero search */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <div className="flex items-center bg-white rounded-full border border-gray-200 shadow-sm px-5 py-3.5 gap-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search size={20} className="text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="What do you want to borrow?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 outline-none bg-transparent text-dark placeholder:text-muted text-base"
          />
          <button
            type="submit"
            className="bg-primary text-dark font-semibold text-sm px-5 py-2 rounded-full hover:bg-primary/90 transition-all flex-shrink-0"
          >
            Search
          </button>
        </div>
      </form>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        {CATEGORIES.map(({ label, value, emoji }) => (
          <button
            key={value}
            onClick={() => handleCategoryClick(value)}
            className="flex-shrink-0 flex items-center gap-1.5 bg-white border border-gray-200 rounded-full px-4 py-2 text-sm font-medium text-dark hover:border-primary hover:bg-primary/10 transition-all duration-200"
          >
            <span>{emoji}</span>
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* Nearby listings */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark">Nearby Listings</h2>
          <button
            onClick={() => navigate('/explore')}
            className="text-sm text-muted hover:text-dark transition-colors font-medium"
          >
            See all
          </button>
        </div>
        {nearbyLoading ? (
          <ListingGrid loading={true} />
        ) : nearbyListings.length === 0 ? (
          <div className="text-center py-12 text-muted">
            <p className="text-4xl mb-3">📦</p>
            <p className="font-medium">No listings yet</p>
            <p className="text-sm mt-1">Be the first to list something!</p>
          </div>
        ) : (
          <ListingGrid listings={nearbyListings} />
        )}
      </section>

      {/* Recently added — horizontal scroll */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-dark">Recently Added</h2>
          <button
            onClick={() => navigate('/explore?sortBy=newest')}
            className="text-sm text-muted hover:text-dark transition-colors font-medium"
          >
            See all
          </button>
        </div>
        {recentLoading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : recentListings.length === 0 ? (
          <p className="text-muted text-sm">Nothing new yet.</p>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {recentListings.map((listing) => (
              <div key={listing._id} className="flex-shrink-0 w-56">
                <ListingCard listing={listing} />
              </div>
            ))}
          </div>
        )}
      </section>
    </motion.div>
  );
}

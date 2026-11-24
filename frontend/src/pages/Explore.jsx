import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import ListingGrid from '../components/listings/ListingGrid';
import Button from '../components/ui/Button';

const CATEGORIES = [
  { label: 'All', value: '' },
  { label: '📷 Cameras', value: 'cameras' },
  { label: '🔧 Tools', value: 'tools' },
  { label: '🚲 Bikes', value: 'bikes' },
  { label: '⛺ Camping', value: 'camping' },
  { label: '💻 Electronics', value: 'electronics' },
  { label: '⚽ Sports', value: 'sports' },
  { label: '📚 Books', value: 'books' },
  { label: '🎉 Party', value: 'party' },
  { label: '📦 Other', value: 'other' },
];

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low → High', value: 'price_asc' },
  { label: 'Price: High → Low', value: 'price_desc' },
  { label: 'Top Rated', value: 'rating' },
];

const PAGE_LIMIT = 12;

export default function Explore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { get } = useApi();

  const [listings, setListings] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [loadMoreLoading, setLoadMoreLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Controlled filter state from URL
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');

  const buildParams = useCallback(
    (overrides = {}) => {
      const p = {
        q: overrides.q !== undefined ? overrides.q : q,
        category: overrides.category !== undefined ? overrides.category : category,
        minPrice: overrides.minPrice !== undefined ? overrides.minPrice : minPrice,
        maxPrice: overrides.maxPrice !== undefined ? overrides.maxPrice : maxPrice,
        sortBy: overrides.sortBy !== undefined ? overrides.sortBy : sortBy,
        page: overrides.page !== undefined ? overrides.page : 1,
        limit: PAGE_LIMIT,
      };
      return p;
    },
    [q, category, minPrice, maxPrice, sortBy]
  );

  const fetchListings = useCallback(
    async (params, append = false) => {
      if (append) setLoadMoreLoading(true);
      else setFetchLoading(true);

      try {
        const query = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v !== '' && v !== undefined) query.set(k, v); });
        const res = await get(`/listings?${query.toString()}`);
        const data = res.data?.listings || [];
        const totalCount = res.data?.total || 0;
        setTotal(totalCount);
        if (append) {
          setListings((prev) => [...prev, ...data]);
        } else {
          setListings(data);
        }
      } catch {
        // silent
      } finally {
        setFetchLoading(false);
        setLoadMoreLoading(false);
      }
    },
    [get]
  );

  // Initial fetch + URL sync
  useEffect(() => {
    const initQ = searchParams.get('q') || '';
    const initCat = searchParams.get('category') || '';
    const initMin = searchParams.get('minPrice') || '';
    const initMax = searchParams.get('maxPrice') || '';
    const initSort = searchParams.get('sortBy') || 'newest';

    setQ(initQ);
    setCategory(initCat);
    setMinPrice(initMin);
    setMaxPrice(initMax);
    setSortBy(initSort);
    setPage(1);

    fetchListings({ q: initQ, category: initCat, minPrice: initMin, maxPrice: initMax, sortBy: initSort, page: 1, limit: PAGE_LIMIT });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyFilters = (overrides = {}) => {
    const params = buildParams(overrides);
    setPage(1);

    // Update URL
    const urlParams = {};
    if (params.q) urlParams.q = params.q;
    if (params.category) urlParams.category = params.category;
    if (params.minPrice) urlParams.minPrice = params.minPrice;
    if (params.maxPrice) urlParams.maxPrice = params.maxPrice;
    if (params.sortBy && params.sortBy !== 'newest') urlParams.sortBy = params.sortBy;
    setSearchParams(urlParams);

    fetchListings(params);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const handleCategoryClick = (val) => {
    setCategory(val);
    applyFilters({ category: val });
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    applyFilters({ sortBy: val });
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchListings(buildParams({ page: nextPage }), true);
  };

  const clearFilters = () => {
    setQ('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
    setSearchParams({});
    fetchListings({ q: '', category: '', minPrice: '', maxPrice: '', sortBy: 'newest', page: 1, limit: PAGE_LIMIT });
  };

  const hasFilters = q || category || minPrice || maxPrice || sortBy !== 'newest';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 lg:p-6 max-w-6xl mx-auto"
    >
      <h1 className="text-2xl font-extrabold text-dark mb-4">Explore</h1>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="flex-1 flex items-center bg-white rounded-full border border-gray-200 px-4 py-2.5 gap-2 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">
          <Search size={18} className="text-muted flex-shrink-0" />
          <input
            type="text"
            placeholder="Search listings..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="flex-1 outline-none bg-transparent text-dark placeholder:text-muted text-sm"
          />
          {q && (
            <button type="button" onClick={() => { setQ(''); applyFilters({ q: '' }); }}>
              <X size={16} className="text-muted hover:text-dark" />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-full border transition-all ${showFilters ? 'bg-primary border-primary text-dark' : 'bg-white border-gray-200 text-muted hover:border-gray-300'}`}
          aria-label="Filters"
        >
          <SlidersHorizontal size={20} />
        </button>
        <Button type="submit" variant="primary" className="rounded-full px-5">
          Go
        </Button>
      </form>

      {/* Category chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        {CATEGORIES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => handleCategoryClick(value)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 border ${
              category === value
                ? 'bg-primary text-dark border-primary'
                : 'bg-white border-gray-200 text-muted hover:border-primary/50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4 flex flex-wrap gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Min Price (₹/day)</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary w-32"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Max Price (₹/day)</label>
            <input
              type="number"
              placeholder="Any"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary w-32"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary bg-white"
            >
              {SORT_OPTIONS.map(({ label, value }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end gap-2">
            <Button variant="primary" size="sm" onClick={() => applyFilters()}>Apply</Button>
            {hasFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>Clear</Button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      {!fetchLoading && (
        <p className="text-sm text-muted mb-4">
          {total} listing{total !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Listings grid */}
      <ListingGrid listings={listings} loading={fetchLoading} />

      {/* Load more */}
      {!fetchLoading && listings.length < total && (
        <div className="flex justify-center mt-8">
          <Button variant="secondary" loading={loadMoreLoading} onClick={handleLoadMore}>
            Load More
          </Button>
        </div>
      )}

      {/* Empty state */}
      {!fetchLoading && listings.length === 0 && (
        <div className="text-center py-16 text-muted">
          <p className="text-5xl mb-4">🔍</p>
          <p className="font-semibold text-dark text-lg">No listings found</p>
          <p className="text-sm mt-2">Try adjusting your filters or search term.</p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 text-sm text-primary font-semibold hover:underline">
              Clear all filters
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}

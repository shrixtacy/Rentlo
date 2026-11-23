import React from 'react';
import ListingCard from './ListingCard';
import Card from '../ui/Card';

function SkeletonCard() {
  return (
    <Card className="p-0 overflow-hidden animate-pulse">
      <div className="aspect-square bg-gray-200" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />
        <div className="flex items-center gap-2 mt-1">
          <div className="w-8 h-8 rounded-full bg-gray-200" />
          <div className="h-3 bg-gray-200 rounded w-20" />
        </div>
      </div>
    </Card>
  );
}

export default function ListingGrid({ listings = [], loading = false }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {loading
        ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        : listings.map((listing) => (
            <ListingCard key={listing._id} listing={listing} />
          ))}
    </div>
  );
}

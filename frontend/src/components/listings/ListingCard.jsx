import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Star } from 'lucide-react';
import Avatar from '../ui/Avatar';

export default function ListingCard({ listing }) {
  const navigate = useNavigate();

  if (!listing) return null;

  const {
    _id,
    images = [],
    category,
    title,
    pricePerDay,
    securityDeposit,
    location,
    owner,
    averageRating,
    totalReviews,
  } = listing;

  const imageSrc = images[0] || null;

  return (
    <div
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-200 hover:shadow-md"
      onClick={() => navigate(`/listings/${_id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/listings/${_id}`)}
    >
      {/* Image */}
      <div className="relative aspect-square bg-gray-100">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-sm">
            No Image
          </div>
        )}
        {category && (
          <span className="absolute top-2 left-2 bg-dark/70 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
            {category}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-3 flex flex-col gap-1.5">
        <h3 className="font-semibold text-dark text-sm leading-tight line-clamp-2">{title}</h3>

        <div className="flex items-baseline gap-1">
          <span className="text-primary font-bold text-base">₹{pricePerDay}</span>
          <span className="text-muted text-xs">/day</span>
        </div>

        {securityDeposit > 0 && (
          <p className="text-muted text-xs">Deposit: ₹{securityDeposit}</p>
        )}

        {location?.city && (
          <div className="flex items-center gap-1 text-muted text-xs">
            <MapPin size={12} />
            <span>{location.city}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-1">
          {owner && (
            <div className="flex items-center gap-1.5">
              <Avatar src={owner.avatar} name={owner.name} size="sm" />
              <span className="text-xs text-muted truncate max-w-[80px]">{owner.name}</span>
            </div>
          )}
          {averageRating > 0 && (
            <div className="flex items-center gap-0.5 text-xs text-muted ml-auto">
              <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span>{averageRating.toFixed(1)}</span>
              {totalReviews > 0 && <span>({totalReviews})</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

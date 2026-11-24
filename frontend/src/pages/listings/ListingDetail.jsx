import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { MapPin, Star, ChevronLeft, MessageCircle, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { useApi } from '../../hooks/useApi';
import api from '../../lib/api';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { get, post, loading } = useApi();

  const [listing, setListing] = useState(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [mainImage, setMainImage] = useState(0);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [availability, setAvailability] = useState(null);
  const [checkingAvail, setCheckingAvail] = useState(false);
  const [booking, setBooking] = useState(false);
  const [renterNote, setRenterNote] = useState('');

  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setPageLoading(true);
      try {
        const res = await get(`/listings/${id}`);
        setListing(res.data?.listing);
      } catch (err) {
        if (err.response?.status === 404) setNotFound(true);
      } finally {
        setPageLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const res = await get(`/reviews/listing/${id}`);
        setReviews(res.data?.reviews || []);
      } catch {
        // silent
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [id]);

  useEffect(() => {
    if (!startDate || !endDate || !id) return;
    if (new Date(endDate) <= new Date(startDate)) {
      setAvailability(null);
      return;
    }
    const checkAvailability = async () => {
      setCheckingAvail(true);
      try {
        const res = await get(`/listings/${id}/availability?startDate=${startDate}&endDate=${endDate}`);
        setAvailability(res.data);
      } catch {
        setAvailability(null);
        toast.error('Could not check availability');
      } finally {
        setCheckingAvail(false);
      }
    };
    checkAvailability();
  }, [startDate, endDate, id]);

  const handleChat = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await post(`/chat/conversations/${id}/start`, { recipientId: listing.owner._id });
      navigate(`/messages?conversation=${res.data.conversationId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start conversation');
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    setBooking(true);
    try {
      await post('/bookings', {
        listingId: id,
        startDate,
        endDate,
        renterNote,
      });
      toast.success('Booking request sent!');
      navigate('/rentals');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setBooking(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (notFound || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <p className="text-6xl">🔍</p>
        <h2 className="text-xl font-bold text-dark">Listing not found</h2>
        <p className="text-muted text-sm">This item may have been removed or doesn't exist.</p>
        <Button variant="primary" onClick={() => navigate('/explore')}>Browse Listings</Button>
      </div>
    );
  }

  const images = listing.images?.length ? listing.images : [];
  const isOwner = user?._id === (listing.owner?._id || listing.owner);
  const bookingReady = startDate && endDate && availability?.available;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-4xl mx-auto"
    >
      {/* Back button (mobile) */}
      <div className="lg:hidden px-4 pt-2 pb-0">
        <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-muted hover:text-dark text-sm transition-colors">
          <ChevronLeft size={18} />
          Back
        </button>
      </div>

      <div className="p-4 lg:p-6">
        {/* Image gallery */}
        <div className="mb-6">
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-2">
            {images.length > 0 ? (
              <img
                src={images[mainImage]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted text-sm">
                No image available
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setMainImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                    i === mainImage ? 'border-primary' : 'border-transparent'
                  }`}
                >
                  <img src={img} alt={`${listing.title} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="lg:grid lg:grid-cols-3 lg:gap-6">
          {/* Left: main info */}
          <div className="lg:col-span-2">
            {/* Title and category */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <h1 className="text-2xl font-bold text-dark">{listing.title}</h1>
              <Badge status={listing.status || 'AVAILABLE'} />
            </div>

            {listing.category && (
              <span className="inline-block bg-dark/10 text-dark text-xs font-medium px-3 py-1 rounded-full mb-3">
                {listing.category}
              </span>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-3xl font-extrabold text-primary">₹{listing.pricePerDay}</span>
              <span className="text-muted text-sm">/day</span>
            </div>
            {listing.securityDeposit > 0 && (
              <div className="flex items-center gap-1.5 text-muted text-sm mb-4">
                <Shield size={14} />
                <span>Refundable deposit: ₹{listing.securityDeposit}</span>
              </div>
            )}

            {/* Location */}
            {listing.location?.city && (
              <div className="flex items-center gap-1.5 text-muted text-sm mb-4">
                <MapPin size={14} />
                <span>{listing.location.city}{listing.location.state ? `, ${listing.location.state}` : ''}</span>
              </div>
            )}

            {/* Rating */}
            {listing.averageRating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <StarRating rating={listing.averageRating} />
                <span className="text-sm font-semibold text-dark">{listing.averageRating.toFixed(1)}</span>
                {listing.totalReviews > 0 && (
                  <span className="text-sm text-muted">({listing.totalReviews} reviews)</span>
                )}
              </div>
            )}

            {/* Description */}
            {listing.description && (
              <div className="mb-6">
                <h2 className="font-semibold text-dark mb-2">About this item</h2>
                <p className="text-muted text-sm leading-relaxed whitespace-pre-line">{listing.description}</p>
              </div>
            )}

            {/* Rules */}
            {listing.rules && (
              <div className="mb-6 bg-background rounded-2xl p-4">
                <h2 className="font-semibold text-dark mb-2">Rules & Guidelines</h2>
                <p className="text-muted text-sm leading-relaxed whitespace-pre-line">{listing.rules}</p>
              </div>
            )}

            {/* Owner card */}
            {listing.owner && (
              <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-3 mb-6 shadow-sm">
                <Avatar src={listing.owner.avatar} name={listing.owner.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-dark text-sm">{listing.owner.name}</p>
                  <p className="text-muted text-xs">Owner</p>
                </div>
                {!isOwner && (
                  <Button variant="secondary" size="sm" onClick={handleChat} loading={loading}>
                    <MessageCircle size={14} />
                    Chat
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Right: booking card */}
          <div className="lg:col-span-1">
            {!isOwner && (
              <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm sticky top-4">
                <h2 className="font-bold text-dark mb-4 flex items-center gap-2">
                  <Calendar size={16} />
                  Book this item
                </h2>

                <div className="flex flex-col gap-3 mb-4">
                  <div>
                    <label className="text-xs font-medium text-muted mb-1 block">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      min={today}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted mb-1 block">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || today}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>

                {checkingAvail && (
                  <div className="flex items-center justify-center py-3 text-muted text-sm gap-2">
                    <Spinner /> Checking availability...
                  </div>
                )}

                {availability && !checkingAvail && (
                  <div className="bg-background rounded-xl p-4 mb-4 text-sm">
                    {availability.available ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between text-muted">
                          <span>{availability.priceCalculation?.days} days × ₹{availability.priceCalculation?.dailyRate}</span>
                          <span>₹{availability.priceCalculation?.rentalFee}</span>
                        </div>
                        <div className="flex justify-between text-muted">
                          <span>Service fee</span>
                          <span>₹{availability.priceCalculation?.serviceFee}</span>
                        </div>
                        <div className="flex justify-between text-muted">
                          <span>Refundable deposit</span>
                          <span>₹{availability.priceCalculation?.refundableDeposit}</span>
                        </div>
                        <div className="flex justify-between font-bold text-dark border-t border-gray-200 pt-2 mt-1">
                          <span>Total payable</span>
                          <span>₹{availability.priceCalculation?.totalPayable}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-error font-medium">Not available for selected dates</p>
                    )}
                  </div>
                )}

                {availability?.available && (
                  <div className="mb-3">
                    <label className="text-xs font-medium text-muted mb-1 block">Note to owner (optional)</label>
                    <textarea
                      value={renterNote}
                      onChange={(e) => setRenterNote(e.target.value)}
                      placeholder="Any special requests..."
                      rows={2}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-primary resize-none"
                    />
                  </div>
                )}

                <Button
                  variant="primary"
                  size="lg"
                  disabled={!bookingReady}
                  loading={booking}
                  onClick={handleBooking}
                  className="w-full"
                >
                  Request to Rent
                </Button>

                {!isAuthenticated && (
                  <p className="text-xs text-muted text-center mt-2">
                    <button onClick={() => navigate('/login')} className="text-primary font-semibold">Sign in</button> to book
                  </p>
                )}
              </div>
            )}

            {isOwner && (
              <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 text-sm text-dark">
                <p className="font-semibold">This is your listing</p>
                <p className="text-muted text-xs mt-1">You cannot book your own item.</p>
              </div>
            )}
          </div>
        </div>

        {/* Reviews section */}
        <div className="mt-8">
          <h2 className="text-lg font-bold text-dark mb-4">
            Reviews {reviews.length > 0 && <span className="text-muted font-normal">({reviews.length})</span>}
          </h2>
          {reviewsLoading ? (
            <div className="flex justify-center py-6"><Spinner /></div>
          ) : reviews.length === 0 ? (
            <p className="text-muted text-sm">No reviews yet.</p>
          ) : (
            <div className="flex flex-col gap-4">
              {reviews.map((review) => (
                <div key={review._id} className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Avatar src={review.reviewer?.avatar} name={review.reviewer?.name} size="sm" />
                    <div>
                      <p className="font-semibold text-dark text-sm">{review.reviewer?.name}</p>
                      <p className="text-muted text-xs">
                        {review.createdAt ? format(new Date(review.createdAt), 'MMM d, yyyy') : ''}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <StarRating rating={review.rating} />
                    </div>
                  </div>
                  {review.comment && <p className="text-muted text-sm">{review.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

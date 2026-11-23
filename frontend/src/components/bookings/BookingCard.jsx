import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function BookingCard({ booking, onAction }) {
  const { user } = useAuth();

  if (!booking) return null;

  const {
    _id,
    listing,
    renter,
    owner,
    startDate,
    endDate,
    totalAmount,
    status,
  } = booking;

  const isOwner = user?._id === (owner?._id || owner);
  const isRenter = user?._id === (renter?._id || renter);

  const imageSrc = listing?.images?.[0] || null;

  const formatDate = (d) => {
    try { return format(new Date(d), 'dd MMM yyyy'); }
    catch { return d; }
  };

  const handleAction = (action) => onAction?.(_id, action);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex gap-4"
    >
      {/* Thumbnail */}
      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
        {imageSrc ? (
          <img src={imageSrc} alt={listing?.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted text-xs">No img</div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-dark text-sm leading-tight truncate">{listing?.title}</h3>
          <Badge status={status} />
        </div>

        <p className="text-muted text-xs mt-1">
          {formatDate(startDate)} – {formatDate(endDate)}
        </p>

        <p className="text-dark font-semibold text-sm mt-1">₹{totalAmount}</p>

        {/* Action buttons based on status + role */}
        <div className="flex flex-wrap gap-2 mt-3">
          {status === 'PENDING' && isOwner && (
            <>
              <Button size="sm" variant="primary" onClick={() => handleAction('approve')}>Approve</Button>
              <Button size="sm" variant="danger" onClick={() => handleAction('reject')}>Reject</Button>
            </>
          )}
          {status === 'APPROVED' && isRenter && (
            <Button size="sm" variant="primary" onClick={() => handleAction('pay')}>Pay Now</Button>
          )}
          {status === 'CONFIRMED' && isOwner && (
            <Button size="sm" variant="primary" onClick={() => handleAction('handover')}>Mark Handover</Button>
          )}
          {status === 'ACTIVE' && isOwner && (
            <Button size="sm" variant="primary" onClick={() => handleAction('return')}>Mark Return</Button>
          )}
          {status === 'RETURNED' && (isOwner || isRenter) && (
            <>
              <Button size="sm" variant="primary" onClick={() => handleAction('complete')}>Complete</Button>
              <Button size="sm" variant="secondary" onClick={() => handleAction('dispute')}>Raise Dispute</Button>
            </>
          )}
          {status === 'COMPLETED' && (
            <Button size="sm" variant="secondary" onClick={() => handleAction('review')}>Leave Review</Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

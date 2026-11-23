import React from 'react';

const statusClasses = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  ACTIVE: 'bg-primary/20 text-dark',
  RETURNED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-gray-100 text-gray-700',
  CANCELLED: 'bg-red-100 text-error',
  REJECTED: 'bg-red-100 text-error',
  DISPUTED: 'bg-orange-100 text-orange-800',
  AVAILABLE: 'bg-green-100 text-green-800',
  RENTED: 'bg-blue-100 text-blue-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  UNVERIFIED: 'bg-gray-100 text-gray-700',
  VERIFIED: 'bg-green-100 text-green-800',
};

export default function Badge({ status }) {
  const classes = statusClasses[status] || 'bg-gray-100 text-gray-700';
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${classes}`}>
      {status}
    </span>
  );
}

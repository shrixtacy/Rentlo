import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import api from '../lib/api';
import BookingCard from '../components/bookings/BookingCard';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const DISPUTE_REASONS = [
  'Item was damaged',
  'Item not returned on time',
  'Item not as described',
  'Payment issue',
  'Other',
];

export default function Rentals() {
  const navigate = useNavigate();
  const { get, patch, post, loading } = useApi();

  const [tab, setTab] = useState('renting');
  const [asRenter, setAsRenter] = useState([]);
  const [asOwner, setAsOwner] = useState([]);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Pay modal
  const [payModal, setPayModal] = useState(null); // { bookingId, amount }
  const [payLoading, setPayLoading] = useState(false);

  // Dispute modal
  const [disputeModal, setDisputeModal] = useState(null); // { bookingId }
  const [disputeReason, setDisputeReason] = useState('');
  const [disputeDesc, setDisputeDesc] = useState('');
  const [disputeAmount, setDisputeAmount] = useState('');
  const [disputeLoading, setDisputeLoading] = useState(false);

  // Review modal
  const [reviewModal, setReviewModal] = useState(null); // { bookingId, listingId }
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewHover, setReviewHover] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    setFetchLoading(true);
    try {
      const res = await get('/bookings/my');
      setAsRenter(res.data?.asRenter || []);
      setAsOwner(res.data?.asOwner || []);
    } catch {
      // silent
    } finally {
      setFetchLoading(false);
    }
  }, [get]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleAction = async (bookingId, action) => {
    // Find booking for context
    const allBookings = [...asRenter, ...asOwner];
    const booking = allBookings.find((b) => b._id === bookingId);

    if (action === 'pay') {
      setPayModal({ bookingId, amount: booking?.totalAmount });
      return;
    }
    if (action === 'dispute') {
      setDisputeModal({ bookingId, listingId: booking?.listing?._id });
      setDisputeReason('');
      setDisputeDesc('');
      setDisputeAmount('');
      return;
    }
    if (action === 'review') {
      setReviewModal({ bookingId, listingId: booking?.listing?._id });
      setReviewRating(0);
      setReviewComment('');
      return;
    }

    // Status-change actions
    const actionMap = {
      approve: 'APPROVE',
      reject: 'REJECT',
      complete: 'COMPLETE',
      cancel: 'CANCEL',
    };

    if (actionMap[action]) {
      try {
        await patch(`/bookings/${bookingId}/status`, { action: actionMap[action] });
        toast.success('Updated!');
        fetchBookings();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Action failed');
      }
      return;
    }

    if (action === 'handover') {
      try {
        await api.post(`/bookings/${bookingId}/handover`, new FormData());
        toast.success('Handover marked!');
        fetchBookings();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Handover failed');
      }
      return;
    }

    if (action === 'return') {
      try {
        const form = new FormData();
        form.append('condition', 'GOOD');
        await api.post(`/bookings/${bookingId}/return`, form);
        toast.success('Return marked!');
        fetchBookings();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Return failed');
      }
    }
  };

  const handlePayConfirm = async () => {
    if (!payModal) return;
    setPayLoading(true);
    try {
      // Create order
      const orderRes = await api.post('/payments/order', { bookingId: payModal.bookingId });
      const orderId = orderRes.data?.data?.orderId || orderRes.data?.data?.id || 'TEST_ORDER';

      // Mark as paid (test mode)
      await api.post('/payments/verify', {
        razorpay_order_id: orderId,
        razorpay_payment_id: 'pay_test_' + Date.now(),
        razorpay_signature: 'test_signature',
        bookingId: payModal.bookingId,
      });
      toast.success('Payment confirmed!');
      setPayModal(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    } finally {
      setPayLoading(false);
    }
  };

  const handleDisputeSubmit = async () => {
    if (!disputeModal) return;
    if (!disputeReason) { toast.error('Select a reason'); return; }
    if (!disputeDesc.trim()) { toast.error('Describe the issue'); return; }
    setDisputeLoading(true);
    try {
      await post('/disputes', {
        bookingId: disputeModal.bookingId,
        reason: disputeReason,
        description: disputeDesc,
        claimedDeduction: disputeAmount ? Number(disputeAmount) : 0,
      });
      toast.success('Dispute raised!');
      setDisputeModal(null);
      fetchBookings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to raise dispute');
    } finally {
      setDisputeLoading(false);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewModal) return;
    if (reviewRating === 0) { toast.error('Select a rating'); return; }
    setReviewLoading(true);
    try {
      await post('/reviews', {
        bookingId: reviewModal.bookingId,
        targetType: 'LISTING',
        targetId: reviewModal.listingId,
        rating: reviewRating,
        comment: reviewComment,
      });
      toast.success('Review submitted!');
      setReviewModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setReviewLoading(false);
    }
  };

  const currentList = tab === 'renting' ? asRenter : asOwner;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-4 lg:p-6 max-w-3xl mx-auto"
    >
      <h1 className="text-2xl font-extrabold text-dark mb-6">My Rentals</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setTab('renting')}
          className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 ${
            tab === 'renting' ? 'border-primary text-dark' : 'border-transparent text-muted hover:text-dark'
          }`}
        >
          Renting ({asRenter.length})
        </button>
        <button
          onClick={() => setTab('lending')}
          className={`px-5 py-2.5 text-sm font-semibold transition-all border-b-2 ${
            tab === 'lending' ? 'border-primary text-dark' : 'border-transparent text-muted hover:text-dark'
          }`}
        >
          Lending ({asOwner.length})
        </button>
      </div>

      {fetchLoading ? (
        <div className="flex justify-center py-16">
          <Spinner />
        </div>
      ) : currentList.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-5xl mb-4">{tab === 'renting' ? '📦' : '🏷️'}</p>
          <p className="font-semibold text-dark text-lg">No rentals yet</p>
          <p className="text-muted text-sm mt-2">
            {tab === 'renting' ? 'Start by browsing listings.' : 'List an item to start earning.'}
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(tab === 'renting' ? '/explore' : '/listings/create')}
            className="mt-4"
          >
            {tab === 'renting' ? 'Explore Listings' : 'List an Item'}
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {currentList.map((booking) => (
            <BookingCard key={booking._id} booking={booking} onAction={handleAction} />
          ))}
        </div>
      )}

      {/* Pay Modal */}
      <Modal isOpen={!!payModal} onClose={() => setPayModal(null)} title="Complete Payment">
        {payModal && (
          <div className="flex flex-col gap-4">
            <div className="bg-background rounded-2xl p-4 text-center">
              <p className="text-muted text-sm">Amount to pay</p>
              <p className="text-3xl font-extrabold text-primary mt-1">₹{payModal.amount}</p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 text-xs text-yellow-800">
              Test mode: Payment will be simulated. No real money is charged.
            </div>
            <Button variant="primary" size="lg" loading={payLoading} onClick={handlePayConfirm} className="w-full">
              Proceed to Pay ₹{payModal.amount}
            </Button>
            <Button variant="secondary" size="lg" onClick={() => setPayModal(null)} className="w-full">
              Cancel
            </Button>
          </div>
        )}
      </Modal>

      {/* Dispute Modal */}
      <Modal isOpen={!!disputeModal} onClose={() => setDisputeModal(null)} title="Raise a Dispute">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-dark">Reason</label>
            <select
              value={disputeReason}
              onChange={(e) => setDisputeReason(e.target.value)}
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary bg-white"
            >
              <option value="">Select a reason</option>
              {DISPUTE_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-dark">Description</label>
            <textarea
              value={disputeDesc}
              onChange={(e) => setDisputeDesc(e.target.value)}
              placeholder="Explain the issue in detail..."
              rows={3}
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary resize-none"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-dark">Claimed Deduction (₹)</label>
            <input
              type="number"
              value={disputeAmount}
              onChange={(e) => setDisputeAmount(e.target.value)}
              placeholder="0"
              min="0"
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary"
            />
          </div>
          <Button variant="danger" size="lg" loading={disputeLoading} onClick={handleDisputeSubmit} className="w-full">
            Submit Dispute
          </Button>
        </div>
      </Modal>

      {/* Review Modal */}
      <Modal isOpen={!!reviewModal} onClose={() => setReviewModal(null)} title="Leave a Review">
        <div className="flex flex-col gap-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setReviewHover(s)}
                onMouseLeave={() => setReviewHover(0)}
                onClick={() => setReviewRating(s)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  size={32}
                  className={`${s <= (reviewHover || reviewRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200 fill-gray-200'} transition-colors`}
                />
              </button>
            ))}
          </div>
          {reviewRating > 0 && (
            <p className="text-center text-sm text-muted">
              {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][reviewRating]}
            </p>
          )}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-dark">Comment (optional)</label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-primary resize-none"
            />
          </div>
          <Button variant="primary" size="lg" loading={reviewLoading} onClick={handleReviewSubmit} className="w-full">
            Submit Review
          </Button>
        </div>
      </Modal>
    </motion.div>
  );
}

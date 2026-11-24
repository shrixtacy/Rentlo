# Backend API Review – Rentlo

## Evidence Summary

All files in `backend/src/` were read directly. No tests were executed; evidence is from source only.

---

## Requirement-by-Requirement Findings

### 1. Controllers — all endpoints implemented and use `asyncHandler`

| Controller | Handlers | asyncHandler used |
|---|---|---|
| auth.controller.js | register, login, requestOTP, verifyOTP, getMe, logout | ✅ all |
| booking.controller.js | createBookingController, getBookingById, updateBookingStatusController, handoverInspection, returnInspection, getMyBookings | ✅ all |
| listing.controller.js | createListingController, getListings, getListingByIdController, updateListingController, deleteListingController, checkAvailabilityController | ✅ all |
| payment.controller.js | createOrder, verifyPaymentController, webhook | ✅ all |
| review.controller.js | submitReviewController, getListingReviewsController, getUserReviewsController | ✅ all |
| chat.controller.js | getConversationsController, getOrCreateConversationController, getMessagesController, sendMessageController, markRead | ✅ all |
| dispute.controller.js | raiseDisputeController, getDispute, resolveDisputeController | ✅ all |
| user.controller.js | getProfile, updateProfile, uploadAvatar, uploadKYC, getMyListings, getMyBookingsAsRenter, getMyBookingsAsOwner | ✅ all |

**PASS**

---

### 2. All routes mounted in routes/index.js at correct paths

`routes/index.js` mounts:
- `/auth` → auth.routes.js
- `/users` → user.routes.js
- `/listings` → listing.routes.js
- `/bookings` → booking.routes.js
- `/payments` → payment.routes.js
- `/reviews` → review.routes.js
- `/disputes` → dispute.routes.js
- `/chat` → chat.routes.js
- `/admin` → admin.routes.js

All route modules are present. **PASS**

---

### 3. auth.service.js — saltRounds 12, OTP hashed, OTP deleted after use

- `registerUser`: `bcrypt.hash(password, 12)` — ✅ saltRounds = 12
- `sendOTPEmail`: calls `hashOTP(otp)` which does `bcrypt.hash(otp, 10)` — ✅ OTP is hashed before storage
- `verifyOTPAndLogin`: calls `Otp.deleteOne({ _id: otpDoc._id })` after successful verification — ✅ OTP deleted after use

**PASS**

---

### 4. payment.service.js — graceful fallback when Razorpay not configured

`isRealRazorpay()` checks:
```js
const keyId = process.env.RAZORPAY_KEY_ID;
return keyId && keyId !== 'your_razorpay_key_id';
```
When false (key absent or equals `'your_razorpay_key_id'`), `createRazorpayOrder` falls back to `orderId = 'mock_order_' + Date.now()`.

The requirement also mentions checking for empty string — the `&&` short-circuit on falsy `keyId` covers empty string as well.

`razorpay.config.js` additionally guards `razorpayInstance` creation with the same condition, so no Razorpay SDK call is attempted when unconfigured.

**PASS**

---

### 5. booking.service.js — blocks/unblocks dates

- `createBooking`: after creating the booking, calls `Listing.findByIdAndUpdate(listingId, { $push: { blockedDates: { $each: newDates } } })` — ✅ dates blocked on creation
- `updateBookingStatus`: for `REJECTED` or `CANCELLED`, filters out the booking's dates from `listing.blockedDates` and saves — ✅ dates unblocked on rejection/cancellation

**PASS**

---

### 6. review.service.js — recalculates listing.avgRating after LISTING review

After upsert, if `targetType === 'LISTING'`:
```js
const agg = await Review.aggregate([...{ $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }]);
await Listing.findByIdAndUpdate(targetId, { avgRating: ..., reviewCount: ... });
```
**PASS**

---

### 7. chat.controller.js — emits 'message_received' via req.app.get('io')

`sendMessageController`:
```js
const io = req.app.get('io');
if (io) {
  io.to(req.params.conversationId).emit('message_received', message);
}
```
**PASS**

---

### 8. socket.js — handles join_conversation, send_message, typing, stop_typing

All four events are handled:
- `join_conversation` → `socket.join(conversationId)`
- `send_message` → `io.to(data.conversationId).emit('message_received', data)`
- `typing` → `socket.to(data.conversationId).emit('typing', data)`
- `stop_typing` → `socket.to(data.conversationId).emit('stop_typing', data)`

**PASS**

---

### 9. All files use ESM — no `require()`

Every file reviewed uses `import`/`export` syntax exclusively. No `require()` calls found.

**PASS**

---

### 10. Standard response envelope used throughout

`successResponse(res, statusCode, message, data)` returns `{ success, statusCode, message, data }` and is used consistently across all controllers. The `webhook` handler returns a plain `{ received: true }` which is a Razorpay protocol requirement, not a deviation.

**PASS**

---

### 11. Webhook route uses raw body parser

`app.js`:
```js
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
```
This is registered **before** `express.json()`, so the raw body is preserved for `/api/payments/webhook`. The route in `payment.routes.js` is `POST /webhook`, mounted under `/api/payments`, so the full path matches. **PASS**

---

### 12. Admin routes require 'admin' role

All three routes in `admin.routes.js` apply `verifyToken` followed by `requireRole('admin')`. The `resolveDispute` endpoint in `dispute.routes.js` also applies `requireRole('admin')`.

**PASS**

---

## Verdict

No blockers found. All twelve requirements are satisfied by the code as written.

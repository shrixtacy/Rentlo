# Backend Models, Configs, Utils & Middlewares — Review

**Scope:** `backend/src/configs/`, `backend/src/models/`, `backend/src/utils/`, `backend/src/middlewares/`

---

## Evidence Summary

All files were read directly. No build/test suite output was present, so findings are based on static analysis.  
`package.json` confirms `"type": "module"`, so all `import/export` syntax is valid ESM. No `require()` calls found anywhere in `src/`.

---

## Requirement-by-Requirement Findings

### 1. Mongoose models — fields, types, enums, defaults, refs

| Model | Assessment |
|---|---|
| `user.model.js` | All expected fields present: name, email (unique+lowercase), phone, passwordHash, role (enum+default), kycStatus (enum+default), kycDocUrl/Type/Number, avatar, address, location, isActive, createdAt |
| `listing.model.js` | All expected fields present: title, description, category (enum), pricePerDay, securityDeposit, itemValue, images, owner (ref User), location, rules, status (enum+default), availableDates, blockedDates, avgRating, reviewCount, createdAt |
| `booking.model.js` | All expected fields present with correct refs, full status enum, fee breakdown fields, handover/return photo arrays |
| `payment.model.js` | Booking ref, renter ref, Razorpay IDs, amount, currency default INR, status enum, breakdown sub-doc |
| `conversation.model.js` | participants (array ref User, min-2 validator), listing ref, lastMessage, lastMessageAt, createdAt; compound unique index |
| `message.model.js` | conversation/sender/receiver refs, listing ref, content, messageType enum, imageUrl, isRead default false, createdAt; compound index |
| `review.model.js` | booking/reviewer refs, targetType enum, targetId, rating (min 1 max 5), comment, createdAt; compound unique index |
| `dispute.model.js` | booking ref, raisedBy ref, reason enum, description, claimedDeduction, evidencePhotos, status enum+default, adminNotes, approvedDeduction, resolvedAt, createdAt |
| `otp.model.js` | email (indexed), otp, expiresAt, purpose enum |

**Result: PASS** — all models carry the documented fields.

---

### 2. 2dsphere indexes on location

- `user.model.js` line 29: `userSchema.index({ location: '2dsphere' })` ✓  
- `listing.model.js` line 34: `listingSchema.index({ location: '2dsphere' })` ✓

**Result: PASS**

---

### 3. OTP TTL index and bcrypt hashing

- `otp.model.js` line 10: `otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })` ✓  
- `otp.model.js` pre-save hook hashes `otp` with bcrypt(10) when modified ✓

**Result: PASS**

---

### 4. Utils exports

| File | Exported functions |
|---|---|
| `apiResponse.js` | `successResponse`, `errorResponse` ✓ |
| `asyncHandler.js` | `asyncHandler` ✓ |
| `generateToken.js` | `generateToken` ✓ |
| `generateOTP.js` | `generateOTP`, `hashOTP`, `verifyOTP` ✓ |

**Result: PASS**

---

### 5. auth.middleware.js exports

Exports `verifyToken`, `requireKYC`, `requireRole` — all present and correctly implemented.  
`requireKYC` and `requireRole` assume `req.user` is populated, so they must be called after `verifyToken`. That ordering constraint is correct by design.

**Result: PASS**

---

### 6. error.middleware.js error type coverage

| Error type | Handled |
|---|---|
| `ValidationError` | 400, field messages extracted ✓ |
| `CastError` | 400, "Invalid ID" ✓ |
| `JsonWebTokenError` / `TokenExpiredError` | 401 ✓ |
| Duplicate key (`err.code === 11000`) | 409, field name extracted from `keyValue` ✓ |
| Generic 500 | Fallback via `err.statusCode \|\| 500` ✓ |

**Result: PASS**

---

### 7. upload.middleware.js — 6 upload handlers

`uploadAvatar`, `uploadKYC`, `uploadListingImages`, `uploadHandoverPhotos`, `uploadReturnPhotos`, `uploadDisputeEvidence` — all six present.

**Result: PASS**

---

### 8. ESM only — no `require()`

`package.json` sets `"type": "module"`. All files use `import/export`. Grep across all `src/**/*.js` found zero `require()` calls.

**Result: PASS**

---

### 9. No raw passwords or OTPs stored

- `user.model.js`: field is named `passwordHash`; a pre-save hook bcrypt-hashes it (salt 12) whenever the field is modified. No `password` field exists on the schema. ✓  
- `otp.model.js`: pre-save hook bcrypt-hashes `otp` (salt 10) whenever modified. ✓  
- `generateOTP.js` exports `hashOTP`/`verifyOTP` for use in controllers (plain OTP never persisted directly when this utility is used through the model hook). ✓

**Note — double-hash risk (non-blocking, design-level observation):** `generateOTP.js` exports a standalone `hashOTP` function. If a controller pre-hashes the OTP before assigning it to `otp.otp` and then calls `save()`, the pre-save hook will hash it a second time, rendering OTP verification impossible. The correct usage is to assign the **plain** OTP to `otp.otp` and let the hook hash it, or to skip the hook and use `hashOTP` only outside the model (the hook also fires). Controllers are out of scope for this review pass, but the risk is present if callers misuse the API. No structural fix is required at the model/util layer itself — the concern applies solely to callers.

**Result: PASS** (models and utils are correct in isolation)

---

### 10. Standard response envelope `{ success, statusCode, message, data/errors }`

- `apiResponse.js` `successResponse`: `{ success: true, statusCode, message, data }` ✓  
- `apiResponse.js` `errorResponse`: `{ success: false, statusCode, message, errors }` ✓  
- `auth.middleware.js` inline 401/403 responses use the same shape ✓  
- `error.middleware.js` responses use the same shape ✓

**Result: PASS**

---

## Blockers

None.

---

## Verdict

**APPROVED** — all ten requirements are satisfied. No blocking issues found.

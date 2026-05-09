# TODO - Manual UPI Premium Payment Implementation

## Step 1: Backend - Multer + uploads static serving
- [ ] Add multer config to store screenshot uploads locally in `backend/uploads/upi/`
- [ ] Update `backend/server.js` to serve uploaded files (e.g. `/uploads`)

## Step 2: Backend - Payments API
- [x] Replace `backend/routes/paymentRoutes.js` with:
  - `POST /api/payments/submit`
  - `GET /api/payments/my-status`
- [x] Rewrite `backend/controllers/paymentController.js` to use MySQL:
  - `payments` table insert with status=pending
  - `my-status` query for current user (premium fields)

## Step 3: Backend - Admin APIs
- [ ] Update `backend/routes/adminRoutes.js` to include:
  - `GET /api/admin/payments` (pending only)
  - `POST /api/admin/payments/approve/:id`
  - `POST /api/admin/payments/reject/:id`
- [ ] Implement admin controller logic to approve/reject and update `users.is_premium`, `premium_plan`.

## Step 4: Remove Razorpay
- [ ] Remove Razorpay endpoints in routes
- [ ] Remove Razorpay require usage from controllers
- [ ] Remove Razorpay dependency from `backend/package.json`
- [ ] Remove Razorpay mention in frontend paywall/pricing

## Step 5: Frontend - Manual UPI Paywall popup/page
- [x] Replace Razorpay flow in `frontend/src/pages/Paywall.jsx`
  - Show UPI ID
  - Show QR code
  - Amount ₹50
  - UTR input
  - Screenshot upload
  - Submit button
- [x] Add API call to `POST /api/payments/submit` using multipart/form-data

## Step 6: Frontend - Premium access gating
- [ ] Update premium gating to use `user.is_premium === 1`
- [ ] Ensure `updateUserData` uses proper premium fields after submit/approve

## Step 7: Frontend - Admin panel
- [ ] Update `frontend/src/pages/AdminDashboard.jsx`:
  - Replace payments table with pending UPI submissions
  - Show screenshot + UTR + user email
  - Approve/Reject buttons

## Step 8: Wiring/verification
- [ ] Verify backend routes work with auth middleware
- [ ] Run backend + frontend tests (manual QA)
- [ ] Fix any runtime errors


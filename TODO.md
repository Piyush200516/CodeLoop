# TODO - Pending payment protection (manual UPI)

- [ ] Backend: Update `backend/controllers/paymentController.js`
  - [ ] In `submitPayment`, check for existing `payments` row with `status='pending'` for logged-in `user_id` before insert
  - [ ] If pending exists: return 409 `{ message: "Your payment proof is already submitted and pending verification." }`
  - [ ] Ensure no insert and no admin email is sent when pending exists
  - [ ] If user already premium: return 400 `{ message: "You already have premium access." }`
  - [ ] Keep amount validation at ₹30 and screenshot required

- [ ] Frontend: Update `frontend/src/pages/UpiPremiumPopup.jsx`
  - [ ] On popup open, call `GET /api/payments/my-status`
  - [ ] If pending: show pending message, disable submit, hide UTR + screenshot upload
  - [ ] If rejected: show rejected message, allow inputs and resubmit
  - [ ] If user is premium: close popup/unlock

- [ ] Verification
  - [ ] Start backend and test submit twice: second attempt returns 409
  - [ ] Open popup when pending: inputs hidden and submit disabled
  - [ ] Open popup when rejected: inputs visible and submit enabled


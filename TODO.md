# TODO - Token-based UPI admin approval

- [x] Inspect/adjust MySQL `payments` schema usage for required columns: `approval_token` and `reviewed_at`.
- [x] Update backend `submitPayment` to generate `approval_token`, save it, and email admin with approve/reject links.
- [x] Add public token-based endpoints:
  - [x] `GET /api/payments/email-approve/:token`
  - [x] `GET /api/payments/email-reject/:token`
- [x] Implement approve behavior:
  - [x] Update `payments.status='approved'`, `payments.approved_at=NOW()`
  - [x] Update `payments.reviewed_at = NOW()`
  - [x] Unlock premium in `users`
  - [x] Return required HTML success message
- [x] Implement reject behavior:
  - [x] Update `payments.status='rejected'`, `reviewed_at=NOW()`
  - [x] Return required HTML rejected message
- [x] Implement "Payment already processed" behavior for repeat clicks.
- [x] Update frontend `UpiPremiumPopup.jsx` to show: "Payment proof submitted. Admin will verify soon."
- [x] Run/verify backend start + sanity-check email HTML/link construction.




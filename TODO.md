# TODO

## Task: Fix register timeout causing duplicate user issue

- [x] Refactor `registerUser` to send OTP email **before** inserting the user into MySQL.
- [x] Ensure failure to send OTP returns proper error response and does not create/leave a partially-created user.
- [ ] Add defensive cleanup/rollback if insertion happens before email for any reason.
- [x] Update frontend axios instance timeout to **30000ms**.
- [x] Verify Register page disables Create Account button while loading (no duplicate requests).
- [x] Ensure login/JWT flow remains unchanged.
- [ ] Run quick sanity checks (lint/tests or manual verification steps).



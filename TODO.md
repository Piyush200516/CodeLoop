# TODO - Fix Authentication System (Google OAuth only)

## Step 1 — Frontend: Remove Auth0 completely
- [ ] Remove `@auth0/auth0-react` usage from `frontend/src/main.jsx` (delete Auth0Provider wrapper + env checks)
- [ ] Remove `Auth0LoginButton` from `frontend/src/pages/Login.jsx`
- [ ] Remove `frontend/src/pages/Auth0LoginButton.jsx` (or replace file with Google button)
- [ ] Remove Auth0 env vars usage (`VITE_AUTH0_DOMAIN`, `VITE_AUTH0_CLIENT_ID`) from frontend code
- [ ] Update `frontend/package.json`: remove `@auth0/auth0-react`

## Step 2 — Frontend: Restore Google OAuth
- [ ] Ensure `@react-oauth/google` is installed
- [ ] Update `frontend/src/main.jsx` to wrap app with `GoogleOAuthProvider` using `VITE_GOOGLE_CLIENT_ID`
- [ ] Implement Google login button in `frontend/src/pages/Login.jsx` using `@react-oauth/google`

## Step 3 — Backend: Add Google OAuth endpoint (Option A)
- [ ] Add route `POST /api/auth/google`
- [ ] Implement controller to upsert user by Google email/profile and return your existing JWT

## Step 4 — Bridge frontend ↔ backend for Google login
- [ ] On Google success, call `/api/auth/google`
- [ ] Store returned JWT in existing `AuthContext` via `login()`

## Step 5 — Build & validate
- [ ] Run `frontend npm run build`
- [ ] Fix any OAuth provider wrapping / origin / redirect URI errors

## Step 6 — Deployment checklist
- [ ] Confirm Vercel origin is in Google Cloud Console:
  - [ ] Authorized JS Origins: https://code-loop-eta.vercel.app and http://localhost:5173
  - [ ] Authorized Redirect URIs: https://code-loop-eta.vercel.app and http://localhost:5173
- [ ] Confirm Vercel env vars include `VITE_GOOGLE_CLIENT_ID` and `VITE_API_URL`


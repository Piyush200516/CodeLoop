# Frontend Fix Progress

## Planned Steps
- [ ] 1. Understand issue (Auth0Provider wrapping + missing env)
- [ ] 2. Inspect current Auth0 usage in main.jsx and Login.jsx
- [ ] 3. Update frontend/src/main.jsx to wrap entire app in Auth0Provider when env exists; otherwise render app without Auth0Provider
- [ ] 4. Update frontend/src/pages/Login.jsx to remove old Google OAuth code and correctly use useAuth0 only when wrapped; hide/disable Auth0 button when env missing
- [ ] 5. Add frontend/.env with required AUTH0 variables
- [ ] 6. Run `npm run build` and fix any build/runtime errors
- [ ] 7. Verify: no Auth0Provider wrapping error and no missing VITE_AUTH0_CLIENT_ID/domain console errors


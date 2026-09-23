# Repair Google authentication

## Scope
- Keep email/password authentication unchanged.
- Use the native authentication client for Google sign-in on both sign-in and sign-up pages.
- Harden the public callback page to exchange the authorization code, verify the authenticated user, preserve only safe same-origin return paths, and present clear retry errors.
- Confirm the callback route remains outside protected pages.

## Verification
- Inspect the connected Google provider and redirect allow-list without reading or changing secrets.
- Run the project typecheck, lint, and build commands.
- Browser-test sign-in, safe return-path handling, and the Google redirect through the real provider boundary.
- Report any external provider configuration blocker exactly, without claiming full success unless the callback completes.

## Technical details
- OAuth redirects use `${window.location.origin}/auth/callback`.
- Return paths must be relative, same-origin paths and must not point back into authentication pages.
- Callback processing will explicitly handle `?code=`, existing sessions, provider errors, timeout, and retry navigation.

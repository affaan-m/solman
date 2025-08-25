# API Surface (Phase 1)

Auth via Privy; server actions verify session.

Public
- GET /api/packs
- POST /api/packs/:id/open
- GET /api/inventory
- GET /api/live/recent

Marketplace
- POST /api/listings
- POST /api/listings/:id/bids
- POST /api/listings/:id/buy
- POST /api/listings/:id/accept-house

Referrals
- GET /api/referral/code
- POST /api/referral/code
- GET /api/referral/stats
- POST /api/referral/track-visit

Profiles
- GET/POST /api/profile

Admin
- /api/admin/packs (CRUD)
- /api/admin/referrals/config
- /api/admin/referrals/flags
- /api/admin/referrals/stats

Responses are JSON; all POSTs CSRF-protected; authenticated endpoints require session.

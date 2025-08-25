feat: Phase 1 MVP scaffold — docs, Next.js app, referral middleware/API stubs, DB schema

Summary
- Initialize monorepo scaffold:
  - apps/web: Next.js 14 TS (App Router), Tailwind, shadcn/ui-ready, Framer Motion
  - packages/db: Supabase SQL migrations (0001_init.sql) and README
  - docs: architecture, referrals (priority), api, schema, ops, risks, SETUP
  - README with overview and links to docs
- Referral MVP groundwork:
  - /r/:code middleware sets signed referral cookie
  - Referral dashboard page
  - API stubs: GET/POST /api/referral/code, GET /api/referral/stats, POST /api/referral/track-visit
- Packs & provably-fair skeleton:
  - GET /api/packs
  - POST /api/packs/[id]/open — commit–reveal stub using HMAC(server_seed, client_seed:nonce)
- Live feed:
  - /api/live/recent placeholder; Supabase Realtime planned for ticker
- Build verified:
  - Local Next.js prod build succeeded

Notes
- CI workflow file was removed from this initial push because GitHub blocked workflow creation via our current OAuth scope (“refusing to allow an OAuth App to create or update workflow .github/workflows/ci.yml without workflow scope”). Once workflow scope is granted, I’ll add CI to run install, typecheck, lint, build, and SQL validation.

Setup
- See docs/SETUP.md and apps/web/.env.example for environment variables (Privy, Supabase, referral cookie secret, device hash pepper).
- Run: npm install --workspaces && npm run -w apps/web dev

Link to Devin run
https://app.devin.ai/sessions/28f723543c0c42e0b05034b3df27b55b

Requested by
Affaan Mustafa (@affaan-m)

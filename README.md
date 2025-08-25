# Solman.gg

Solana-based case opening and marketplace platform for CS skins. This repository contains the Phase 1 MVP monorepo scaffold.

- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind + shadcn/ui
- Backend: Next.js API routes and Server Actions
- Data: Supabase Postgres (RLS), Realtime, Storage
- Auth/Wallet: Privy (embedded Solana wallets + onramp)
- Realtime: Supabase Realtime for recent pulls feed

See docs for the full architecture and specs.

- docs/architecture.md
- docs/referrals.md
- docs/api.md
- docs/schema.sql
- docs/ops.md
- docs/risks.md

Monorepo structure:
- apps/web: Next.js app
- packages/db: SQL schema and migrations
- apps/workers: cron tasks (placeholders)

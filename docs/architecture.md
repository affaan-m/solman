# Solman.gg Phase 1 Architecture

Stack
- Frontend: Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui, Framer Motion
- Backend: Next.js API routes + Server Actions
- Data: Supabase Postgres (RLS), Realtime, Storage
- Auth/Wallet: Privy (embedded Solana) and onramp to USDC on Solana
- Solana: @solana/web3.js, @solana/spl-token, Helius RPC/webhooks
- Observability: Sentry, PostHog
- Jobs/Cron: Vercel Cron (leaderboards, referral payouts)

Provably fair RNG
- Commit–reveal model using server_seed hash commit and client_seed + nonce reveal.
- Outcome derived from HMAC(server_seed, client_seed:nonce) mapped to cumulative probability table.
- Seeds and results stored for verification.

Core services
- Pack opening: server computes deterministic outcome with stored seeds; creates inventory; publishes recent pull.
- Marketplace: listings with house autobid at 90% of admin valuation; buy now; sell-back shortcut.
- Referral program: unique codes, first-touch attribution, points-only rewards in MVP, anti-abuse heuristics.
- Points and leaderboards: append-only points ledger; periodic snapshots.

Security/Compliance
- Age gating, region geofencing, KYC flags for withdrawals.
- RLS across user-owned tables.
- No secrets in client bundle; all sensitive conf via env.

Monorepo
- apps/web: Next.js app (app router)
- packages/db: SQL schema and migrations
- apps/workers: cron handlers (daily snapshots etc.)

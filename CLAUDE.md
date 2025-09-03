# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Solman.gg - Solana-based case opening and marketplace platform for CS skins. Phase 1 MVP monorepo scaffold.

## Development Commands

From repository root:
```bash
# Install dependencies (uses npm workspaces)
npm install

# Development server (runs Next.js)
npm -w apps/web run dev

# Build production
npm run build
# or directly:
npm -w apps/web run build

# Type checking
npm run typecheck
# or directly:
npm -w apps/web run typecheck

# Linting
npm run lint
# or directly:
npm -w apps/web run lint

# Production start
npm -w apps/web run start
```

## Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Next.js API routes + Server Actions
- **Database**: Supabase Postgres with Row Level Security (RLS)
- **Real-time**: Supabase Realtime for recent pulls feed
- **Auth/Wallet**: Privy for embedded Solana wallets + USDC onramp
- **Blockchain**: Solana (@solana/web3.js, @solana/spl-token), Helius RPC/webhooks

### Monorepo Structure
```
solman/
├── apps/
│   └── web/          # Next.js application (App Router)
│       ├── app/      # App router pages and API routes
│       ├── data/     # Static JSON data (items.json, packs.json)
│       └── lib/      # Core utilities (supabaseClient, constants, etc.)
├── packages/         # Shared packages (currently placeholder)
└── docs/            # Architecture and specification documents
```

### Key API Routes

All API routes under `/api/`:
- **Pack Operations**: `/packs`, `/packs/[id]/open`
- **Items**: `/items`
- **Live Feed**: `/live/recent`
- **Referrals**: `/referral/code`, `/referral/stats`, `/referral/track-visit`
- **Profile**: `/profile`
- **Admin**: Various admin endpoints (packs CRUD, referral config/stats)

### Core Services

1. **Provably Fair RNG**: Commit-reveal model using server_seed hash commit and client_seed + nonce reveal
2. **Pack Opening**: Server computes deterministic outcome with stored seeds, creates inventory, publishes to feed
3. **Marketplace**: Listings with house autobid at 90% of admin valuation, buy now functionality
4. **Referral System**: Unique codes, first-touch attribution (30-day window), points-based rewards, anti-abuse heuristics

### Database Schema

Key tables (PostgreSQL with custom enums):
- `users`: Core user data with Privy and wallet integration
- `packs`: Pack definitions with rarity and pricing
- `pack_items`: Items that can drop from packs with cumulative probabilities
- `pack_opens`: Records of all pack openings with provably fair seeds
- `inventory`: User-owned items with state management
- `marketplace_listings`: Active marketplace listings
- `referral_*`: Suite of tables for referral tracking and rewards
- `points_ledger`: Append-only points tracking

### Security & Compliance
- Age gating and region geofencing
- KYC flags for withdrawals
- Row Level Security (RLS) across user-owned tables
- No secrets in client bundle (all via environment variables)
- CSRF protection on all POST endpoints
- HttpOnly cookies for referral tracking

### Environment Variables Required

Key environment variables (apps/web):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `REFERRAL_COOKIE_SECRET`
- `DEVICE_HASH_PEPPER`
- `PRIVY_APP_ID`
- `PRIVY_APP_SECRET`
- `NEXT_PUBLIC_LIVE_FEED_CHANNEL=recent_pulls`

### TypeScript Configuration

Strict TypeScript with:
- Path alias: `@/*` maps to `apps/web/*`
- Target: ES2022
- Module: ESNext with Bundler resolution
- JSX preservation for Next.js

## Critical Code Patterns

### File Modification Rules
- **ALWAYS EDIT, NEVER RECREATE**: Use Edit/MultiEdit on existing files instead of Write
- **NO DUPLICATE FILES**: If functionality overlaps, modify the existing file
- **PREVENT CASCADE**: Avoid changes that require updating multiple imports
- **MINIMIZE CODE**: Remove unnecessary abstractions, prefer direct implementation

### API Route Pattern
All API routes return JSON with consistent error handling:
```typescript
// apps/web/app/api/[route]/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET/POST(req: NextRequest) {
  // Direct implementation, no unnecessary abstractions
  return NextResponse.json(data);
}
```

### Static Data Loading
Pack and item data loaded from JSON files:
```typescript
import packs from "@/data/packs.json";
import items from "@/data/items.json";
```

### Provably Fair RNG Implementation
Located in `/api/packs/[id]/open/route.ts`:
- Uses HMAC-SHA256 for deterministic outcomes
- Commit-reveal with server_seed_hash
- Roll calculation: `hmacToRoll(serverSeed, clientSeed, nonce)`
- EV-based probability using `evSampler.ts` utilities

### Referral Cookie Handling
Middleware intercepts `/r/:code` routes:
- Signs payload with secret
- Sets HttpOnly cookie `sm_ref`
- 30-day expiration
- Tracked in `referral_visits` table

### Component Structure
Pages use direct implementation without excessive components:
- Layout in `app/layout.tsx` with nav
- Pages as simple server/client components
- Tailwind for all styling (no separate CSS files)

### Database Access Pattern
Currently using static JSON, future Supabase integration:
- RLS policies for user data
- Append-only for points_ledger
- Enum types defined in schema.sql

### Security Constants
Centralized in `lib/constants.ts`:
- Cookie names and expiration
- Hash peppers and secrets from env
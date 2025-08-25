# Ops and Environment

Services
- Vercel (apps/web)
- Supabase (Postgres, Realtime, Storage)
- Privy (Auth, embedded Solana wallets)
- Helius (RPC/webhooks) later

Env vars (apps/web .env.example)
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- PRIVY_APP_ID
- PRIVY_APP_SECRET
- REFERRAL_COOKIE_SECRET
- DEVICE_HASH_PEPPER
- NEXT_PUBLIC_LIVE_FEED_CHANNEL=recent_pulls

Cron
- Daily leaderboards snapshot
- Optional referral window cleanup

Logging/Monitoring
- Sentry DSN
- PostHog API key

Security
- Signed HttpOnly cookies
- CSRF on POST
- Supabase RLS policies

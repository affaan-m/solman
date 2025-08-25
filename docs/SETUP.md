# Setup

Requirements
- Node.js 20+
- Supabase project (URL + anon key + service role key)
- Privy app (APP_ID + APP_SECRET)

Steps
1. Clone repo and install
   - npm install --workspaces

2. Configure environment
   - Copy apps/web/.env.example to apps/web/.env.local and fill values:
     - NEXT_PUBLIC_SUPABASE_URL
     - NEXT_PUBLIC_SUPABASE_ANON_KEY
     - SUPABASE_SERVICE_ROLE_KEY
     - NEXT_PUBLIC_PRIVY_APP_ID
     - PRIVY_APP_ID
     - PRIVY_APP_SECRET
     - REFERRAL_COOKIE_SECRET
     - DEVICE_HASH_PEPPER

3. Database
   - Use docs/schema.sql in your Supabase SQL editor to create tables.
   - Optionally run packages/db/migrations/0001_init.sql if your tooling supports it.

4. Run the web app
   - cd apps/web
   - npm run dev
   - Visit http://localhost:3000
   - Test referral cookie: open http://localhost:3000/r/testcode then visit /referrals

Notes
- CI workflow is omitted in the first push due to GitHub OAuth workflow scope. We’ll add it after enabling the correct permission.
- No secrets are committed. Use local env files or Vercel project envs for deployments.

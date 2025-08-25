# Referral Program Specification (MVP Priority)

Goals
- Drive growth with measurable, fraud-resistant attribution.
- Reward referrers primarily with points in MVP.

Attribution model
- First-touch, 30-day window via /r/:code and signed HttpOnly cookie.
- Bind at first login if user has no referrer; set users.referred_by_user_id and write referral_attributions row.
- Manual admin override permitted once per user with audit.

Rewards (MVP defaults)
- first_purchase_points_per_usd: 10
- spend_share_rate_points: 2% of referred user’s pack spend within 30 days
- daily_cap_points_per_referrer: 2000
- USDC bonus: disabled in MVP

Data model
- users(id, referral_code, referred_by_user_id, referral_bound_at, ...)
- referral_codes(id, user_id, code, active)
- referral_visits(id, code, referring_user_id, utm_source, utm_campaign, ip_hash, ua_hash, device_fingerprint_hash, first_seen_at)
- referral_attributions(id, referred_user_id unique, referring_user_id, code, bound_at, method, ip_hash, ua_hash, device_fingerprint_hash)
- referral_rewards(id, referring_user_id, referred_user_id, event_type, points_awarded, usdc_awarded_cents, cap_group, created_at, event_id)
- points_ledger(id, user_id, delta_points, reason, event_id, created_at)

Endpoints
- GET /api/referral/code
- POST /api/referral/code
- GET /api/referral/stats
- POST /api/referral/track-visit
- Admin: GET/POST /api/admin/referrals/config, GET /api/admin/referrals/flags, GET /api/admin/referrals/stats

Anti-abuse
- Hash IP and UA; device fingerprint hash with server-side pepper.
- Block attribution if fingerprint or wallet matches referrer.
- Visit rate limiting; cap enforcement on rewards; hold/withhold until thresholds or KYC for any monetary bonuses.

Analytics
- PostHog events: referral_visit, referral_bind, referral_reward_first_purchase, referral_reward_spend_share.
- /api/referral/stats aggregates for dashboard.

UX
- /r/:code landing sets cookie and redirects.
- /referrals dashboard shows code, copy, stats, chart.

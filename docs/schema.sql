
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

do $$
begin
  create type rarity_t as enum ('mil_spec','restricted','classified','covert','legendary');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type inv_state_t as enum ('owned','listed','sold','withdrawn','reserved');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type listing_status_t as enum ('active','sold','cancelled');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type bid_status_t as enum ('active','accepted','cancelled','expired');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type leaderboard_period_t as enum ('daily','weekly','monthly');
exception when duplicate_object then null;
end $$;

do $$
begin
  create type referral_event_t as enum ('first_deposit','first_purchase','spend_share');
exception when duplicate_object then null;
end $$;

create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  created_at timestamptz not null default now(),
  username text,
  privy_user_id text,
  wallet_pubkey text,
  steam_id text,
  x_handle text,
  cs_trade_url text,
  referred_by_user_id uuid references users(id),
  referral_code text unique,
  referral_bound_at timestamptz,
  kyc_status text,
  region_code text,
  age_confirmed boolean default false
);

create table if not exists wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  chain text not null,
  pubkey text not null,
  type text not null,
  created_at timestamptz not null default now()
);

create table if not exists ledger_transactions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  type text not null,
  token text not null,
  amount_cents integer not null,
  onchain_sig text,
  balance_after_cents integer,
  meta jsonb,
  created_at timestamptz not null default now()
);

create table if not exists packs (
  id uuid primary key default uuid_generate_v4(),
  slug text unique,
  name text not null,
  price_cents integer not null,
  status text not null default 'active',
  odds_config_json jsonb not null,
  server_seed_hash_current text,
  art_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists item_templates (
  id uuid primary key default uuid_generate_v4(),
  slug text unique,
  name text not null,
  rarity rarity_t not null,
  est_value_cents integer not null,
  art_url text,
  family text,
  created_at timestamptz not null default now()
);

create table if not exists pack_openings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  pack_id uuid references packs(id) not null,
  client_seed text not null,
  nonce integer not null,
  server_seed_revealed text,
  outcome_roll numeric,
  item_template_id uuid references item_templates(id),
  value_cents integer,
  created_at timestamptz not null default now(),
  verify_url text
);

create table if not exists inventory (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  item_template_id uuid references item_templates(id) not null,
  state inv_state_t not null default 'owned',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists listings (
  id uuid primary key default uuid_generate_v4(),
  inventory_id uuid references inventory(id) not null,
  seller_id uuid references users(id) not null,
  price_cents integer not null,
  status listing_status_t not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists bids (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid references listings(id) not null,
  bidder_id uuid references users(id) not null,
  price_cents integer not null,
  is_house boolean not null default false,
  status bid_status_t not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists points_ledger (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  delta_points integer not null,
  reason text not null,
  event_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists leaderboards (
  id uuid primary key default uuid_generate_v4(),
  period leaderboard_period_t not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  snapshot_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists achievements (
  id uuid primary key default uuid_generate_v4(),
  slug text unique,
  title text not null,
  description text,
  points_reward integer not null,
  criteria_json jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists user_achievements (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  achievement_id uuid references achievements(id) not null,
  unlocked_at timestamptz not null default now()
);

create table if not exists referral_codes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id) not null,
  code text unique not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists referral_visits (
  id uuid primary key default uuid_generate_v4(),
  code text not null,
  referring_user_id uuid references users(id),
  utm_source text,
  utm_campaign text,
  ip_hash text,
  ua_hash text,
  device_fingerprint_hash text,
  first_seen_at timestamptz not null default now()
);

create table if not exists referral_attributions (
  id uuid primary key default uuid_generate_v4(),
  referred_user_id uuid unique references users(id) not null,
  referring_user_id uuid references users(id) not null,
  code text not null,
  bound_at timestamptz not null default now(),
  method text not null,
  ip_hash text,
  ua_hash text,
  device_fingerprint_hash text
);

create table if not exists referral_rewards (
  id uuid primary key default uuid_generate_v4(),
  referring_user_id uuid references users(id) not null,
  referred_user_id uuid references users(id) not null,
  event_type referral_event_t not null,
  points_awarded integer not null default 0,
  usdc_awarded_cents integer not null default 0,
  cap_group text,
  created_at timestamptz not null default now(),
  event_id uuid
);

create table if not exists admin_valuations (
  id uuid primary key default uuid_generate_v4(),
  item_template_id uuid references item_templates(id) not null,
  valuation_cents integer not null,
  effective_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists flagged_events (
  id uuid primary key default uuid_generate_v4(),
  type text not null,
  subject_id uuid,
  reason text,
  meta jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_users_referral_code on users(referral_code);
create index if not exists idx_ref_visits_code on referral_visits(code);
create index if not exists idx_ref_rewards_referrer on referral_rewards(referring_user_id);
create index if not exists idx_points_user on points_ledger(user_id);
create index if not exists idx_inventory_user on inventory(user_id);

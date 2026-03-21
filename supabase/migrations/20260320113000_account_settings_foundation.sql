create type public.notification_frequency as enum (
  'instant',
  'daily_digest',
  'weekly_digest',
  'off'
);

create type public.privacy_request_type as enum (
  'export',
  'delete'
);

create type public.privacy_request_status as enum (
  'pending',
  'processing',
  'completed',
  'rejected',
  'cancelled'
);

create table public.user_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  display_name text,
  username text unique,
  headline text,
  bio text,
  avatar_path text,
  cover_image_path text,
  contact_email text,
  contact_phone text,
  contact_website text,
  share_slug text unique,
  share_token uuid,
  share_link_enabled boolean not null default false,
  is_public boolean not null default false,
  is_discoverable boolean not null default false,
  noindex boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.user_preferences (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  theme text not null default 'system',
  timezone text not null default 'UTC',
  language text not null default 'en',
  email_digest_frequency public.notification_frequency not null default 'daily_digest',
  dashboard_layout text not null default 'cinematic-ops',
  onboarding_hints_enabled boolean not null default true,
  reduced_motion boolean not null default false,
  high_contrast boolean not null default false,
  subtitles_enabled boolean not null default true,
  last_reauthenticated_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.user_notification_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  topic text not null,
  in_app_enabled boolean not null default true,
  email_enabled boolean not null default false,
  sms_enabled boolean not null default false,
  push_enabled boolean not null default false,
  frequency public.notification_frequency not null default 'daily_digest',
  quiet_hours_start time,
  quiet_hours_end time,
  timezone text not null default 'UTC',
  transactional_locked boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, topic)
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null,
  permission_state text not null default 'default',
  device_label text,
  browser_name text,
  platform_name text,
  subscription_json jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  last_seen_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, endpoint)
);

create table public.user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  session_token_hash text not null,
  session_label text,
  browser text,
  os text,
  ip_address text,
  approximate_location text,
  trusted boolean not null default false,
  revoked_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  last_active_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, session_token_hash)
);

create table public.user_passkeys (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  label text,
  credential_id text unique,
  credential_public_key text,
  transports text[] default '{}',
  counter bigint not null default 0,
  aaguid text,
  backed_up boolean not null default false,
  registration_status text not null default 'pending',
  last_used_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.user_privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  request_type public.privacy_request_type not null,
  status public.privacy_request_status not null default 'pending',
  requested_export_first boolean not null default false,
  status_detail text,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete cascade,
  event_type text not null,
  entity_type text not null,
  entity_id uuid,
  ip_address text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index user_notification_preferences_user_topic_idx
  on public.user_notification_preferences (user_id, topic);
create index push_subscriptions_user_idx on public.push_subscriptions (user_id, created_at desc);
create index user_sessions_user_idx on public.user_sessions (user_id, last_active_at desc);
create index user_sessions_token_idx on public.user_sessions (session_token_hash);
create index user_passkeys_user_idx on public.user_passkeys (user_id, created_at desc);
create index user_privacy_requests_user_idx on public.user_privacy_requests (user_id, created_at desc);
create index audit_events_user_event_idx on public.audit_events (user_id, event_type, created_at desc);

create trigger set_user_profiles_updated_at
before update on public.user_profiles
for each row
execute function public.handle_updated_at();

create trigger set_user_preferences_updated_at
before update on public.user_preferences
for each row
execute function public.handle_updated_at();

create trigger set_user_notification_preferences_updated_at
before update on public.user_notification_preferences
for each row
execute function public.handle_updated_at();

create trigger set_push_subscriptions_updated_at
before update on public.push_subscriptions
for each row
execute function public.handle_updated_at();

create trigger set_user_sessions_updated_at
before update on public.user_sessions
for each row
execute function public.handle_updated_at();

create trigger set_user_passkeys_updated_at
before update on public.user_passkeys
for each row
execute function public.handle_updated_at();

create trigger set_user_privacy_requests_updated_at
before update on public.user_privacy_requests
for each row
execute function public.handle_updated_at();

create or replace function public.ensure_default_notification_preferences(target_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_notification_preferences (
    user_id,
    topic,
    in_app_enabled,
    email_enabled,
    sms_enabled,
    push_enabled,
    frequency,
    transactional_locked,
    timezone
  )
  values
    (target_user_id, 'security', true, true, false, false, 'instant', true, 'UTC'),
    (target_user_id, 'account', true, true, false, false, 'instant', true, 'UTC'),
    (target_user_id, 'billing', true, true, false, false, 'daily_digest', true, 'UTC'),
    (target_user_id, 'reminders', true, false, false, false, 'daily_digest', false, 'UTC'),
    (target_user_id, 'messages', true, true, false, false, 'instant', false, 'UTC'),
    (target_user_id, 'mentions', true, true, false, false, 'instant', false, 'UTC'),
    (target_user_id, 'comments', true, false, false, false, 'daily_digest', false, 'UTC'),
    (target_user_id, 'product', true, true, false, false, 'weekly_digest', false, 'UTC'),
    (target_user_id, 'marketing', false, false, false, false, 'off', false, 'UTC')
  on conflict (user_id, topic) do nothing;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), '')
  )
  on conflict (id) do nothing;

  insert into public.user_profiles (user_id, display_name, contact_email)
  values (
    new.id,
    nullif(trim(coalesce(new.raw_user_meta_data ->> 'full_name', '')), ''),
    new.email
  )
  on conflict (user_id) do nothing;

  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  perform public.ensure_default_notification_preferences(new.id);

  return new;
end;
$$;

insert into public.user_profiles (user_id, display_name, contact_email)
select
  profiles.id,
  coalesce(nullif(trim(profiles.full_name), ''), split_part(coalesce(auth_users.email, ''), '@', 1)),
  auth_users.email
from public.profiles
left join auth.users auth_users on auth_users.id = profiles.id
on conflict (user_id) do nothing;

insert into public.user_preferences (user_id)
select profiles.id
from public.profiles
on conflict (user_id) do nothing;

select public.ensure_default_notification_preferences(id) from public.profiles;

alter table public.user_profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.user_notification_preferences enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.user_sessions enable row level security;
alter table public.user_passkeys enable row level security;
alter table public.user_privacy_requests enable row level security;
alter table public.audit_events enable row level security;

create policy "user_profiles_select_own"
on public.user_profiles
for select
to authenticated
using (auth.uid() = user_id);

create policy "user_profiles_insert_own"
on public.user_profiles
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user_profiles_update_own"
on public.user_profiles
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_preferences_select_own"
on public.user_preferences
for select
to authenticated
using (auth.uid() = user_id);

create policy "user_preferences_insert_own"
on public.user_preferences
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user_preferences_update_own"
on public.user_preferences
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_notification_preferences_select_own"
on public.user_notification_preferences
for select
to authenticated
using (auth.uid() = user_id);

create policy "user_notification_preferences_insert_own"
on public.user_notification_preferences
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user_notification_preferences_update_own"
on public.user_notification_preferences
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "push_subscriptions_select_own"
on public.push_subscriptions
for select
to authenticated
using (auth.uid() = user_id);

create policy "push_subscriptions_insert_own"
on public.push_subscriptions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "push_subscriptions_update_own"
on public.push_subscriptions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "push_subscriptions_delete_own"
on public.push_subscriptions
for delete
to authenticated
using (auth.uid() = user_id);

create policy "user_sessions_select_own"
on public.user_sessions
for select
to authenticated
using (auth.uid() = user_id);

create policy "user_sessions_insert_own"
on public.user_sessions
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user_sessions_update_own"
on public.user_sessions
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_passkeys_select_own"
on public.user_passkeys
for select
to authenticated
using (auth.uid() = user_id);

create policy "user_passkeys_insert_own"
on public.user_passkeys
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user_passkeys_update_own"
on public.user_passkeys
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_passkeys_delete_own"
on public.user_passkeys
for delete
to authenticated
using (auth.uid() = user_id);

create policy "user_privacy_requests_select_own"
on public.user_privacy_requests
for select
to authenticated
using (auth.uid() = user_id);

create policy "user_privacy_requests_insert_own"
on public.user_privacy_requests
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "audit_events_select_own"
on public.audit_events
for select
to authenticated
using (auth.uid() = user_id);

create policy "audit_events_insert_own"
on public.audit_events
for insert
to authenticated
with check (auth.uid() = user_id);

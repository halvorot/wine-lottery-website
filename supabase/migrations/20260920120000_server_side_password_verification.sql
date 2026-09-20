-- Keep lottery-password hashes and verification records server-side.
-- The public browser client may execute the narrowly scoped RPCs below, but it
-- cannot read hashes or create verification rows directly.
--
-- This is password-gate state, NOT authorization. Both RPCs intentionally use
-- the client IP supplied by the managed Supabase/PostgREST gateway. Deploy only
-- where that gateway overwrites x-forwarded-for/x-real-ip with the connection
-- address; this migration cannot establish that trust boundary itself. Do not
-- expose PostgREST directly or rely on this IP-based state for admin access,
-- draws, or any other authorization decision.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.has_lottery_password_verification(
  target_lottery_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  request_headers jsonb := coalesce(
    nullif(current_setting('request.headers', true), ''),
    '{}'
  )::jsonb;
  forwarded_ip text := nullif(
    split_part(
      coalesce(
        request_headers ->> 'x-forwarded-for',
        request_headers ->> 'x-real-ip',
        ''
      ),
      ',',
      1
    ),
    ''
  );
  client_ip inet;
begin
  if target_lottery_id is null or forwarded_ip is null then
    return false;
  end if;

  begin
    client_ip := forwarded_ip::inet;
  exception when invalid_text_representation then
    return false;
  end;

  if target_lottery_id is distinct from (
    select id
    from public.lotteries
    where is_completed = false
      and draw_date >= current_date
    order by draw_date asc
    limit 1
  ) then
    return false;
  end if;

  return exists (
    select 1
    from public.password_verifications
    where lottery_id = target_lottery_id
      and user_ip = client_ip::text
  );
end;
$$;

create or replace function public.verify_lottery_password(
  target_lottery_id uuid,
  submitted_password text
)
returns boolean
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  stored_password text;
  request_headers jsonb := coalesce(
    nullif(current_setting('request.headers', true), ''),
    '{}'
  )::jsonb;
  forwarded_ip text := nullif(
    split_part(
      coalesce(
        request_headers ->> 'x-forwarded-for',
        request_headers ->> 'x-real-ip',
        ''
      ),
      ',',
      1
    ),
    ''
  );
  client_ip inet;
begin
  if target_lottery_id is null
    or submitted_password is null
    or length(trim(submitted_password)) = 0
    or forwarded_ip is null then
    return false;
  end if;

  begin
    client_ip := forwarded_ip::inet;
  exception when invalid_text_representation then
    return false;
  end;

  if target_lottery_id is distinct from (
    select id
    from public.lotteries
    where is_completed = false
      and draw_date >= current_date
    order by draw_date asc
    limit 1
  ) then
    return false;
  end if;

  select password
  into stored_password
  from public.lottery_passwords
  where lottery_id = target_lottery_id;

  if stored_password is null
    or stored_password <> encode(extensions.digest(submitted_password, 'sha256'), 'hex') then
    return false;
  end if;

  insert into public.password_verifications (lottery_id, user_ip)
  values (target_lottery_id, client_ip::text)
  on conflict (lottery_id, user_ip) do nothing;

  return true;
end;
$$;

revoke all on function public.has_lottery_password_verification(uuid) from public;
revoke all on function public.verify_lottery_password(uuid, text) from public;
grant execute on function public.has_lottery_password_verification(uuid) to anon, authenticated;
grant execute on function public.verify_lottery_password(uuid, text) to anon, authenticated;

-- These revokes do not enable RLS or alter existing RLS policies. They remove
-- direct browser reads of password hashes and direct browser verification-row
-- creation; password creation/reset keeps its existing INSERT/UPDATE path.
-- Before deployment, validate the project's existing authenticated-admin RLS
-- policies and grants can still create/update lottery_passwords, and explicitly
-- confirm anon/authenticated cannot SELECT either sensitive table. Do not add
-- unverified RLS policies here because the deployed policy/schema state is not
-- represented in this repository.
revoke select on table public.lottery_passwords from public, anon, authenticated;
revoke select, insert on table public.password_verifications from public, anon, authenticated;

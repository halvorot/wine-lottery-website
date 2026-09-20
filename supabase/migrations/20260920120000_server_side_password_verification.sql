-- Keep lottery-password hashes and verification records server-side.
-- The public browser client may execute the narrowly scoped RPCs below, but it
-- cannot read hashes or create verification rows directly.

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
  client_ip text := nullif(
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
begin
  if target_lottery_id is null or client_ip is null then
    return false;
  end if;

  return exists (
    select 1
    from public.password_verifications
    where lottery_id = target_lottery_id
      and user_ip = client_ip
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
  client_ip text := nullif(
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
begin
  if target_lottery_id is null
    or submitted_password is null
    or length(trim(submitted_password)) = 0
    or client_ip is null then
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
  values (target_lottery_id, client_ip)
  on conflict (lottery_id, user_ip) do nothing;

  return true;
end;
$$;

revoke all on function public.has_lottery_password_verification(uuid) from public;
revoke all on function public.verify_lottery_password(uuid, text) from public;
grant execute on function public.has_lottery_password_verification(uuid) to anon, authenticated;
grant execute on function public.verify_lottery_password(uuid, text) to anon, authenticated;

-- These tables contain credential material and verification state. Access them
-- only through the RPCs above; existing admin INSERT/UPDATE permissions are
-- intentionally left unchanged.
revoke select on table public.lottery_passwords from public, anon, authenticated;
revoke select, insert on table public.password_verifications from public, anon, authenticated;

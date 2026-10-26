-- Admin accounts use two pieces:
--   auth.users: managed by Supabase Auth, including the hashed password.
--   public.admin_users: usernames that are allowed to open our editor.
-- Never put plaintext passwords, password hashes, or service keys in this table.
begin;

create table public.admin_users (
  username text primary key check (username ~ '^[a-z0-9][a-z0-9_-]{1,31}$'),
  -- A null user_id reserves a username but cannot authorize a login. The owner
  -- links it to an Auth user after choosing that account's password privately.
  user_id uuid unique references auth.users(id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

comment on table public.admin_users is 'Owner-managed editor allowlist; passwords are stored only by Supabase Auth.';
comment on column public.admin_users.user_id is 'Link to the Auth user whose internal identifier is USERNAME@admin.maxlee2006.github.io.';

-- RLS is the database's row filter. Even somebody who calls the REST API
-- directly can only read their own enabled entry after authenticating.
alter table public.admin_users enable row level security;
alter table public.admin_users force row level security;
revoke all on public.admin_users from public, anon, authenticated;
grant select (username, user_id, active) on public.admin_users to authenticated;

create policy admin_read_own_active_entry on public.admin_users
  for select to authenticated
  using (user_id = (select auth.uid()) and active);

-- No insert/update/delete privileges or policies are granted to browser users.
-- Being an admin also grants NO write access to Articles or Modals. The editor
-- only creates JSON locally, exactly like an offline document tool.
insert into public.admin_users (username) values ('super');

commit;

-- PostgREST adds the primary key to INSERT ... RETURNING even when the client
-- selects only CMS fields. Grant that single read column to signed-in users.
-- RLS continues to restrict draft reads and all writes to active admins.
begin;
grant select (id) on public."Articles", public."Modals" to authenticated;
notify pgrst, 'reload schema';
commit;

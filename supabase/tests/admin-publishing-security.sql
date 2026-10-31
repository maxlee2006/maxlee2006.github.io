-- Current security check after admin_content_and_categories. Owner connection
-- only. Temporary fixtures use negative IDs; no identity sequences are changed.
-- Run the entire transaction, including ROLLBACK. Existing rows are only read.
begin;

insert into public."Articles" (id,slug,title,page,category,published,content)
values (-20261031,'admin-security-probe','Rollback-only draft','portfolio','modeling',false,'{"thumbnail":"/probe.png","body":[]}');
insert into public."Modals" (id,slug,title,page,category,published,content)
values (-20261031,'admin-security-probe','Rollback-only draft','portfolio','modeling',false,'{"thumbnail":"/probe.png","body":[]}');

do $$
declare
  target text;
  visitor text;
  found_count bigint;
  changed_count bigint;
  admin_id uuid;
  other_id uuid := gen_random_uuid();
begin
  select user_id into admin_id from public.admin_users where active and user_id is not null limit 1;
  foreach target in array array['Articles','Modals'] loop
    if not exists (select 1 from pg_class where oid=format('public.%I',target)::regclass and relrowsecurity and relforcerowsecurity) then
      raise exception 'RLS must be enabled and forced on %',target;
    end if;
    if has_any_column_privilege('anon',format('public.%I',target),'INSERT')
      or has_any_column_privilege('anon',format('public.%I',target),'UPDATE')
      or has_table_privilege('authenticated',format('public.%I',target),'DELETE')
      or has_table_privilege('authenticated',format('public.%I',target),'TRUNCATE')
      or has_column_privilege('authenticated',format('public.%I',target),'id','UPDATE') then
      raise exception 'Unexpected browser grants on %',target;
    end if;
    foreach visitor in array array['anon','authenticated'] loop
      perform set_config('request.jwt.claim.sub',other_id::text,true);
      execute format('set local role %I',visitor);
      execute format('select count(*) from public.%I where published is not true',target) into found_count;
      if found_count <> 0 then raise exception 'Draft visible to % on %',visitor,target; end if;
      if visitor='authenticated' then
        execute format('with changed as (update public.%I set title=''Forbidden'' where slug=''admin-security-probe'' returning slug) select count(*) from changed',target) into changed_count;
        if changed_count <> 0 then raise exception 'Non-admin updated %',target; end if;
      end if;
      execute 'reset role';
    end loop;
    if admin_id is not null then
      perform set_config('request.jwt.claim.sub',admin_id::text,true);
      execute 'set local role authenticated';
      execute format('with changed as (update public.%I set title=''Admin fixture update'' where slug=''admin-security-probe'' returning slug) select count(*) from changed',target) into changed_count;
      if changed_count <> 1 then raise exception 'Active admin cannot update draft in %',target; end if;
      execute 'reset role';
    end if;
  end loop;
  if admin_id is not null then
    perform set_config('request.jwt.claim.sub',admin_id::text,true);
    execute 'set local role authenticated';
    insert into public.categories (page,slug,title) values ('portfolio','admin-security-probe','Rollback-only category');
    execute 'reset role';
  end if;
end $$;

select 'Current CMS RLS assertions passed; all fixtures rolled back' as result;
rollback;

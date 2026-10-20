-- Run through an owner/admin connection, never through the website client.
-- Existing content is only read. The two draft fixtures use explicit negative IDs
-- (no sequence changes), exist only within this transaction, and are rolled back.
-- A fixture is temporary test data. The owner can see it, but visitor roles
-- must not. Run this ENTIRE file including ROLLBACK, using unused IDs/slugs.
-- If a statement errors, roll back the failed transaction before other work.
begin;

insert into public."Articles" (id,slug,title,published)
values (-20261020,'cms-security-probe','Rollback-only draft',false);
insert into public."Modals" (id,slug,title,published)
values (-20261020,'cms-security-probe','Rollback-only draft',false);

do $$
declare
  visitor text;
  cms_table text;
  target regclass;
  col record;
  privilege text;
  statement text;
  visible_drafts bigint;
  visible_published bigint;
  owner_published bigint;
begin
  foreach cms_table in array array['Articles','Modals'] loop
    target := format('public.%I', cms_table)::regclass;
    if not exists (select from pg_class where oid=target and relrowsecurity and relforcerowsecurity) then
      raise exception 'RLS must be enabled and forced on %', target;
    end if;
    execute format('select count(*) from %s where published is true', target) into owner_published;
    foreach visitor in array array['anon','authenticated'] loop
      if exists (select from pg_roles where rolname=visitor and (rolsuper or rolbypassrls)) then
        raise exception '% bypasses RLS', visitor;
      end if;
      -- Effective privileges include grants inherited through other roles, so
      -- check what the visitor can actually do, not just named policy text.
      foreach privilege in array array['INSERT','UPDATE','DELETE','TRUNCATE','REFERENCES','TRIGGER'] loop
        if has_table_privilege(visitor,target,privilege) then
          raise exception '% has forbidden % on %', visitor,privilege,target;
        end if;
      end loop;
      for col in select attname from pg_attribute where attrelid=target and attnum>0 and not attisdropped loop
        foreach privilege in array array['INSERT','UPDATE','REFERENCES'] loop
          if has_column_privilege(visitor,target,col.attname,privilege) then
            raise exception '% has forbidden % on %.%', visitor,privilege,target,col.attname;
          end if;
        end loop;
        if has_column_privilege(visitor,target,col.attname,'SELECT') <>
          (col.attname in ('slug','title','page','category','sort_order','published','content')) then
          raise exception 'Unexpected SELECT privilege for % on %.%',visitor,target,col.attname;
        end if;
      end loop;

      -- Temporarily act as a visitor inside this transaction. Compare their
      -- unfiltered results with the owner's published count, then reset the role.
      execute format('set local role %I', visitor);
      if not row_security_active(target) then raise exception 'RLS inactive for %',visitor; end if;
      -- Deliberately omit the website's published=true filter.
      execute format('select count(*) from %s where published is not true',target) into visible_drafts;
      execute format('select count(*) from %s',target) into visible_published;
      if visible_drafts <> 0 or visible_published <> owner_published then
        raise exception 'Unexpected published/draft visibility for % on %',visitor,target;
      end if;
      -- EXPLAIN without ANALYZE only plans a statement; no write is executed.
      foreach statement in array array[
        format('explain insert into %s (title) values (''probe'')',target),
        format('explain update %s set title=title where false',target),
        format('explain delete from %s where false',target)
      ] loop
        begin
          execute statement;
          raise exception 'Write planning unexpectedly allowed for % on %',visitor,target;
        -- A permissions error is the expected passing result for this probe.
        -- Any other error propagates, rather than being mistaken for success.
        exception when insufficient_privilege then null;
        end;
      end loop;
      execute 'reset role';
    end loop;
  end loop;
end $$;

select 'Live CMS security assertions passed for anon and authenticated; draft fixtures rolled back' as result;
rollback;

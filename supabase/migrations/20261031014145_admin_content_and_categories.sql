-- Extends the existing owner-managed admin allowlist. No accounts, content,
-- or existing category metadata are overwritten. No security-definer functions.
begin;

create table if not exists public.categories (
  page text not null check (page in ('portfolio','design','professional-projects')),
  slug text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  title text not null check (length(btrim(title)) between 1 and 120),
  image text,
  logo text,
  image_position text not null default 'center' check (image_position in ('center','top')),
  columns integer not null default 2 check (columns in (2,3)),
  sort_order integer not null default 0,
  primary key (page,slug)
);

insert into public.categories (page,slug,title,image,logo,image_position,columns,sort_order) values
  ('portfolio','modeling','Modeling','/assets/images/vicar-head.jpg',null,'center',3,0),
  ('portfolio','animation','Animations','/assets/images/DMT.png',null,'center',3,1),
  ('portfolio','sketches','Sketches','/assets/images/bg-notxt.png',null,'center',3,2),
  ('design','ue','Unreal Engine 5','/assets/images/ue-still.png',null,'center',2,0),
  ('professional-projects','custom-engines','Custom Engines','/assets/images/Screenshot_02.png',null,'center',2,0),
  ('professional-projects','web-development','Web Development','/assets/images/mn-web.png','/assets/images/mn-logo-128.png','top',2,1)
on conflict (page,slug) do nothing;

alter table public.categories enable row level security;
alter table public.categories force row level security;
revoke all on public.categories from public, anon, authenticated;
grant select on public.categories to anon, authenticated;
grant insert (page,slug,title,image,logo,image_position,columns,sort_order) on public.categories to authenticated;

drop policy if exists categories_public_read on public.categories;
create policy categories_public_read on public.categories for select to anon, authenticated using (true);
drop policy if exists categories_admin_insert on public.categories;
create policy categories_admin_insert on public.categories for insert to authenticated
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and active));
drop policy if exists categories_admin_insert_guard on public.categories;
create policy categories_admin_insert_guard on public.categories as restrictive for insert to authenticated
  with check (exists (select 1 from public.admin_users where user_id = (select auth.uid()) and active));
drop policy if exists categories_no_anon_insert on public.categories;
create policy categories_no_anon_insert on public.categories as restrictive for insert to anon with check (false);
drop policy if exists categories_no_update on public.categories;
create policy categories_no_update on public.categories as restrictive for update to anon,authenticated using (false) with check (false);
drop policy if exists categories_no_delete on public.categories;
create policy categories_no_delete on public.categories as restrictive for delete to anon,authenticated using (false);

do $$
declare
  target text;
  policy_name text;
  admin_check text := 'exists (select 1 from public.admin_users where user_id = (select auth.uid()) and active)';
begin
  foreach target in array array['Articles','Modals'] loop
    -- Replace the old fixed category list with a database-enforced relationship.
    -- NOT VALID preserves legacy drafts; new or changed rows are still checked.
    execute format('alter table public.%I drop constraint if exists cms_published_content', target);
    execute format($check$alter table public.%I add constraint cms_published_content check (
      published is not true or (
        slug is not null and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
        and title is not null and length(title) > 0 and sort_order is not null
        and page is not null and page in ('portfolio','design','professional-projects')
        and category is not null and category ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
        and content is not null and jsonb_typeof(content) = 'object'
        and content ? 'body' and jsonb_typeof(content->'body') = 'array'
        and content ? 'thumbnail' and jsonb_typeof(content->'thumbnail') = 'string'
      )) not valid$check$, target);
    if not exists (select 1 from pg_constraint where conrelid = format('public.%I',target)::regclass and conname='cms_category_page') then
      execute format('alter table public.%I add constraint cms_category_page foreign key (page,category) references public.categories(page,slug) not valid',target);
    end if;
    execute format('create index if not exists %I on public.%I (page,category)',target || '_cms_category_idx',target);

    -- Only the seven CMS columns may be inserted/updated, never legacy/private
    -- fields or IDs. Identity columns allocate IDs without sequence grants.
    execute format('grant insert (slug,title,page,category,sort_order,published,content), update (slug,title,page,category,sort_order,published,content) on public.%I to authenticated',target);

    foreach policy_name in array array['cms_published_only','cms_no_insert','cms_no_update','cms_admin_read','cms_authenticated_read','cms_admin_insert','cms_admin_insert_guard','cms_admin_update','cms_admin_update_guard'] loop
      execute format('drop policy if exists %I on public.%I',policy_name,target);
    end loop;
    -- Anonymous policies never reference admin_users, which anon cannot read.
    -- Signed-in visitors remain read-only and cannot see drafts. Allowlists
    -- are checked in the database on every statement, including after revocation.
    execute format('create policy cms_published_only on public.%I as restrictive for select to anon using (published is true)',target);
    execute format('create policy cms_admin_read on public.%I for select to authenticated using (%s)',target,admin_check);
    execute format('create policy cms_authenticated_read on public.%I as restrictive for select to authenticated using (published is true or %s)',target,admin_check);
    execute format('create policy cms_no_insert on public.%I as restrictive for insert to anon with check (false)',target);
    execute format('create policy cms_no_update on public.%I as restrictive for update to anon using (false) with check (false)',target);
    execute format('create policy cms_admin_insert on public.%I for insert to authenticated with check (%s)',target,admin_check);
    execute format('create policy cms_admin_insert_guard on public.%I as restrictive for insert to authenticated with check (%s)',target,admin_check);
    execute format('create policy cms_admin_update on public.%I for update to authenticated using (%s) with check (%s)',target,admin_check,admin_check);
    execute format('create policy cms_admin_update_guard on public.%I as restrictive for update to authenticated using (%s) with check (%s)',target,admin_check,admin_check);
    -- The existing restrictive cms_no_delete remains in place. No browser
    -- role receives DELETE, TRUNCATE, REFERENCES, or private-column grants.
  end loop;
end $$;

notify pgrst, 'reload schema';
commit;

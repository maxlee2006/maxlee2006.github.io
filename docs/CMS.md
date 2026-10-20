# JSON CMS: setup, editing, and how it works

## What this change does

Previously, the website stored project descriptions and lists of images directly inside React page files. A modal always displayed its description first, then all its images, then its videos. LongMarch was a separate page containing hardcoded paragraphs and media.

Now Supabase's **Articles** and **Modals** tables hold that content. Both use the same ordered JSON `body` format. The website renders blocks in array order: paragraph, image, another paragraph, another image, and so on. The existing 12 modals and LongMarch article are captured in `supabase/seed.json` for a one-time import. That file is a migration backup; the public website never imports it and never uses it as a fallback database.

The Supabase dashboard's **Table Editor** is your editing interface. There is no public editor, signup flow, or admin login page on the website. You edit using your Supabase account. Visitors get read-only access to published content.

Existing page layouts, categories, typography, media, and the `/LongMarch` address are retained. The home page's featured project and the LongMarch project card now also read their content from the database. Loading/error messages appear while data is loading or if it cannot be read. Content is fetched after the page opens, so there can be a short loading delay; search engines that do not execute JavaScript will only see the static shell. This is the tradeoff for live content updates on GitHub Pages.

## Before merging or deploying

The branch does not automatically change your live database. A public publishable key cannot administer tables. **Apply the schema and import before deploying this branch**; otherwise the site will display a content-unavailable message. The deployment workflow checks readable content and stops on a missing schema, invalid JSON, or missing LongMarch article.

1. In Supabase, open your project and back up/export the existing Articles and Modals tables. The table names are case-sensitive: `"Articles"` and `"Modals"`.
2. Inspect the columns in Table Editor or SQL Editor. Run this read-only SQL to get their definitions:

   ```sql
   select table_name, column_name, data_type, is_nullable, column_default
   from information_schema.columns
   where table_schema = 'public' and table_name in ('Articles', 'Modals')
   order by table_name, ordinal_position;
   ```

3. Open `supabase/migrations/202610200001_cms.sql`. Review it, then paste it into Supabase **SQL Editor** and run it as the database owner. It adds missing CMS columns, a unique slug index, validation checks, public read grants, and row-level security policies. It does not delete existing rows or overwrite existing content. It runs in a transaction, so an incompatible column type or duplicate slug stops the whole migration. Existing unrelated columns are retained. If an existing unrelated column is required and has no default, adapt the import to supply it after reviewing the actual schema; do not delete it to force the import through.
4. Open `supabase/seed.sql`, copy its contents into SQL Editor, and run it. This file is generated from the JSON import. If you edit `supabase/seed.json` before importing, regenerate it from the repository directory:

   ```bash
   npm ci
   npm run cms:seed:sql --silent > supabase/seed.sql
   ```

   The checked-in `supabase/seed.sql` is ready to paste into SQL Editor. This inserts one article and 12 modals. Existing matching slugs are skipped rather than overwritten. If a matching slug already exists, review it manually to ensure it has the expected JSON. Re-running the import will not undo your edits. Existing database rows do not become valid CMS content merely because a migration ran; review any existing published rows.
5. Confirm those rows are visible in Table Editor and that `published` is true. Keep drafts false. Validate the constraints once any legacy rows are fixed:

   ```sql
   alter table public."Articles" validate constraint cms_published_content;
   alter table public."Modals" validate constraint cms_published_content;
   ```

6. Copy `.env.example` to `.env.local` for local development if you do not already have that file. The example contains this project's public URL and publishable key. Never put a secret or service-role key in a variable starting with `NEXT_PUBLIC_`.
7. On GitHub, open the repository's **Settings → Secrets and variables → Actions → Variables**. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` with the values from `.env.example`. They must be available at build time because Next.js embeds public configuration in the static JavaScript. They are deliberately public. A missing variable stops deployment with a clear message. The Actions workflow uses Node 24, performs lint and unit/database tests, checks live content, builds, and deploys the `out` directory.
8. Run `npm run cms:check`, `npm run lint`, `npm test`, and `npm run build` locally. `cms:check` only reads data; it validates all published records and the LongMarch slug. It does not attempt writes and does not prove live write permissions. `npm run dev` starts local development. `npm start` is incompatible with this project's static export configuration.
9. Verify the permissions below before merging. Then merge and deploy through the existing GitHub Pages workflow.

## Table fields

Articles and Modals use the same columns. Each table has its own unique slugs, so an article and a modal may have the same slug.

| Column | Purpose | Example |
| --- | --- | --- |
| `slug` | Permanent, unique content identifier; lowercase letters, digits, and single hyphens | `long-march` |
| `title` | Modal title, article title, and project-card label | `Long March` |
| `page` | Existing page that should show the project card | `professional-projects` |
| `category` | Existing category in that page | `custom-engines` |
| `sort_order` | Integer controlling project-card order; lower numbers appear first | `0` |
| `published` | Only true rows may be read publicly; defaults to false | `true` |
| `content` | JSON object with media, metadata, and ordered body blocks | See examples below |

An `id` column may already exist; it is left in place and the website does not depend on its type. It is not exposed by the CMS's public column grants. There is no automatic timestamp tracking in this change.

Use these combinations for placement; they preserve the existing website sections:

| `page` | Allowed `category` values |
| --- | --- |
| `portfolio` | `modeling`, `animation`, `sketches` |
| `design` | `ue` |
| `professional-projects` | `custom-engines`, `web-development` |

Lower `sort_order` values appear first, across articles and modals in the same category. Ties are sorted by slug. New categories require a layout/code change; adding more content within these categories does not. The Sketches placeholder remains part of the page layout.

## Add or edit a modal

In Table Editor, open **Modals**, then insert a row or edit an existing one. Set the title, slug, page, category, and sort order. Start with `published = false`. Paste a JSON object into `content`, for example:

```json
{
  "thumbnail": "/assets/images/gun-model.jpg",
  "date": "October 2026",
  "method": "Blender",
  "body": [
    { "type": "paragraph", "text": "Here is how the project started." },
    {
      "type": "image",
      "src": "/assets/images/gun-model.jpg",
      "alt": "The completed model",
      "caption": "The first version."
    },
    { "type": "paragraph", "text": "Here is what I changed after that render.\n\nThis begins another paragraph." },
    { "type": "image", "src": "/assets/images/pistol_side.png", "alt": "Side view" }
  ]
}
```

The thumbnail appears in the grid. Body images appear only at the position where you put them. `date` and `method` appear above the body in the modal and on its card. `caption` is optional. Write meaningful `alt` text for accessibility.

Set `published = true` when ready, save the row, then reload the website. You do not need to rebuild or redeploy for row edits. An already open page keeps its current content until navigation or reload. There is no draft preview endpoint: unpublished content deliberately cannot be accessed by the public website. Use the local tests to preview a new layout, or publish and verify when ready.

## Add or edit an article

Use **Articles** in Table Editor. Set the same placement fields as a modal; its grid card will open a full page instead of a dialog. Example `content`:

```json
{
  "thumbnail": "/assets/images/Screenshot_01.png",
  "description": "A short description used in the page's metadata.",
  "hero_image": "/assets/images/Library_Hero_3840_1240.png",
  "subtitle": "Custom Engine | C++, OpenGL",
  "date": "October 2026 | Programmer",
  "body": [
    { "type": "paragraph", "text": "Introduce the project here." },
    { "type": "image", "src": "/assets/images/Screenshot_01.png", "alt": "The game running" },
    { "type": "heading", "text": "What I learned" },
    { "type": "paragraph", "text": "Describe the development process here." },
    { "type": "embed", "src": "https://youtube.com/embed/exs0QeAbhKg", "title": "Gameplay video" }
  ]
}
```

`hero_image` is optional; without it, the article starts with a text heading. `logo_image` is optional and displays a logo over the hero, as on LongMarch. `card_date` and `card_method` optionally override the metadata displayed on the card without changing the full article. Set `featured: true`, `featured_image`, and `featured_description` to show an article as the featured project on the home page. If multiple articles are featured, the first in sort order wins. If none is featured, that home-page section is omitted.

The original LongMarch article remains at `/LongMarch`, identified by `slug = long-march`. Keep that slug to preserve existing links. New article addresses are `/articles?slug=your-slug`. `/articles` lists every published article. These query-based URLs work on GitHub Pages without creating a new static file every time you add an article. Unpublished/missing slugs show an unavailable message. GitHub Pages serves the static article shell with HTTP 200; it cannot generate a dynamic HTTP 404 for a missing database slug.

## Block types and JSON rules

The body **must be an array** (`[...]`), not an object with repeating keys. Arrays preserve order and let you repeat the same block type. A JSON object cannot reliably contain several `paragraph` keys. In Table Editor, enter the JSON object itself, not a quoted string containing JSON.

| `type` | Required fields | Optional fields |
| --- | --- | --- |
| `paragraph` | `text` | `muted` (article text in gray) |
| `heading` | `text` | — |
| `image` | `src`, `alt` | `caption` |
| `link` | `href`, `text` | — |
| `embed` | `src`, `title` | `height` (100–1000 pixels; otherwise 16:9) |
| `group` | `layout`, `body` | — |

A group is a nested array used to preserve LongMarch's current spacing and media layout. `layout` can be `text`, `embeds`, or `gallery`. Ordinary articles and modals can just use a flat list. The LongMarch import uses a text group, an embed group, and a gallery group to preserve the existing appearance. You can move an image into its text group to insert it between paragraphs. Group nesting is limited to four levels; each body allows up to 500 blocks.

Use double quotes in JSON, escape embedded quotes with `\"`, and use `\n` for line breaks. Do not use comments or trailing commas. Text is plain text, not Markdown or HTML. React escapes text: `<script>` is displayed as text rather than executed. HTML tags are never injected into the page.

Images and links support root-relative paths such as `/assets/images/file.png` or absolute HTTPS URLs. Protocol-relative URLs, credentials in URLs, HTTP, JavaScript, and data URLs are rejected. Video embeds are restricted to YouTube `/embed/ID`, YouTube's no-cookie domain, Steam's `/widget/ID/`, and the existing `https://www.musicnerd.xyz/` embed. Frames are sandboxed. Other sites need an explicit allowlist/code update; use a normal link block otherwise. Invalid content produces a recoverable error rather than being silently omitted. The browser console identifies invalid rows/fields for debugging, and `npm run cms:check` checks records before deployment.

## Where images live

The database stores image **addresses**, not image files. Existing `/assets/...` paths continue to refer to images under `public/assets` in this repository. New files added there require a Git commit and deployment. To upload images without changing Git, create a public Supabase Storage bucket through the dashboard and use the HTTPS public object URL in `src` or `thumbnail`.

Storage is separate from the Articles/Modals tables. This change does not create a bucket or change Storage policies. Upload through your owner dashboard, keep public upload/update/delete disabled, and only make assets public if you intend everyone to see them. Private buckets require a different access design; expiring signed URLs are unsuitable for permanent article content. External providers may block embedding or fail independently of the website.

## Why visitors cannot edit

A URL and publishable key identify the Supabase project; they are intended to appear in browser JavaScript. They do **not** provide database administrator privileges. Never ship a Supabase secret/service-role key, database password, personal access token, or MCP login token to the browser, GitHub repository, or `NEXT_PUBLIC_` variables.

Website code only makes `SELECT` requests. Removing write buttons would be insufficient on its own, because someone can send requests without your UI. The migration therefore enforces permissions inside PostgreSQL:

- **Grants** restrict `anon` and `authenticated` roles to reading only the seven CMS columns. Existing table and column grants are revoked first. Insert, update, delete, truncate, and other table privileges are not granted.
- **Row-level security (RLS)** limits those reads to rows where `published` is true. This applies even to someone who removes the website's own published filter.
- **Restrictive policies** additionally block insert/update/delete and restrict reads to published rows, so older permissive RLS policies do not widen access. RLS is enabled and forced on both tables.
- Dashboard/database-owner administration remains the editing path. This site has no end-user sessions, so signed-in public users are deliberately given the same read-only permissions as anonymous visitors.

The migration's privileges cover these two tables. Review any existing `SECURITY DEFINER` database functions, views, triggers, privileged API endpoints, or other applications that can access them. Those can use elevated privileges and require their own audit. Do not grant public access to a function that writes CMS content. Do not weaken these policies to fix an empty-content issue; check `published`, JSON validity, and the public key instead.

The policy tests use an isolated local PostgreSQL engine (PGlite), not your production database. They test both public roles, hidden drafts, legacy permissive policies, old column grants, forbidden writes/truncate, repeat imports, and rollback on incompatible schema. Passing them proves the supplied migration's behavior in that test database. It does not prove the migration has been applied to your live project.

After applying the migration, verify the **live** permissions from SQL Editor:

```sql
select c.relname, c.relrowsecurity, c.relforcerowsecurity
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('Articles', 'Modals');

select tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('Articles', 'Modals');

select grantee, table_name, privilege_type
from information_schema.role_table_grants
where table_schema = 'public' and table_name in ('Articles', 'Modals')
  and grantee in ('PUBLIC', 'anon', 'authenticated');

select grantee, table_name, column_name, privilege_type
from information_schema.role_column_grants
where table_schema = 'public' and table_name in ('Articles', 'Modals')
  and grantee in ('PUBLIC', 'anon', 'authenticated');
```

Both RLS flags should be true. Both roles should have SELECT on the CMS columns and no write grants. Keep a draft row and confirm it is absent from public queries. Test writes only in a transaction or a disposable development database; never use a production content row as a write-permission probe. The supplied test suite already attempts writes against a disposable database.

## Why the SSR/session example is different here

This repository uses Next.js's **Pages Router** and `output: 'export'` to publish plain files on GitHub Pages. The supplied `page.tsx`, server cookies, and middleware example targets a server-rendered App Router application. GitHub Pages does not run Next.js middleware or server components.

Both requested packages (`@supabase/supabase-js` and `@supabase/ssr`) are installed. This implementation uses the JavaScript client with session persistence, URL session detection, and automatic token refresh disabled. There is no sign-in session to refresh. Adding cookie middleware would not secure this static site and would not execute on its host. Public access is secured by database privileges/RLS. If you later want a custom admin UI or server-side article rendering, choose a server-capable host and a separate authentication/authorization design.

## Files and responsibilities

| File | What changed and why |
| --- | --- |
| `utils/supabase/client.ts` | Creates one Supabase client with public build-time configuration and no persisted auth session. No privileged key is used. |
| `lib/cms/content.ts` | Defines JSON block and record types, validates URLs, embed providers, body nesting, category placement, and published records; preserves the `/LongMarch` alias. |
| `lib/cms/catalog.ts` | Reads only the seven needed columns and published rows, in stable order, with pagination and request timeouts. Validates JSON before use. Concurrent consumers share in-flight reads; later visits fetch again. |
| `lib/cms/useCatalog.ts` | Loads content after mount, handles retries, and ignores responses after a component unmounts. |
| `components/ContentBody.tsx` | Shared article/modal renderer that follows block order. Plain text is escaped; images have alt text; embeds use an allowlist and sandbox. |
| `components/MediaModal.tsx` | Uses database records and ordered blocks. Retains the fade/overlay appearance, adds a dialog label, Escape-to-close, focus trapping/restoration, and body scroll locking. |
| `components/GridItem.tsx` | Shows database thumbnails/metadata. A modal card is a keyboard-accessible button; an article card is a link. |
| `components/CmsGrid.tsx` | Combines article and modal cards for a category and sorts them by order/slug. New database rows appear without adding JSX. |
| `components/CmsStatus.tsx` | Shared loading/error/retry display; no hardcoded content fallback masks a broken database. |
| `components/ArticleView.tsx` | Reusable version of the former LongMarch layout, using database hero/logo/metadata/body. |
| `pages/portfolio.tsx`, `pages/design.tsx`, `pages/professional-projects.tsx` | Retain existing page/category layouts; replace hardcoded project data and LongMarch card with CMS grids. |
| `pages/index.tsx` | Replaces hardcoded featured article text/hero with the database's featured article. |
| `pages/LongMarch.tsx` | Resolves the original URL to the `long-march` article; handles missing/unpublished content. |
| `pages/articles.tsx` | Lists published articles and displays new articles by query-string slug without a server or route rebuild. |
| `supabase/migrations/202610200001_cms.sql` | Additive schema/security migration; no production database changes happen just by committing this file. |
| `supabase/seed.json` | One-time JSON snapshot of the original article and 12 modals; not bundled into the website. |
| `supabase/seed.sql` | Ready-to-run SQL import generated from `seed.json`; tested to stay synchronized with the JSON. |
| `scripts/export-seed.ts` | Validates the JSON snapshot and prints repeatable, transactional import SQL that preserves rows with matching slugs. |
| `scripts/check-cms.ts` | Read-only live schema/content check used before deployment. Uses Node 24's environment-proxy support in the cloud. |
| `.env.example` | Documents public browser settings. Your local `.env.local` stays ignored. |
| `.eslintrc.json` | Adds working Next.js lint configuration. Native images are intentionally allowed for static export, GIFs, and external CMS image URLs. |
| `package.json`, `package-lock.json` | Adds Supabase, JSON validation, lint, browser testing, local database testing, and scripts. Uses a committed lockfile for repeatable installs. |
| `.github/workflows/deploy.yml` | Moves CI from Node 18 to Node 24, uses `npm ci`, runs lint/tests, requires public variables, and validates live CMS content before building. |
| `tests/content.test.ts`, `tests/database.test.ts` | Tests JSON safety/order, import completeness, database privileges/RLS, repeatability, and rollback. |
| `tests/browser/cms.spec.ts`, `playwright.config.ts` | Tests existing pages and modal behavior, new records without code changes, interleaved images, escaped text, and retry behavior with mocked read responses. |
| `.gitignore` | Ignores browser-test reports/results. |

## Local commands and troubleshooting

Use Node 24 and npm. From the repository root:

```bash
npm ci
# Copy .env.example to .env.local if it does not already exist.
npm run lint
npm test
npm run cms:check
npm run build
npm run dev
```

For browser tests, install Playwright's Chromium once with `npx playwright install chromium`, then run `npm run test:e2e`. If Chromium is already installed in this cloud environment, use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`. Browser tests intercept Supabase reads with fixtures derived from the import; they do not write to or prove connectivity to the live database.

Do not run `next dev` and `next build` at the same time: they share `.next`. Stop your development server before building. A successful build produces `out`; it validates compilation/types but cannot prove live content or permissions because content is fetched in the browser. Use `cms:check` and the live permission inspection above for that.

- **Column does not exist:** apply/review the schema migration before running the importer or deploying.
- **No records/empty category:** check published status, page/category spelling, RLS, and row content. A published row must include a thumbnail and body array. The catalog reports errors rather than quietly rendering malformed content.
- **Unexpected old content:** reload the page. Existing open pages are not realtime subscriptions. The seed import skips existing slugs; it does not overwrite edited records.
- **Image missing:** check the exact filename/case or the public HTTPS Storage URL. GitHub Pages paths are case-sensitive.
- **Public API works locally but not after deployment:** check that both GitHub Actions variables were set at build time and rebuild. Changing those settings cannot change JavaScript that has already been deployed.
- **Network access denied in Codex cloud:** allow `vvgaalfwstwpbzzbkbtx.supabase.co` in environment settings. The MCP connection also needs `mcp.supabase.com`; OAuth may require additional destinations reported by the authentication flow. These cloud rules do not control visitors' browsers.
- **Access denied while importing:** use SQL Editor as the project owner. Do not grant visitors write access or replace the public key with an admin key.

## Optional Supabase MCP connection

MCP lets an authorized development assistant inspect/manage your database. It is separate from the website's public database client. Do not give MCP/admin credentials to website visitors or commit them.

In a local Codex terminal with a writable Codex configuration, register this project-scoped server:

```bash
codex mcp add supabase --url 'https://mcp.supabase.com/mcp?project_ref=vvgaalfwstwpbzzbkbtx&features=docs%2Caccount%2Cdatabase%2Cdebugging%2Cdevelopment%2Cfunctions%2Cbranching'
codex mcp login supabase
```

Complete the browser sign-in, restart Codex, then use `/mcp` in the interactive client to verify it is authenticated. Registering a connection on your computer does not automatically install it into an existing cloud session. In a cloud session with a read-only Codex configuration, use the platform's supported MCP connection/settings path if available, or run the reviewed SQL yourself. The publishable website key cannot authenticate an administrator MCP connection.

## Verification performed on this branch (October 20, 2026)

- `npm run lint`: passed with no warnings/errors.
- `npm test`: 8 tests passed, including isolated PostgreSQL migration/RLS/privilege checks and import repeatability.
- Browser tests: all 4 passed against the development server and again against the production export served locally with GitHub Pages-style clean URL handling. Supabase responses were mocked from the JSON import. These tests cover existing content/categories, article navigation, keyboard modal dismissal/focus restoration, new database records, paragraph/image/paragraph order, escaped script text, and failure/retry behavior.
- `NEXT_TELEMETRY_DISABLED=1 npm run build`: passed and exported all 8 static routes (including the framework error page). Existing browser-compatibility-data age warnings remain nonblocking.
- Local requests to the six exported site pages returned HTTP 200. Browser JavaScript bundles were checked to confirm original article/modal text was not included as a hardcoded fallback.
- Live public-key reads reached both Supabase tables and returned no exposed rows. A read-only schema/content check failed with `column Articles.page does not exist`; a separate column probe also showed `Modals.title` missing. These checks do not prove the tables are physically empty, because RLS can hide rows.
- **Not completed on the live project:** applying the migration, importing content, and verifying deployed RLS/privileges. No authenticated administrator MCP connection was available. No live database writes were attempted. The supplied publishable key cannot perform administrator schema changes.
- Required rollout: apply the reviewed schema migration and seed SQL, configure both public GitHub Actions variables, pass `npm run cms:check`, and verify live permissions before merging/deploying. Environment network/public-variable draft changes are separate from GitHub settings and deployment.

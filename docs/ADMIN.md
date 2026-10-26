# Admin: write, preview, and copy JSON

The **Admin** page is at `/admin`, with an Admin link at the bottom of the home page. It is part of the `feat/admin-document-editor` branch. Pushing this branch does not publish it; GitHub Pages deploys only after changes reach `main`.

Admin is a document editor that produces the same JSON the existing website already reads. You can choose **Article** or **Modal**, compose text and media in order, preview the result, and copy the JSON. **It never inserts, updates, or deletes Articles or Modals.** Publishing remains a manual step in Supabase's Table Editor.

The page follows the website's existing black-and-white palette, square borders, Funnel Display text, and Major Mono Display headings. The interface is labeled **Admin**, with concise field labels and action controls; detailed usage guidance lives in this document.

## First-time login setup

The username is **`super`**. The live Supabase project already has an `admin_users` table and a reserved `super` row. That row starts with no linked Auth account, so **it cannot log in yet**. No default password has been created or committed. Set the password privately:

1. Open [this project's Authentication → Users](https://supabase.com/dashboard/project/vvgaalfwstwpbzzbkbtx/auth/users).
2. Choose **Add user → Create new user**. For the Auth email identifier, enter **`super@admin.maxlee2006.github.io`**. Choose a strong, unique password. Enable **Auto Confirm User** when offered. This is an internal account identifier, not an email inbox; use direct account creation, not an email invitation.
3. Open the project's **SQL Editor** and run this owner-only statement:

   ```sql
   update public.admin_users as admin
   set user_id = account.id, active = true
   from auth.users as account
   where admin.username = 'super'
     and lower(account.email) = 'super@admin.maxlee2006.github.io'
   returning admin.username, admin.user_id, admin.active;
   ```

4. It must return one row with `username = super`, a nonempty `user_id`, and `active = true`. If it returns no rows, check the Auth identifier from step 2. Do not put the password in SQL or in `admin_users`.
5. Open `/admin` on your local preview (or the website after this branch is deployed). Enter username **`super`** and the password you chose. You never need to type the internal email into the website.

An Auth user is a person/account that Supabase can verify. `user_id` links the allowlist row to that exact account. The dashboard login you use to manage Supabase is separate from this website login.

For another username later, create its Auth user as `USERNAME@admin.maxlee2006.github.io`, then insert its username and Auth user ID into `admin_users` using the owner dashboard. Usernames use 2–32 lowercase letters, digits, underscores, or hyphens, starting with a letter or digit. Only the owner can add or link accounts. To disable access, set the row's `active` field to false. Existing editor tabs recheck on focus and every 60 seconds.

Internal identifiers have no inbox, so email password-reset links are not a recovery method for these accounts. Password recovery requires the owner using the [Supabase Auth Admin API](https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid) from a trusted server, or creating a replacement Auth account and relinking the row. Never use an admin/service key in the website.

## Compose a document

1. Select **Article** or **Modal**. Both use the current content format; the selection controls the preview and which table you should paste into. Switching formats preserves the current document.
2. Write the title. Open **Placement & thumbnail** and fill in the slug, thumbnail URL, page, category, and sort order. Category choices follow the selected page automatically.
3. Open **Details & images** for date/role, tools/method, subtitle, description, hero image, logo image, home feature image/text, and card text overrides. Every metadata field in the current format is supported. Some fields are only displayed in articles, cards, or home features; selecting a modal does not delete those fields.
4. Write in **Body**. Choose a block from **Add a block here** at the position where it should appear. For an image between paragraphs, add a paragraph, an image, then another paragraph. Use the up/down arrows to reorder blocks, or **Remove** to delete one.
5. Watch **Preview** while you type. Use its view selector to see the article/modal, project card, or article's home feature. The preview uses the same article, modal content, and card components as the public site. The home feature illustrates the existing home layout. Panel width affects wrapping; it does not reproduce every screen size.

Text is plain text, with line breaks, rather than HTML or Markdown. The format has no inline bold/italic controls. Use heading blocks for section titles. Text such as `<script>` displays literally.

### Available body blocks

| Block | Editable values |
| --- | --- |
| Paragraph | Text and the optional muted-text flag for articles |
| Heading | Heading text |
| Image | Image URL, alternative text, and optional caption |
| Link | Link URL and display text |
| Embed | Supported embed URL, accessible title, and optional height of 100–1000 px |
| Group | Text, embeds, or gallery layout, with its own ordered blocks |

Groups support up to four nested levels. Each body holds up to 500 blocks, matching the existing schema. You can insert and reorder media inside groups, too. You cannot move a block across groups with the arrows; remove/recreate it at its destination or import edited JSON.

Images and links accept HTTPS URLs or root-relative paths such as `/assets/images/DMT.png`. Existing image files stay under `public/assets`. Admin accepts image links; it does not upload image files. Embeds retain the existing YouTube, Steam, and MusicNerd restrictions. Incomplete or unsafe media URLs stay hidden in preview; validation must pass before copying an export. Previewing an external image or embed contacts that provider.

For card date/method, an unchecked override inherits the main value. A checked override with empty text deliberately hides that value on the card. The editor preserves this distinction in JSON.

## Copy and publish manually

Validation messages list fields that need attention. Copy buttons become available when the whole document matches the site's current schema. The **Published (export)** checkbox starts unchecked. It only changes the generated JSON, never the live database.

- **Copy content JSON** copies just the object for a Supabase `content` cell. In the chosen Articles or Modals table, manually fill in `title`, `slug`, `page`, `category`, `sort_order`, and `published` as well.
- **Copy full row** includes those placement fields plus `content`. It is a reference/full row object; do not paste the entire thing into the `content` cell. The Table Editor's content cell expects only the content object.
- The **JSON** tab lets you inspect either output. If browser clipboard permission is denied, the editor switches to the JSON tab so you can select and copy it yourself.
- **Import JSON** accepts an existing content object or a full row object. To edit a published item, copy it from Supabase into Admin, make changes, then paste the result back manually. Importing does not load private database drafts or modify the original record.

Keep `published = false` in Supabase while entering a new row. When ready, set it to true and save. Run `npm run cms:check` to verify published data. Full row JSON uses the same boolean field and preserves the value you chose.

Drafts exist **only in this page's memory**. There is no database save, local autosave, or saved-document list. Copy JSON before reloading, navigating away, starting a new document, or signing out. The browser warns before leaving a changed document; new/import/sign-out actions also offer confirmation when appropriate. Browser warnings cannot recover a closed tab or expired session.

## How login works and what protects the database

1. The form takes a username and password. `usernameIdentifier()` normalizes the username and turns it into the internal Auth identifier.
2. `signInWithPassword()` sends credentials over HTTPS to Supabase Auth. Auth verifies its stored password hash and issues a session. Passwords are never queried from a public table.
3. `getUser()` verifies the session with Supabase. The client then reads the matching active `admin_users` row. A valid password alone does not grant admin access.
4. PostgreSQL row-level security (RLS) only lets an authenticated account read its own active entry. Anonymous visitors cannot read this table. Browser users cannot add, update, or delete allowlist rows.
5. Only after both checks pass does React load and show the document editor. Sessions use `sessionStorage`, scoped to this browser tab, and are refreshed by the Supabase client. Sign-out clears the local session. Copy work first; a failed access check unmounts the editor.

GitHub Pages serves static HTML and JavaScript. It cannot run Next.js server middleware, protect source bundles, or make the editor code secret. The login gates the editor interface; **database privileges and RLS are the security boundary for database access**. There is no privileged document API to bypass. Admin's article/modal previews and JSON generation are local operations. Do not add secret data to exported page source.

The public catalog keeps its separate, nonpersistent anonymous client. Admin has its own client/storage key. Signing into Admin does not grant database content writes: both `anon` and `authenticated` retain the existing read-only CMS grants. No service key is used by either client. There is no self-registration page.

## Code map

Comments in the new files explain the data flow and important security choices. Suggested reading order:

| File | Responsibility |
| --- | --- |
| `pages/admin.tsx` | Login form, Auth/session checks, periodic access rechecks, sign-out, and conditional editor loading |
| `utils/supabase/admin.ts` | Username mapping, tab-scoped Auth client, server-verified identity, and RLS-backed allowlist lookup |
| `lib/cms/editor.ts` | Draft shape, new blocks, import/export helpers, and reuse of the existing public-content validator |
| `components/admin/DocumentEditor.tsx` | One document state, metadata fields, import, validation, clipboard output, and unsaved-work warnings |
| `components/admin/BlockEditor.tsx` | Recursive ordered blocks, insert controls, and move/remove operations |
| `components/admin/Fields.tsx` | Accessible labels and textareas that grow as you type |
| `components/admin/DocumentPreview.tsx` | Live article/modal/card previews and filtering of unfinished media URLs |
| `components/ArticleView.tsx`, `components/MediaModal.tsx` | Shared public-site rendering, reused by Admin |
| `styles/admin.css` | Scoped Admin styles and responsive layout |
| `supabase/migrations/20261026041738_admin_users.sql` | Additive allowlist table, reserved `super` row, grants, and RLS |
| `tests/editor.test.ts` | Existing-content round trips, draft export rules, username mapping, and isolated access-control checks |
| `tests/browser/admin.spec.ts` | Mocked login/denial, document editing, previews, clipboard export, sessions, validation, and mobile layout |

## Verification and deployment

Use Node 24 and the existing public settings in `.env.example`. No new deployment secrets or Auth service keys are required.

```bash
npm ci
# Copy .env.example to .env.local only if .env.local does not exist.
npm test
npm run build
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

Stop an existing dev server before building. In an ordinary local setup, omit the Chromium environment variable if Playwright manages its own installed browser.

The live `admin_users` migration was applied through the connected Supabase tool. Inspection confirmed forced RLS, SELECT only on the three allowed columns for authenticated accounts, no anonymous reads, no browser write grants, a reserved unlinked `super` row, and unchanged counts of one article and twelve modals. A live check confirmed an unrelated authenticated ID cannot see an allowlist row. Supabase's security advisor returned zero findings. Browser login tests use mocked Auth/REST responses; **a real successful `super` login still requires the owner account/password setup above**.

Validation for this branch: all **13 unit/database tests** and **8 browser tests** passed, the production static export built successfully, and `cms:check` validated the live one article and twelve modals. Browser tests ran against the production export, including username login, rejected access, image ordering, both previews, clipboard contents, imported groups, mobile overflow, and sign-out when the Auth logout request fails. Desktop login/editor and mobile layouts were also inspected visually. The production build includes its normal TypeScript/Next.js lint checks.

The style and copy update was checked with another successful production build, all **4 Admin browser tests**, and desktop/mobile screenshot review. It changes presentation and interface labels only.

The migration file's timestamp was created by the Supabase CLI. The connected migration tool records its own remote timestamp, as it did for the earlier CMS migrations. Reconcile local and remote migration history before adopting a CLI `db push` workflow. Do not rerun the existing CMS seed or recreate the live allowlist to deploy this branch.

All website source changes stay on `feat/admin-document-editor`; nothing is merged to `main` or deployed by this work.

# Admin: create, save, and publish

The **Admin** page is at `/admin`, with an Admin link at the bottom of the home page. The editor from `main` is included in `feat/code-blocks-and-article-buttons`, together with controls for code samples and button grids. Pushing a feature branch does not publish it; GitHub Pages deploys only after changes reach `main`.

Active admins can create and edit **Articles** or **Modals**, save drafts, publish them, and create categories for Portfolio, Design, and Professional Projects. The editor keeps the existing live previews and JSON import/export. Typing stays local until you click a save or category-creation button.

The page follows the website's existing black-and-white palette, square borders, Funnel Display text, and Major Mono Display headings. The interface is labeled **Admin**, with concise field labels and action controls; detailed usage guidance lives in this document.

## Compose a document

1. Select **Article** or **Modal**. The selection controls the preview and destination table. Switching formats preserves the current content as a new document in the other table.
2. For a new item, write the title. To edit an existing item, select it from **Open saved document**. Drafts and published items are listed for the selected format. Use **Refresh saved content** to reload that list.
3. Open **Create category** to add a category, or select an existing one. Enter a page, category name, slug, and optional background image URL, then click **Create category**. The category is created immediately and selected for this document. New categories appear on their public page after reload/navigation, even before they contain a published project.
4. Open **Placement & thumbnail** and fill in the slug, thumbnail URL, page, category, and sort order. Category choices follow the selected page automatically.
5. Open **Details & images** for date/role, tools/method, subtitle, description, hero image, logo image, home feature image/text, and card text overrides. Every metadata field in the current format is supported. Some fields are only displayed in articles, cards, or home features; selecting a modal does not delete those fields.
6. Write in **Body**. Choose a block from **Add a block here** at the position where it should appear. For an image between paragraphs, add a paragraph, an image, then another paragraph. Use the up/down arrows to reorder blocks, or **Remove** to delete one.
7. Watch **Preview** while you type. Use its view selector to see the article/modal, project card, or article's home feature. The preview uses the same article, modal content, and card components as the public site. The home feature illustrates the existing home layout. Panel width affects wrapping; it does not reproduce every screen size.

Text is plain text, with line breaks, rather than HTML or Markdown. The format has no inline bold/italic controls. Use heading blocks for section titles. Text such as `<script>` displays literally.

### Available body blocks

| Block | Editable values |
| --- | --- |
| Paragraph | Text and the optional muted-text flag for articles |
| Heading | Heading text |
| Image | Image URL, alternative text, and optional caption |
| Link | Link URL and display text |
| Code sample | Source code, syntax language, and optional filename |
| Button grid | An ordered list of button labels, article slugs or link URLs, and optional image URLs |
| Embed | Supported embed URL, accessible title, and optional height of 100–1000 px |
| Group | Text, embeds, or gallery layout, with its own ordered blocks |

Groups support up to four nested levels. Each body holds up to 500 blocks, matching the existing schema. You can insert and reorder media inside groups, too. You cannot move a block across groups with the arrows; remove/recreate it at its destination or import edited JSON.

Images and links accept HTTPS URLs or root-relative paths such as `/assets/images/DMT.png`. Existing image files stay under `public/assets`. Admin accepts image links; it does not upload image files. Embeds retain the existing YouTube, Steam, and MusicNerd restrictions. Incomplete or unsafe media URLs stay hidden in preview; validation must pass before copying an export. Previewing an external image or embed contacts that provider.

For card date/method, an unchecked override inherits the main value. A checked override with empty text deliberately hides that value on the card. The editor preserves this distinction in JSON.

### Code samples

Choose **Code sample** from an insert control. Paste or write source into **Source code**; line breaks, tabs, quotes, and indentation are preserved. The source field uses a monospace font, scrolls horizontally for long lines, and disables spellcheck. You can enter up to 100,000 characters.

Set **Code language** to a Shiki language ID such as `cpp`, `javascript`, `python`, `glsl`, or `csharp`. The live preview uses VS Code's Dark+ highlighting. Empty or unknown languages display plain text. **Code filename (optional)** labels the code panel. Code is displayed as text; pasted HTML does not execute. Code samples work in articles, modals, and groups. Importing and copying JSON preserves the source without requiring you to escape it manually.

### Button grids

Choose **Button grid**, then fill in the first button or use **Add button** for more. Each button has:

- **Button text**, displayed in the site's header font.
- **Destination type**: choose **Article** and enter its slug, or **Website or site path** and enter an HTTPS URL or root-relative path. Switching types removes the previous destination from the exported JSON.
- **Button image URL (optional)**: enter an HTTPS image URL or `/assets/...` path. Leave it empty for a black button.

Use each button's arrows to reorder the array and **Remove** to delete an entry. A grid must contain 1–100 buttons. The block's own arrows move the entire grid among paragraphs, code samples, and other blocks. Grids can also be inserted inside groups.

Preview shows valid button destinations and omits unfinished or unsafe ones. An unfinished image previews as a black button, but invalid URLs must be corrected before JSON can be copied. Preview links do not navigate away from the editor, so inspecting a button keeps your draft in place. Both Article and Modal previews use the same code and grid components as the public site.

## Save, publish, and reopen

Complete the required fields, then click **Save article** or **Save modal**. Leave **Published** unchecked to save a draft that only active admins can read. Check it before saving to publish the item on its selected page/category. You can reopen a draft, check Published, and save again when it is ready. Unchecking Published and saving hides it from future public reads.

A successful save updates the status to **Saved** and refreshes the document list. Further edits update that saved record. Changing its slug updates the original record, rather than creating a second copy; old article links using that slug will stop resolving. **New document**, importing JSON, and switching formats create a new document. If its slug already exists in the target table, saving reports a duplicate and preserves the existing item. Open that saved item to edit it instead.

Saving failures leave your edits in the form. If a request times out after reaching the database, refresh the saved list before retrying; a created row may already be there. There is no automatic overwrite/upsert and no delete control. Category slugs are unique within a page, and every saved project must belong to a category on its selected page.

Saved changes are stored in Supabase and appear on the website after navigation/reload. They do not require a site rebuild. The new website code must be deployed once before using this workflow on the public site.

## JSON import/export and unsaved changes

**Copy content JSON** and **Copy full row** remain available for backups or manual editing. **Import JSON** accepts either format, including nested code samples and button arrays. An import starts a new document and does not silently replace a matching saved slug. Use **Open saved document** for direct editing.

The JSON tab shows the current output; if clipboard access fails, copy the visible text manually. Changes that have not been saved exist only in the current page's memory. Save or copy before leaving, starting another document, switching saved records, or signing out. The browser warns about unsaved edits. No local autosave is provided.

## Login and database permissions

The existing username/password login is unchanged. Supabase Auth verifies the password and token, and the editor checks the matching active row in `admin_users`. The owner manages this allowlist and links usernames to Auth user IDs; no account or password is created by the editor. Sessions remain scoped to the current browser tab.

Database row-level security enforces access even for requests made outside the interface:

- Anonymous visitors and signed-in users without an active allowlist entry can read published projects and category metadata only.
- Active admins can read drafts and insert/update the seven CMS columns of Articles and Modals. They can insert categories on the three supported pages.
- Browser roles cannot delete or truncate projects, modify IDs or unrelated private columns, edit/delete categories, or write to `admin_users`.
- Disabling or unlinking an admin entry removes its content write/draft-read permissions on subsequent statements. Permissions use the current allowlist, not user-editable JWT metadata.

The public catalog uses its separate anonymous client. Admin saves use the signed-in client and its normal access token. No service-role key or privileged server endpoint is shipped to the browser. GitHub Pages still serves a static application; Supabase enforces the database rules.

## Code map

Comments in the new files explain the data flow and important security choices. Suggested reading order:

| File | Responsibility |
| --- | --- |
| `pages/admin.tsx` | Login form, Auth/session checks, periodic access rechecks, sign-out, and conditional editor loading |
| `utils/supabase/admin.ts` | Username mapping, tab-scoped Auth client, server-verified identity, and RLS-backed allowlist lookup |
| `lib/cms/editor.ts` | Draft shape, new blocks, import/export, safe previews, and category-aware validation |
| `lib/cms/admin.ts` | Authenticated document reads/saves and category creation |
| `lib/cms/categories.ts`, `components/CategorySections.tsx` | Database-backed category loading and public page sections |
| `components/admin/DocumentEditor.tsx` | Document fields, saved-item picker, draft/publish saves, previews, JSON output, and unsaved-work warnings |
| `components/admin/CategoryManager.tsx` | Create categories with a page, name, slug, and optional image |
| `components/admin/BlockEditor.tsx` | Recursive ordered blocks, insert controls, and move/remove operations |
| `components/admin/ButtonsEditor.tsx` | Button labels, destinations, images, and ordered array controls |
| `components/admin/Fields.tsx` | Accessible labels and textareas that grow as you type |
| `components/admin/DocumentPreview.tsx` | Live article/modal/card previews and filtering of unfinished media URLs |
| `components/ArticleView.tsx`, `components/MediaModal.tsx` | Shared public-site rendering, reused by Admin |
| `styles/admin.css` | Scoped Admin styles and responsive layout |
| `supabase/migrations/20261026041738_admin_users.sql` | Additive allowlist table, reserved `super` row, grants, and RLS |
| `tests/editor.test.ts` | Existing-content round trips, draft export rules, username mapping, and isolated access-control checks |
| `tests/browser/admin.spec.ts` | Mocked login/denial, document editing, previews, clipboard export, sessions, validation, and mobile layout |

## Database setup, verification, and deployment

The additive migration `supabase/migrations/20261031014145_admin_content_and_categories.sql` runs after the existing CMS and `admin_users` migrations. It creates the categories table, seeds the six original category headers without overwriting matching rows, adds page/category foreign keys for new/changed content, and replaces the old blanket write restrictions with active-admin insert/update policies. Existing articles, modals, accounts, and category metadata are preserved. Do not rerun the original CMS migration afterward: it represents the old fixed-category, read-only model.

Use Node 24 and the existing public environment settings:

```bash
npm test
npm run lint
npm run cms:check
npm run build
PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e
```

`supabase/tests/admin-publishing-security.sql` is the current owner-run live security check. It uses temporary negative-ID document fixtures and a temporary category inside a transaction, then rolls everything back. It never changes an existing content row or advances identity sequences. The older `cms-security.sql` checks the historical read-only migration and is retained for baseline tests.

Tests use a disposable PostgreSQL engine and mocked browser HTTP responses. They cover active/revoked/non-admin access, draft visibility, category creation on every page, duplicate protection, save failures, persisted code/button content, and saved-item editing. A production build compiles the static application; deployment happens separately when the branch reaches `main`.

Current implementation checks passed: **22 unit/database tests**, **16 browser tests against the production static export**, lint, and the production build. The migration is applied to the live Supabase project; it was recorded as `20261031015448_admin_content_and_categories` (the connected tool assigns its own timestamp). Reconcile that timestamp with the CLI-created local migration before adopting a CLI migration-push workflow. The live rollback-only security check passed for visitor draft isolation and active-admin draft updates/category creation. Verification found six categories, two articles, twelve modals, one linked active admin, and zero remaining test fixtures. The public REST check validated all six categories and all fourteen published documents. Website deployment remains separate.

The Supabase security advisor reported no new table/RLS findings. Its existing Auth warning remains: [leaked-password protection is disabled](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection). This task did not change password settings or accounts.

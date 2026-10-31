# Max Lee Website

A Next.js website showcasing Max Lee's projects and portfolio.

## Getting Started

Requires Node.js 24. New to the CMS? Start with [the beginner walkthrough](docs/CMS.md#start-here-no-database-or-networking-experience-needed), then follow the [modal](docs/CMS.md#add-or-edit-a-modal) or [article](docs/CMS.md#add-or-edit-an-article) instructions.

For Supabase setup, the JSON format, editing content, security rules, and a detailed file-by-file explanation, see [CMS documentation](docs/CMS.md). Live database setup is already complete for this branch. The setup instructions are for reference; do not re-import content to preview or deploy it.

Articles and modals support [syntax-highlighted code samples](docs/CMS.md#code-samples-in-articles-and-modals) and [button grids](docs/CMS.md#button-grids-between-content-blocks) within their ordered `content.body` arrays. The CMS guide includes JSON examples for both.

For the username-protected **Admin** document editor at `/admin`, see [Admin setup and usage](docs/ADMIN.md). The owner must create/link its Auth account and choose a password privately. The editor previews articles/modals and copies JSON for manual pasting. It never writes content to the database.

### Install Dependencies

```bash
npm ci
```

### Configure local content access

Copy `.env.example` to `.env.local` if `.env.local` does not already exist. These are public website settings, not database owner credentials. The database setup for this branch is already complete; do not re-import the seed to preview the website. Local preview reads the same published rows as the deployed site.

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the website.

### Debugging

The project includes VS Code debugger configurations:

1. **Next.js: debug server-side** - Debugs the Next.js server
2. **Next.js: debug client-side** - Debugs the browser client
3. **Next.js: debug full stack** - Debugs both server and client

To use:
1. Press `F5` or go to Run and Debug in VS Code
2. Select one of the debug configurations
3. The development server will start on `http://localhost:3000`

## Build for Production

```bash
npm run cms:check
npm run build
```

The production output is the static `out` directory for GitHub Pages. `npm start` is not supported with static export. Run `npm run lint`, `npm test`, and `npm run test:e2e` for validation.

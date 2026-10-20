# Max Lee Website

A Next.js website showcasing Max Lee's projects and portfolio.

## Getting Started

Requires Node.js 24. For Supabase setup, the JSON format, editing content, security rules, and a detailed file-by-file explanation, see [CMS documentation](docs/CMS.md). Apply the schema migration and import before deploying this branch.

### Install Dependencies

```bash
npm ci
```

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

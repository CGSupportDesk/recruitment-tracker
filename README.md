# Closing Gap Recruitment Tracker

Internal recruitment tracker for Beyond ClosingGap Private Limited. Built with React, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, Neon Postgres, and Vercel serverless API routes.

## What is included

- Protected email/password login through the app's Vercel API.
- Clients, roles, and candidate submissions stored in Neon Postgres.
- Server-side database access through `DATABASE_URL`; the browser never receives the Neon connection string.
- Automatic role aging and completion-date freezing for Filled, Closed, and Cancelled roles.
- Candidate counts derived from candidate submissions, not manually entered.
- Dashboard KPIs, charts, oldest active roles, recent candidates, and recent roles.
- Client search/filter, role search/filter, inline role status changes, candidate inline status/remarks edits.
- Reports with client/date/status filters and CSV export.
- Vercel SPA fallback through `vercel.json`.

## Local setup

1. Install dependencies.

```bash
npm install
```

2. Create a Neon project and copy its pooled or direct connection string.

3. Run the SQL migration in `neon/migrations/202610120001_closing_gap_recruitment.sql` from the Neon SQL editor.

4. Generate a password hash for the first staff user.

```bash
node scripts/hash-password.mjs "your-secure-password"
```

5. Insert the first admin user in Neon SQL editor, using the generated hash.

```sql
insert into public.profiles (email, full_name, password_hash, role)
values ('admin@closinggap.in', 'Closing Gap Admin', '<generated-hash>', 'admin');
```

6. Copy `.env.example` to `.env.local` and fill in:

```bash
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
JWT_SECRET=replace-with-a-long-random-secret
```

7. Start the app with Vercel's local dev server so the `/api` functions are available.

```bash
npx vercel dev
```

## Vercel deployment through Git

1. Push this repository to GitHub.
2. Import the repository in Vercel.
3. Add the environment variables from `.env.example`.
4. Use the default Vite build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
5. Deploy.

## Neon notes

- The app uses Vercel API routes in `api/` for all database reads and writes.
- `DATABASE_URL` and `JWT_SECRET` must be Vercel environment variables.
- Auth is app-managed with bcrypt password hashes in the `profiles` table and signed 12-hour JWT sessions.
- Create staff users manually by inserting rows into `profiles` with a bcrypt hash.
- The app never displays internal role IDs or candidate IDs.

## Validation checklist

After connecting Neon, verify:

- Create a client with an onboarding date.
- Add multiple roles to the same client.
- Change role status from active to Filled, Closed, or Cancelled and confirm aging freezes.
- Reopen a role and confirm aging resumes from the original received date.
- Add candidates using only name, date shared, status, and remarks.
- Change candidate status directly in the role detail panel.
- Confirm dashboard, client, and role candidate counts update after add/edit/delete.
- Export reports as CSV.
- Build with `npm run build`.

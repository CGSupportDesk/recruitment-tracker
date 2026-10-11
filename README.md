# Closing Gap Recruitment Tracker

Internal recruitment tracker for Beyond ClosingGap Private Limited. Built with React, TypeScript, Vite, Tailwind CSS, Lucide React, Recharts, and Supabase.

## What is included

- Protected email/password login through Supabase Auth.
- Clients, roles, and candidate submissions stored in Supabase PostgreSQL.
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

2. Create a Supabase project.

3. Run the SQL migration in `supabase/migrations/202610120001_closing_gap_recruitment.sql`.

4. In Supabase Authentication, keep public signup disabled. Create staff users manually from the Supabase dashboard.

5. Copy `.env.example` to `.env.local` and fill in:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-public-anon-key
```

6. Start the app.

```bash
npm run dev
```

## Vercel deployment through Git

1. Commit and push this folder to your Git provider.
2. Import the repository in Vercel.
3. Set the project root to `closing-gap-recruitment-tracker` if this repository contains multiple folders.
4. Add the environment variables from `.env.example`.
5. Use the default Vite build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
6. Deploy.

## Supabase notes

- The browser only uses the public anon key.
- Row Level Security is enabled on all application tables.
- Authenticated staff can manage operational records.
- Profiles are created automatically when Supabase Auth users are created.
- The app never displays internal role IDs or candidate IDs.

## Validation checklist

After connecting Supabase, verify:

- Create a client with an onboarding date.
- Add multiple roles to the same client.
- Change role status from active to Filled, Closed, or Cancelled and confirm aging freezes.
- Reopen a role and confirm aging resumes from the original received date.
- Add candidates using only name, date shared, status, and remarks.
- Change candidate status directly in the role detail panel.
- Confirm dashboard, client, and role candidate counts update after add/edit/delete.
- Export reports as CSV.
- Build with `npm run build`.

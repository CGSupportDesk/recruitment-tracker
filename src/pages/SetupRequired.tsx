import { Database, Github, Rocket } from 'lucide-react';

export function SetupRequired() {
  return (
    <div className="grid min-h-screen place-items-center bg-canvas px-4">
      <div className="max-w-3xl rounded-lg bg-white p-8 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-600 text-white">
            <Database size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">Connect Supabase to continue</h1>
            <p className="text-sm text-slate-500">The tracker is built for live database-backed operations.</p>
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-100 p-4">
            <Database className="mb-3 text-brand-600" size={20} />
            <h2 className="font-semibold">Run migration</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Apply the SQL in supabase/migrations to create tables, triggers, indexes, and RLS.</p>
          </div>
          <div className="rounded-lg border border-slate-100 p-4">
            <Github className="mb-3 text-brand-600" size={20} />
            <h2 className="font-semibold">Push to Git</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Commit this app and push the repository to your Git provider.</p>
          </div>
          <div className="rounded-lg border border-slate-100 p-4">
            <Rocket className="mb-3 text-brand-600" size={20} />
            <h2 className="font-semibold">Set Vercel env</h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel before deployment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

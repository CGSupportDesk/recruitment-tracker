import { LogOut, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Profile } from '../types/recruitment';

interface SettingsPageProps {
  email?: string;
  profile: Profile | null;
}

export function SettingsPage({ email, profile }: SettingsPageProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="glass-panel p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-600 text-white">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h2 className="font-semibold">Access</h2>
            <p className="text-sm text-slate-500">Authenticated staff workspace</p>
          </div>
        </div>
        <div className="mt-6 grid gap-3">
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="label">Signed in as</div>
            <div className="mt-1 font-semibold">{email}</div>
          </div>
          <div className="rounded-lg bg-slate-50 p-4">
            <div className="label">Role</div>
            <div className="mt-1 font-semibold">{profile?.role ?? 'staff'}</div>
          </div>
        </div>
        <button className="btn-danger mt-6" onClick={() => supabase?.auth.signOut()}>
          <LogOut size={16} />
          Sign out
        </button>
      </section>
      <section className="glass-panel p-6">
        <h2 className="font-semibold">Deployment</h2>
        <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
          <p>Use the migration in supabase/migrations, then add the two public Supabase variables in Vercel.</p>
          <div className="rounded-lg bg-slate-950 p-4 font-mono text-xs text-white">
            VITE_SUPABASE_URL
            <br />
            VITE_SUPABASE_ANON_KEY
          </div>
          <p>No service-role secret is needed in the browser. Row Level Security keeps access restricted to authenticated staff.</p>
        </div>
      </section>
    </div>
  );
}

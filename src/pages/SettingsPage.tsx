import { LogOut, ShieldCheck } from 'lucide-react';
import { logout, type AuthProfile } from '../lib/apiClient';

interface SettingsPageProps {
  email?: string;
  profile: AuthProfile | null;
  onLogout: () => void;
}

export function SettingsPage({ email, profile, onLogout }: SettingsPageProps) {
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
        <button
          className="btn-danger mt-6"
          onClick={() => {
            logout();
            onLogout();
          }}
        >
          <LogOut size={16} />
          Sign out
        </button>
      </section>
      <section className="glass-panel p-6">
        <h2 className="font-semibold">Deployment</h2>
        <div className="mt-4 space-y-4 text-sm leading-6 text-slate-600">
          <p>Use the Neon migration, then add the server-side database and session variables in Vercel.</p>
          <div className="rounded-lg bg-slate-950 p-4 font-mono text-xs text-white">
            DATABASE_URL
            <br />
            JWT_SECRET
          </div>
          <p>The browser never receives the Neon connection string. All data operations go through authenticated Vercel API routes.</p>
        </div>
      </section>
    </div>
  );
}

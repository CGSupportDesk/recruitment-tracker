import { useState, type FormEvent } from 'react';
import { Lock, LogIn } from 'lucide-react';
import { login, type AuthProfile } from '../lib/apiClient';

export function LoginPage({ onLogin }: { onLogin: (profile: AuthProfile) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const session = await login(email, password);
      onLogin(session.profile);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to sign in.');
    }
    setLoading(false);
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-brand-700 via-brand-600 to-brand-500 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-soft">
        <div className="mb-7 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-600 text-white">
            <Lock size={20} />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-ink">Closing Gap</h1>
            <p className="text-sm text-slate-500">Internal recruitment tracker</p>
          </div>
        </div>
        <form onSubmit={submit} className="grid gap-4">
          <label>
            <span className="label">Email</span>
            <input className="field mt-1" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </label>
          <label>
            <span className="label">Password</span>
            <input className="field mt-1" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </label>
          {error && <div className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</div>}
          <button className="btn-primary mt-2" disabled={loading}>
            <LogIn size={16} />
            Sign in
          </button>
        </form>
      </div>
    </div>
  );
}

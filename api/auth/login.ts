import bcrypt from 'bcryptjs';
import { db, handleApiError, methodNotAllowed, readBody, send, signProfile, type ApiRequest, type ApiResponse } from '../_shared';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  try {
    const { email, password } = readBody<{ email?: string; password?: string }>(req);
    if (!email || !password) {
      return send(res, 400, { error: 'Email and password are required.' });
    }

    const sql = db();
    const rows = await sql.query(
      'select id, email, full_name, role, password_hash from public.profiles where lower(email) = lower($1) limit 1',
      [email],
    );
    const profile = rows[0] as
      | { id: string; email: string; full_name: string | null; role: 'admin' | 'staff'; password_hash: string }
      | undefined;

    if (!profile || !(await bcrypt.compare(password, profile.password_hash))) {
      return send(res, 401, { error: 'Invalid email or password.' });
    }

    const publicProfile = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
    };

    send(res, 200, { token: signProfile(publicProfile), profile: publicProfile });
  } catch (reason) {
    handleApiError(res, reason);
  }
}

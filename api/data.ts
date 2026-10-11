import { db, handleApiError, methodNotAllowed, requireAuth, send, type ApiRequest, type ApiResponse } from './_shared.js';

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  try {
    requireAuth(req);
    const sql = db();
    const [clients, roles, candidates] = await Promise.all([
      sql.query('select * from public.clients order by onboarding_date desc'),
      sql.query('select * from public.roles order by role_received_date desc'),
      sql.query('select * from public.candidate_submissions order by date_shared desc'),
    ]);

    send(res, 200, { clients, roles, candidates });
  } catch (reason) {
    handleApiError(res, reason);
  }
}

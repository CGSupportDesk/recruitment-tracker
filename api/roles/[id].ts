import { deleteRow, handleApiError, methodNotAllowed, readBody, requireAuth, send, updateRow, type ApiRequest, type ApiResponse } from '../_shared.js';

const fields = [
  'client_id',
  'job_title',
  'role_received_date',
  'budget',
  'openings',
  'experience_required',
  'job_location',
  'priority',
  'role_status',
  'job_description',
  'internal_notes',
  'completion_date',
];

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const id = String(req.query.id ?? '');

  try {
    requireAuth(req);

    if (req.method === 'PATCH') {
      const row = await updateRow('roles', id, readBody(req), fields);
      return send(res, 200, { role: row });
    }

    if (req.method === 'DELETE') {
      await deleteRow('roles', id);
      return send(res, 200, { ok: true });
    }

    return methodNotAllowed(res);
  } catch (reason) {
    handleApiError(res, reason);
  }
}

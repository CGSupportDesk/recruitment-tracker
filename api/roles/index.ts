import { handleApiError, insertRow, methodNotAllowed, readBody, requireAuth, send, type ApiRequest, type ApiResponse } from '../_shared.js';

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
];

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  try {
    requireAuth(req);
    const row = await insertRow('roles', readBody(req), fields);
    send(res, 201, { role: row });
  } catch (reason) {
    handleApiError(res, reason);
  }
}

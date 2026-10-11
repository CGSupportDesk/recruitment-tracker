import { handleApiError, insertRow, methodNotAllowed, readBody, requireAuth, send, type ApiRequest, type ApiResponse } from '../_shared';

const fields = ['role_id', 'candidate_name', 'date_shared', 'status', 'remarks'];

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  try {
    requireAuth(req);
    const row = await insertRow('candidate_submissions', readBody(req), fields);
    send(res, 201, { candidate: row });
  } catch (reason) {
    handleApiError(res, reason);
  }
}

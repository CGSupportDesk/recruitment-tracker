import { deleteRow, handleApiError, methodNotAllowed, readBody, requireAuth, send, updateRow, type ApiRequest, type ApiResponse } from './_shared.js';

const fields = ['role_id', 'candidate_name', 'date_shared', 'status', 'remarks'];

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const id = String(req.query.id ?? '');

  try {
    requireAuth(req);

    if (!id) {
      return send(res, 400, { error: 'Candidate id is required.' });
    }

    if (req.method === 'PATCH') {
      const row = await updateRow('candidate_submissions', id, readBody(req), fields);
      return send(res, 200, { candidate: row });
    }

    if (req.method === 'DELETE') {
      await deleteRow('candidate_submissions', id);
      return send(res, 200, { ok: true });
    }

    return methodNotAllowed(res);
  } catch (reason) {
    handleApiError(res, reason);
  }
}

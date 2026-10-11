import { deleteRow, handleApiError, methodNotAllowed, readBody, requireAuth, send, updateRow, type ApiRequest, type ApiResponse } from '../_shared';

const fields = ['client_name', 'onboarding_date', 'contact_person', 'contact_email', 'contact_phone', 'client_status', 'notes'];

export default async function handler(req: ApiRequest, res: ApiResponse) {
  const id = String(req.query.id ?? '');

  try {
    requireAuth(req);

    if (req.method === 'PATCH') {
      const row = await updateRow('clients', id, readBody(req), fields);
      return send(res, 200, { client: row });
    }

    if (req.method === 'DELETE') {
      await deleteRow('clients', id);
      return send(res, 200, { ok: true });
    }

    return methodNotAllowed(res);
  } catch (reason) {
    handleApiError(res, reason);
  }
}

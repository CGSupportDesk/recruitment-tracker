import { handleApiError, insertRow, methodNotAllowed, readBody, requireAuth, send, type ApiRequest, type ApiResponse } from '../_shared';

const fields = ['client_name', 'onboarding_date', 'contact_person', 'contact_email', 'contact_phone', 'client_status', 'notes'];

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'POST') return methodNotAllowed(res);

  try {
    requireAuth(req);
    const row = await insertRow('clients', readBody(req), fields);
    send(res, 201, { client: row });
  } catch (reason) {
    handleApiError(res, reason);
  }
}

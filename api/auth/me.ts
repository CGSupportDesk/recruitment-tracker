import { handleApiError, methodNotAllowed, requireAuth, send, type ApiRequest, type ApiResponse } from '../_shared';

export default function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== 'GET') return methodNotAllowed(res);

  try {
    const profile = requireAuth(req);
    send(res, 200, { profile });
  } catch (reason) {
    handleApiError(res, reason);
  }
}

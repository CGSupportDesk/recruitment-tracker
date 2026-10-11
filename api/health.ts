import { isConfigured, send, type ApiRequest, type ApiResponse } from './_shared.js';

export default function handler(_req: ApiRequest, res: ApiResponse) {
  send(res, 200, { configured: isConfigured, provider: 'neon' });
}

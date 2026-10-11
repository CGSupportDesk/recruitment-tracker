import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';

export type ApiRequest = {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  query: Record<string, string | string[] | undefined>;
};

export type ApiResponse = {
  status: (code: number) => ApiResponse;
  json: (payload: unknown) => void;
};

type JwtProfile = {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'staff';
};

export const isConfigured = Boolean(process.env.DATABASE_URL && process.env.JWT_SECRET);

export function db() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not configured.');
  }
  return neon(process.env.DATABASE_URL);
}

export function send(res: ApiResponse, status: number, payload: unknown) {
  res.status(status).json(payload);
}

export function methodNotAllowed(res: ApiResponse) {
  send(res, 405, { error: 'Method not allowed.' });
}

export function readBody<T extends Record<string, unknown>>(req: ApiRequest): T {
  if (!req.body) return {} as T;
  if (typeof req.body === 'string') return JSON.parse(req.body) as T;
  return req.body as T;
}

export function signProfile(profile: JwtProfile) {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }
  return jwt.sign(profile, process.env.JWT_SECRET, { expiresIn: '12h' });
}

export function requireAuth(req: ApiRequest): JwtProfile {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured.');
  }

  const rawHeader = req.headers.authorization;
  const header = Array.isArray(rawHeader) ? rawHeader[0] : rawHeader;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new Error('Authentication required.');
  }

  return jwt.verify(token, process.env.JWT_SECRET) as JwtProfile;
}

export function handleApiError(res: ApiResponse, reason: unknown) {
  const message = reason instanceof Error ? reason.message : 'Unexpected server error.';
  const status = message === 'Authentication required.' ? 401 : 500;
  send(res, status, { error: message });
}

export function cleanPayload<T extends Record<string, unknown>>(payload: T, allowed: readonly string[]) {
  return Object.fromEntries(Object.entries(payload).filter(([key, value]) => allowed.includes(key) && value !== undefined));
}

export async function insertRow(table: string, payload: Record<string, unknown>, allowed: readonly string[]) {
  const sql = db();
  const cleaned = cleanPayload(payload, allowed);
  const columns = Object.keys(cleaned);
  if (!columns.length) throw new Error('No valid fields supplied.');

  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const query = `insert into public.${table} (${columns.join(', ')}) values (${placeholders}) returning *`;
  const rows = await sql.query(query, Object.values(cleaned));
  return rows[0];
}

export async function updateRow(table: string, id: string, payload: Record<string, unknown>, allowed: readonly string[]) {
  const sql = db();
  const cleaned = cleanPayload(payload, allowed);
  const columns = Object.keys(cleaned);
  if (!columns.length) throw new Error('No valid fields supplied.');

  const assignments = columns.map((column, index) => `${column} = $${index + 1}`).join(', ');
  const query = `update public.${table} set ${assignments} where id = $${columns.length + 1} returning *`;
  const rows = await sql.query(query, [...Object.values(cleaned), id]);

  if (!rows.length) throw new Error('Record not found.');
  return rows[0];
}

export async function deleteRow(table: string, id: string) {
  const sql = db();
  const rows = await sql.query(`delete from public.${table} where id = $1 returning id`, [id]);
  if (!rows.length) throw new Error('Record not found.');
}

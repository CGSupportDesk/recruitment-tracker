import type {
  CandidateCounts,
  CandidateStatus,
  CandidateSubmission,
  Client,
  ClientStats,
  Role,
  RoleStatus,
} from '../types/recruitment';

export const roleStatuses: RoleStatus[] = ['Open', 'In Progress', 'On Hold', 'Filled', 'Closed', 'Cancelled'];
export const activeRoleStatuses: RoleStatus[] = ['Open', 'In Progress', 'On Hold'];
export const terminalRoleStatuses: RoleStatus[] = ['Filled', 'Closed', 'Cancelled'];
export const candidateStatuses: CandidateStatus[] = ['Pending', 'Selected', 'Rejected'];

function parseDateValue(value: Date | string | null | undefined) {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(/^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function toDateInputValue(date: Date | string = new Date()) {
  return parseDateValue(date)?.toISOString().slice(0, 10) ?? '';
}

export function formatDate(value: string | null | undefined) {
  const date = parseDateValue(value);
  if (!date) return 'Not set';

  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function formatMonth(value: string | null | undefined, year: '2-digit' | 'numeric' = '2-digit') {
  const date = parseDateValue(value);
  if (!date) return 'Not set';

  return date.toLocaleDateString('en-IN', { month: 'short', year });
}

export function daysBetween(start: string, end = toDateInputValue()) {
  const startDate = parseDateValue(start);
  const endDate = parseDateValue(end);
  if (!startDate || !endDate) return 0;

  return Math.max(0, Math.floor((endDate.getTime() - startDate.getTime()) / 86_400_000));
}

export function roleAging(role: Role) {
  const end = role.completion_date ?? toDateInputValue();
  return daysBetween(role.role_received_date, end);
}

export function agingBand(days: number) {
  if (days <= 7) return { label: 'Fresh', className: 'bg-emerald-50 text-emerald-700 ring-emerald-100' };
  if (days <= 14) return { label: 'Monitor', className: 'bg-sky-50 text-sky-700 ring-sky-100' };
  if (days <= 30) return { label: 'Attention', className: 'bg-amber-50 text-amber-700 ring-amber-100' };
  return { label: 'Critical', className: 'bg-brand-50 text-brand-700 ring-brand-100' };
}

export function isActiveRole(role: Role) {
  return activeRoleStatuses.includes(role.role_status);
}

export function countsForRole(roleId: string, candidates: CandidateSubmission[]): CandidateCounts {
  const scoped = candidates.filter((candidate) => candidate.role_id === roleId);
  return {
    total: scoped.length,
    pending: scoped.filter((candidate) => candidate.status === 'Pending').length,
    selected: scoped.filter((candidate) => candidate.status === 'Selected').length,
    rejected: scoped.filter((candidate) => candidate.status === 'Rejected').length,
  };
}

export function countsForRoles(roleIds: string[], candidates: CandidateSubmission[]): CandidateCounts {
  const roleSet = new Set(roleIds);
  const scoped = candidates.filter((candidate) => roleSet.has(candidate.role_id));
  return {
    total: scoped.length,
    pending: scoped.filter((candidate) => candidate.status === 'Pending').length,
    selected: scoped.filter((candidate) => candidate.status === 'Selected').length,
    rejected: scoped.filter((candidate) => candidate.status === 'Rejected').length,
  };
}

export function statsForClient(clientId: string, roles: Role[], candidates: CandidateSubmission[]): ClientStats {
  const clientRoles = roles.filter((role) => role.client_id === clientId);
  return {
    activeRoles: clientRoles.filter(isActiveRole).length,
    totalRoles: clientRoles.length,
    candidatesShared: countsForRoles(
      clientRoles.map((role) => role.id),
      candidates,
    ).total,
  };
}

export function clientName(clientId: string, clients: Client[]) {
  return clients.find((client) => client.id === clientId)?.client_name ?? 'Unknown client';
}

export function csvEscape(value: unknown) {
  const text = value == null ? '' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [headers.map(csvEscape).join(','), ...rows.map((row) => headers.map((header) => csvEscape(row[header])).join(','))].join(
    '\n',
  );
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

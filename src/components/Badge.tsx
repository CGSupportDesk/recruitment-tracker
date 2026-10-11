import { agingBand } from '../lib/domain';
import type { CandidateStatus, ClientStatus, RolePriority, RoleStatus } from '../types/recruitment';

const statusClasses: Record<ClientStatus | RoleStatus | CandidateStatus | RolePriority, string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Inactive: 'bg-slate-100 text-slate-600 ring-slate-200',
  'On Hold': 'bg-amber-50 text-amber-700 ring-amber-100',
  Open: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  'In Progress': 'bg-sky-50 text-sky-700 ring-sky-100',
  Filled: 'bg-indigo-50 text-indigo-700 ring-indigo-100',
  Closed: 'bg-slate-100 text-slate-700 ring-slate-200',
  Cancelled: 'bg-rose-50 text-rose-700 ring-rose-100',
  Pending: 'bg-amber-50 text-amber-700 ring-amber-100',
  Selected: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Rejected: 'bg-rose-50 text-rose-700 ring-rose-100',
  Low: 'bg-slate-100 text-slate-600 ring-slate-200',
  Medium: 'bg-sky-50 text-sky-700 ring-sky-100',
  High: 'bg-amber-50 text-amber-700 ring-amber-100',
  Urgent: 'bg-brand-50 text-brand-700 ring-brand-100',
};

export function Badge({ label }: { label: keyof typeof statusClasses }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClasses[label]}`}>
      {label}
    </span>
  );
}

export function AgingBadge({ days }: { days: number }) {
  const band = agingBand(days);
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${band.className}`}>
      {days}d · {band.label}
    </span>
  );
}

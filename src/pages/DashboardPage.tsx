import { Activity, BriefcaseBusiness, CheckCircle2, Clock, Users, type LucideIcon } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { AgingBadge, Badge } from '../components/Badge';
import { activeRoleStatuses, agingBand, clientName, countsForRoles, formatDate, formatMonth, isActiveRole, roleAging, roleStatuses } from '../lib/domain';
import type { CandidateSubmission, Client, Role } from '../types/recruitment';

interface DashboardProps {
  clients: Client[];
  roles: Role[];
  candidates: CandidateSubmission[];
}

function KpiCard({ label, value, detail, icon: Icon }: { label: string; value: string | number; detail: string; icon: typeof Users }) {
  return (
    <div className="rounded-lg bg-brand-900/35 p-6 text-white shadow-lift backdrop-blur">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-white/65">{label}</p>
          <div className="mt-3 text-3xl font-light">{value}</div>
          <p className="mt-2 text-xs text-white/55">{detail}</p>
        </div>
        <Icon className="text-white/45" size={24} />
      </div>
    </div>
  );
}

function monthKey(value: string) {
  return formatMonth(value);
}

export function DashboardPage({ clients, roles, candidates }: DashboardProps) {
  const activeRoles = roles.filter(isActiveRole);
  const filledRoles = roles.filter((role) => role.role_status === 'Filled');
  const candidateCounts = countsForRoles(
    roles.map((role) => role.id),
    candidates,
  );
  const averageAging = activeRoles.length
    ? Math.round(activeRoles.reduce((total, role) => total + roleAging(role), 0) / activeRoles.length)
    : 0;

  const rolesByStatus = roleStatuses.map((status) => ({
    name: status,
    value: roles.filter((role) => role.role_status === status).length,
  }));
  const candidatesByStatus = [
    { name: 'Pending', value: candidateCounts.pending, color: '#d97706' },
    { name: 'Selected', value: candidateCounts.selected, color: '#059669' },
    { name: 'Rejected', value: candidateCounts.rejected, color: '#d01d24' },
  ];
  const agingDistribution = ['Fresh', 'Monitor', 'Attention', 'Critical'].map((label) => ({
    name: label,
    value: activeRoles.filter((role) => agingBand(roleAging(role)).label === label).length,
  }));

  const monthly = Array.from(
    [...roles.map((role) => role.role_received_date), ...candidates.map((candidate) => candidate.date_shared)]
      .reduce((map, date) => {
        const key = monthKey(date);
        map.set(key, {
          month: key,
          roles: roles.filter((role) => monthKey(role.role_received_date) === key).length,
          candidates: candidates.filter((candidate) => monthKey(candidate.date_shared) === key).length,
          filled: roles.filter((role) => role.completion_date && monthKey(role.completion_date) === key && role.role_status === 'Filled').length,
        });
        return map;
      }, new Map<string, { month: string; roles: number; candidates: number; filled: number }>())
      .values(),
  ).slice(-6);

  const oldestActive = [...activeRoles].sort((a, b) => roleAging(b) - roleAging(a)).slice(0, 5);
  const recentCandidates = candidates.slice(0, 5);
  const recentRoles = roles.slice(0, 5);
  const secondaryMetrics: Array<{ label: string; value: number; icon: LucideIcon }> = [
    { label: 'Total Clients', value: clients.length, icon: Users },
    { label: 'Active Clients', value: clients.filter((client) => client.client_status === 'Active').length, icon: CheckCircle2 },
    { label: 'Total Roles', value: roles.length, icon: BriefcaseBusiness },
    { label: 'Selected Candidates', value: candidateCounts.selected, icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <section className="grid gap-5 xl:grid-cols-3">
        <KpiCard label="Active Roles" value={activeRoles.length} detail={`${filledRoles.length} filled roles`} icon={BriefcaseBusiness} />
        <KpiCard label="Total Candidates Shared" value={candidateCounts.total} detail={`${candidateCounts.pending} pending feedback`} icon={Users} />
        <KpiCard label="Average Active Aging" value={`${averageAging}d`} detail={`${activeRoleStatuses.join(', ')} roles`} icon={Clock} />
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {secondaryMetrics.map(({ label, value, icon: Icon }) => (
          <div key={label} className="glass-panel p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <Icon className="text-brand-600" size={18} />
            </div>
            <div className="mt-3 text-2xl font-semibold">{value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="glass-panel p-5 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Monthly Recruitment Activity</h2>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid stroke="#eef0f3" vertical={false} />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="roles" stroke="#d01d24" strokeWidth={2} />
                <Line type="monotone" dataKey="candidates" stroke="#151922" strokeWidth={2} />
                <Line type="monotone" dataKey="filled" stroke="#059669" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-panel p-5">
          <h2 className="mb-4 font-semibold">Candidates by Status</h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={candidatesByStatus} dataKey="value" nameKey="name" innerRadius={64} outerRadius={92} paddingAngle={4}>
                  {candidatesByStatus.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass-panel p-5">
          <h2 className="mb-4 font-semibold">Roles by Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={rolesByStatus}>
                <CartesianGrid stroke="#eef0f3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#d01d24" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="glass-panel p-5">
          <h2 className="mb-4 font-semibold">Role Aging Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agingDistribution}>
                <CartesianGrid stroke="#eef0f3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#151922" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="glass-panel overflow-hidden xl:col-span-1">
          <div className="border-b border-slate-100 p-5 font-semibold">Oldest Active Roles</div>
          {oldestActive.map((role) => (
            <div key={role.id} className="border-b border-slate-100 p-4 last:border-0">
              <div className="font-semibold">{role.job_title}</div>
              <div className="mt-1 text-sm text-slate-500">{clientName(role.client_id, clients)}</div>
              <div className="mt-3 flex items-center gap-2">
                <AgingBadge days={roleAging(role)} />
                <Badge label={role.role_status} />
              </div>
            </div>
          ))}
        </div>
        <div className="glass-panel overflow-hidden xl:col-span-2">
          <div className="border-b border-slate-100 p-5 font-semibold">Recent Activity</div>
          <div className="grid md:grid-cols-2">
            <div className="border-b border-slate-100 md:border-b-0 md:border-r">
              {recentCandidates.map((candidate) => {
                const role = roles.find((item) => item.id === candidate.role_id);
                return (
                  <div key={candidate.id} className="border-b border-slate-100 p-4 last:border-0">
                    <div className="font-semibold">{candidate.candidate_name}</div>
                    <div className="mt-1 text-sm text-slate-500">
                      {role?.job_title ?? 'Unknown role'} · {formatDate(candidate.date_shared)}
                    </div>
                    <div className="mt-2">
                      <Badge label={candidate.status} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div>
              {recentRoles.map((role) => (
                <div key={role.id} className="border-b border-slate-100 p-4 last:border-0">
                  <div className="font-semibold">{role.job_title}</div>
                  <div className="mt-1 text-sm text-slate-500">
                    {clientName(role.client_id, clients)} · {formatDate(role.role_received_date)}
                  </div>
                  <div className="mt-2">
                    <Badge label={role.role_status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

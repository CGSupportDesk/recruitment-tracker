import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { AgingBadge, Badge } from '../components/Badge';
import { clientName, countsForRole, downloadCsv, formatDate, roleAging, roleStatuses } from '../lib/domain';
import type { CandidateSubmission, Client, Role } from '../types/recruitment';

interface ReportsPageProps {
  clients: Client[];
  roles: Role[];
  candidates: CandidateSubmission[];
}

const reportTypes = [
  'Client-wise Role Summary',
  'Role Aging Report',
  'Role Status Report',
  'Candidate Submission Report',
  'Monthly Recruitment Activity',
];

export function ReportsPage({ clients, roles, candidates }: ReportsPageProps) {
  const [reportType, setReportType] = useState(reportTypes[0]);
  const [clientId, setClientId] = useState('All');
  const [status, setStatus] = useState('All');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const filteredRoles = useMemo(
    () =>
      roles.filter((role) => {
        const matchesClient = clientId === 'All' || role.client_id === clientId;
        const matchesStatus = status === 'All' || role.role_status === status;
        const matchesFrom = !from || role.role_received_date >= from;
        const matchesTo = !to || role.role_received_date <= to;
        return matchesClient && matchesStatus && matchesFrom && matchesTo;
      }),
    [clientId, from, roles, status, to],
  );

  const rows = useMemo(() => {
    if (reportType === 'Client-wise Role Summary') {
      return clients
        .filter((client) => clientId === 'All' || client.id === clientId)
        .map((client) => {
          const scopedRoles = roles.filter((role) => role.client_id === client.id);
          const roleIds = scopedRoles.map((role) => role.id);
          return {
            Client: client.client_name,
            Status: client.client_status,
            'Total Roles': scopedRoles.length,
            'Active Roles': scopedRoles.filter((role) => ['Open', 'In Progress', 'On Hold'].includes(role.role_status)).length,
            'Candidates Shared': candidates.filter((candidate) => roleIds.includes(candidate.role_id)).length,
          };
        });
    }

    if (reportType === 'Candidate Submission Report') {
      return candidates
        .filter((candidate) => {
          const role = roles.find((item) => item.id === candidate.role_id);
          return role && filteredRoles.some((item) => item.id === role.id);
        })
        .map((candidate) => {
          const role = roles.find((item) => item.id === candidate.role_id);
          return {
            Candidate: candidate.candidate_name,
            Client: role ? clientName(role.client_id, clients) : '',
            Role: role?.job_title ?? '',
            'Date Shared': formatDate(candidate.date_shared),
            Status: candidate.status,
            Remarks: candidate.remarks ?? '',
          };
        });
    }

    if (reportType === 'Monthly Recruitment Activity') {
      const months = new Map<string, { Month: string; 'New Roles': number; 'Candidates Shared': number; 'Roles Filled': number }>();
      filteredRoles.forEach((role) => {
        const key = new Date(`${role.role_received_date}T00:00:00`).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
        const row = months.get(key) ?? { Month: key, 'New Roles': 0, 'Candidates Shared': 0, 'Roles Filled': 0 };
        row['New Roles'] += 1;
        row['Candidates Shared'] += candidates.filter((candidate) => candidate.role_id === role.id).length;
        row['Roles Filled'] += role.role_status === 'Filled' ? 1 : 0;
        months.set(key, row);
      });
      return Array.from(months.values());
    }

    return filteredRoles.map((role) => {
      const counts = countsForRole(role.id, candidates);
      return {
        Client: clientName(role.client_id, clients),
        Role: role.job_title,
        Received: formatDate(role.role_received_date),
        Aging: `${roleAging(role)} days`,
        Budget: role.budget ?? '',
        Openings: role.openings,
        Shared: counts.total,
        Selected: counts.selected,
        Pending: counts.pending,
        Rejected: counts.rejected,
        Status: role.role_status,
      };
    });
  }, [candidates, clientId, clients, filteredRoles, reportType, roles]);

  return (
    <section className="glass-panel overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-100 p-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-semibold">Reports</h2>
          <p className="mt-1 text-sm text-slate-500">Filter operational reports and export CSV files.</p>
        </div>
        <button className="btn-primary" disabled={!rows.length} onClick={() => downloadCsv(`${reportType.toLowerCase().replace(/\s+/g, '-')}.csv`, rows)}>
          <Download size={16} />
          Export CSV
        </button>
      </div>
      <div className="grid gap-3 border-b border-slate-100 p-4 md:grid-cols-5">
        <select className="field" value={reportType} onChange={(event) => setReportType(event.target.value)}>
          {reportTypes.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <select className="field" value={clientId} onChange={(event) => setClientId(event.target.value)}>
          <option>All</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.client_name}
            </option>
          ))}
        </select>
        <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option>All</option>
          {roleStatuses.map((item) => (
            <option key={item}>{item}</option>
          ))}
        </select>
        <input type="date" className="field" value={from} onChange={(event) => setFrom(event.target.value)} />
        <input type="date" className="field" value={to} onChange={(event) => setTo(event.target.value)} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead className="table-head">
            <tr>
              {Object.keys(rows[0] ?? { Report: '' }).map((heading) => (
                <th key={heading} className="px-4 py-3">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index} className="hover:bg-slate-50">
                {Object.entries(row).map(([key, value]) => (
                  <td key={key} className="table-cell">
                    {key === 'Status' && typeof value === 'string' && ['Active', 'Inactive', 'On Hold', ...roleStatuses, 'Pending', 'Selected', 'Rejected'].includes(value) ? (
                      <Badge label={value as never} />
                    ) : key === 'Aging' && typeof value === 'string' ? (
                      <AgingBadge days={Number(value.split(' ')[0]) || 0} />
                    ) : (
                      value
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

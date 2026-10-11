import { useMemo, useState } from 'react';
import { Edit3, FileText, Plus, Search, Trash2, UserPlus } from 'lucide-react';
import { AgingBadge, Badge } from '../components/Badge';
import { CandidateForm, RoleForm } from '../components/Forms';
import { Modal } from '../components/Modal';
import { candidateStatuses, clientName, countsForRole, formatDate, roleAging, roleStatuses } from '../lib/domain';
import type { CandidateStatus, CandidateSubmission, Client, Role, RoleStatus } from '../types/recruitment';

interface RolesPageProps {
  clients: Client[];
  roles: Role[];
  candidates: CandidateSubmission[];
  actions: {
    createRole: (payload: Omit<Role, 'id' | 'completion_date' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateRole: (id: string, payload: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
    deleteRole: (id: string) => Promise<void>;
    createCandidate: (payload: Omit<CandidateSubmission, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateCandidate: (id: string, payload: Partial<Omit<CandidateSubmission, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
    deleteCandidate: (id: string) => Promise<void>;
  };
}

export function RolesPage({ clients, roles, candidates, actions }: RolesPageProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(roles[0]?.id ?? null);
  const [roleModal, setRoleModal] = useState<Role | null | 'new'>(null);
  const [candidateModal, setCandidateModal] = useState(false);
  const [expanded, setExpanded] = useState<'jd' | 'notes' | null>(null);

  const filtered = useMemo(
    () =>
      roles.filter((role) => {
        const haystack = `${role.job_title} ${clientName(role.client_id, clients)} ${role.budget ?? ''}`.toLowerCase();
        return haystack.includes(query.toLowerCase()) && (status === 'All' || role.role_status === status);
      }),
    [clients, query, roles, status],
  );
  const selectedRole = selectedRoleId ? roles.find((role) => role.id === selectedRoleId) ?? null : null;
  const roleCandidates = selectedRole ? candidates.filter((candidate) => candidate.role_id === selectedRole.id) : [];
  const counts = selectedRole ? countsForRole(selectedRole.id, candidates) : null;

  async function deleteRole(role: Role) {
    if (window.confirm(`Delete ${role.job_title}?`)) {
      await actions.deleteRole(role.id);
      setSelectedRoleId(null);
    }
  }

  async function deleteCandidate(candidate: CandidateSubmission) {
    if (window.confirm(`Delete ${candidate.candidate_name}?`)) {
      await actions.deleteCandidate(candidate.id);
    }
  }

  return (
    <div className="grid gap-6 2xl:grid-cols-[1fr_440px]">
      <section className="glass-panel overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Roles</h2>
            <p className="mt-1 text-sm text-slate-500">Manage requirements, status, aging, and shared candidates.</p>
          </div>
          <button className="btn-primary" onClick={() => setRoleModal('new')}>
            <Plus size={16} />
            Add Role
          </button>
        </div>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input className="field pl-9" placeholder="Search roles" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <select className="field md:w-48" value={status} onChange={(event) => setStatus(event.target.value)}>
            {['All', ...roleStatuses].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px]">
            <thead className="table-head">
              <tr>
                {['Client', 'Role', 'Received', 'Aging', 'Budget', 'Openings', 'Shared', 'Selected', 'Pending', 'Rejected', 'Status', ''].map(
                  (heading) => (
                    <th key={heading} className="px-4 py-3">
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((role) => {
                const roleCounts = countsForRole(role.id, candidates);
                return (
                  <tr key={role.id} className="cursor-pointer hover:bg-slate-50" onClick={() => setSelectedRoleId(role.id)}>
                    <td className="table-cell">{clientName(role.client_id, clients)}</td>
                    <td className="table-cell font-semibold">{role.job_title}</td>
                    <td className="table-cell">{formatDate(role.role_received_date)}</td>
                    <td className="table-cell">
                      <AgingBadge days={roleAging(role)} />
                    </td>
                    <td className="table-cell">{role.budget || '-'}</td>
                    <td className="table-cell">{role.openings}</td>
                    <td className="table-cell">{roleCounts.total}</td>
                    <td className="table-cell">{roleCounts.selected}</td>
                    <td className="table-cell">{roleCounts.pending}</td>
                    <td className="table-cell">{roleCounts.rejected}</td>
                    <td className="table-cell">
                      <select
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs"
                        value={role.role_status}
                        onClick={(event) => event.stopPropagation()}
                        onChange={(event) => actions.updateRole(role.id, { role_status: event.target.value as RoleStatus })}
                      >
                        {roleStatuses.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                    </td>
                    <td className="table-cell">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                          onClick={(event) => {
                            event.stopPropagation();
                            setRoleModal(role);
                          }}
                          aria-label="Edit role"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="rounded-md p-2 text-brand-600 hover:bg-brand-50"
                          onClick={(event) => {
                            event.stopPropagation();
                            void deleteRole(role);
                          }}
                          aria-label="Delete role"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="glass-panel overflow-hidden">
        {selectedRole && counts ? (
          <>
            <div className="border-b border-slate-100 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="label">{clientName(selectedRole.client_id, clients)}</p>
                  <h2 className="mt-2 text-xl font-semibold">{selectedRole.job_title}</h2>
                </div>
                <AgingBadge days={roleAging(selectedRole)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <select
                  className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                  value={selectedRole.role_status}
                  onChange={(event) => actions.updateRole(selectedRole.id, { role_status: event.target.value as RoleStatus })}
                >
                  {roleStatuses.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
                <Badge label={selectedRole.priority} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 p-5 text-sm">
              {[
                ['Received', formatDate(selectedRole.role_received_date)],
                ['Budget', selectedRole.budget || '-'],
                ['Openings', selectedRole.openings],
                ['Experience', selectedRole.experience_required || '-'],
                ['Location', selectedRole.job_location || '-'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3">
                  <div className="label">{label}</div>
                  <div className="mt-1 font-semibold">{value}</div>
                </div>
              ))}
            </div>
            <div className="border-y border-slate-100 px-5 py-3">
              <button className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600" onClick={() => setExpanded(expanded === 'jd' ? null : 'jd')}>
                <FileText size={16} />
                View JD
              </button>
              {expanded === 'jd' && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{selectedRole.job_description || 'No JD added.'}</p>}
              <button className="ml-5 text-sm font-semibold text-slate-600" onClick={() => setExpanded(expanded === 'notes' ? null : 'notes')}>
                Notes
              </button>
              {expanded === 'notes' && <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-600">{selectedRole.internal_notes || 'No notes added.'}</p>}
            </div>
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="font-semibold">Candidates Shared</h3>
                <button className="btn-primary px-3 py-2" onClick={() => setCandidateModal(true)}>
                  <UserPlus size={16} />
                  Add
                </button>
              </div>
              <div className="mb-4 grid grid-cols-4 gap-2">
                {[
                  ['Total', counts.total],
                  ['Pending', counts.pending],
                  ['Selected', counts.selected],
                  ['Rejected', counts.rejected],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-slate-50 p-3 text-center">
                    <div className="text-lg font-semibold">{value}</div>
                    <div className="text-[10px] uppercase tracking-[0.06em] text-slate-500">{label}</div>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {roleCandidates.map((candidate) => (
                  <div key={candidate.id} className="rounded-lg border border-slate-100 p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <input
                          className="w-full rounded-md border border-transparent px-1 py-1 font-semibold outline-none focus:border-slate-200"
                          defaultValue={candidate.candidate_name}
                          onBlur={(event) => {
                            if (event.target.value !== candidate.candidate_name) actions.updateCandidate(candidate.id, { candidate_name: event.target.value });
                          }}
                        />
                        <input
                          type="date"
                          className="mt-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-500"
                          value={candidate.date_shared}
                          onChange={(event) => actions.updateCandidate(candidate.id, { date_shared: event.target.value })}
                        />
                      </div>
                      <button className="rounded-md p-2 text-brand-600 hover:bg-brand-50" onClick={() => void deleteCandidate(candidate)} aria-label="Delete candidate">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <select
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs"
                        value={candidate.status}
                        onChange={(event) => actions.updateCandidate(candidate.id, { status: event.target.value as CandidateStatus })}
                      >
                        {candidateStatuses.map((item) => (
                          <option key={item}>{item}</option>
                        ))}
                      </select>
                      <input
                        className="min-w-0 flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs"
                        placeholder="Remarks"
                        defaultValue={candidate.remarks ?? ''}
                        onBlur={(event) => actions.updateCandidate(candidate.id, { remarks: event.target.value || null })}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">Select a role to manage its details and candidates.</div>
        )}
      </aside>

      <Modal title={roleModal === 'new' ? 'Add Role' : 'Edit Role'} open={Boolean(roleModal)} onClose={() => setRoleModal(null)} width="lg">
        <RoleForm
          clients={clients}
          role={roleModal === 'new' ? null : roleModal}
          onSubmit={(payload) => (roleModal && roleModal !== 'new' ? actions.updateRole(roleModal.id, payload) : actions.createRole(payload))}
          onDone={() => setRoleModal(null)}
        />
      </Modal>
      <Modal title="Add Candidate" open={candidateModal} onClose={() => setCandidateModal(false)}>
        {selectedRole && <CandidateForm roleId={selectedRole.id} onSubmit={actions.createCandidate} onDone={() => setCandidateModal(false)} />}
      </Modal>
    </div>
  );
}

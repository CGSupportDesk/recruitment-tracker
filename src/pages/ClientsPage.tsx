import { useMemo, useState } from 'react';
import { BriefcaseBusiness, Edit3, Plus, Search, Trash2 } from 'lucide-react';
import { Badge } from '../components/Badge';
import { ClientForm, RoleForm } from '../components/Forms';
import { Modal } from '../components/Modal';
import { formatDate, statsForClient } from '../lib/domain';
import type { CandidateSubmission, Client, Role } from '../types/recruitment';

interface ClientsPageProps {
  clients: Client[];
  roles: Role[];
  candidates: CandidateSubmission[];
  actions: {
    createClient: (payload: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
    updateClient: (id: string, payload: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>) => Promise<void>;
    deleteClient: (id: string) => Promise<void>;
    createRole: (payload: Omit<Role, 'id' | 'completion_date' | 'created_at' | 'updated_at'>) => Promise<void>;
  };
}

export function ClientsPage({ clients, roles, candidates, actions }: ClientsPageProps) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] ?? null);
  const [clientModal, setClientModal] = useState<Client | null | 'new'>(null);
  const [roleModal, setRoleModal] = useState<Client | null>(null);

  const filtered = useMemo(
    () =>
      clients.filter((client) => {
        const matchesQuery = [client.client_name, client.contact_person, client.contact_email].some((value) =>
          (value ?? '').toLowerCase().includes(query.toLowerCase()),
        );
        const matchesStatus = status === 'All' || client.client_status === status;
        return matchesQuery && matchesStatus;
      }),
    [clients, query, status],
  );

  const activeClient = selectedClient && clients.find((client) => client.id === selectedClient.id);
  const clientRoles = activeClient ? roles.filter((role) => role.client_id === activeClient.id) : [];

  async function deleteClient(client: Client) {
    if (window.confirm(`Delete ${client.client_name} and its roles?`)) {
      await actions.deleteClient(client.id);
      setSelectedClient(null);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <section className="glass-panel overflow-hidden">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Clients</h2>
            <p className="mt-1 text-sm text-slate-500">Search, filter, and manage client accounts.</p>
          </div>
          <button className="btn-primary" onClick={() => setClientModal('new')}>
            <Plus size={16} />
            Add Client
          </button>
        </div>
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input className="field pl-9" placeholder="Search clients" value={query} onChange={(event) => setQuery(event.target.value)} />
          </label>
          <select className="field md:w-44" value={status} onChange={(event) => setStatus(event.target.value)}>
            {['All', 'Active', 'Inactive', 'On Hold'].map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px]">
            <thead className="table-head">
              <tr>
                {['Client', 'Onboarded', 'Active Roles', 'Total Roles', 'Candidates Shared', 'Status', ''].map((heading) => (
                  <th key={heading} className="px-4 py-3">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((client) => {
                const stats = statsForClient(client.id, roles, candidates);
                return (
                  <tr
                    key={client.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => setSelectedClient(client)}
                  >
                    <td className="table-cell font-semibold">{client.client_name}</td>
                    <td className="table-cell">{formatDate(client.onboarding_date)}</td>
                    <td className="table-cell">{stats.activeRoles}</td>
                    <td className="table-cell">{stats.totalRoles}</td>
                    <td className="table-cell">{stats.candidatesShared}</td>
                    <td className="table-cell">
                      <Badge label={client.client_status} />
                    </td>
                    <td className="table-cell">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-md p-2 text-slate-500 hover:bg-slate-100"
                          onClick={(event) => {
                            event.stopPropagation();
                            setClientModal(client);
                          }}
                          aria-label="Edit client"
                        >
                          <Edit3 size={16} />
                        </button>
                        <button
                          className="rounded-md p-2 text-brand-600 hover:bg-brand-50"
                          onClick={(event) => {
                            event.stopPropagation();
                            void deleteClient(client);
                          }}
                          aria-label="Delete client"
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

      <aside className="glass-panel p-5">
        {activeClient ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="label">Client detail</p>
                <h2 className="mt-2 text-xl font-semibold">{activeClient.client_name}</h2>
                <p className="mt-1 text-sm text-slate-500">{activeClient.contact_person || 'No contact person'}</p>
              </div>
              <Badge label={activeClient.client_status} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                ['Roles', clientRoles.length],
                ['Active', clientRoles.filter((role) => ['Open', 'In Progress', 'On Hold'].includes(role.role_status)).length],
                ['Shared', statsForClient(activeClient.id, roles, candidates).candidatesShared],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 p-3">
                  <div className="text-lg font-semibold">{value}</div>
                  <div className="text-[11px] uppercase tracking-[0.08em] text-slate-500">{label}</div>
                </div>
              ))}
            </div>
            <button className="btn-primary mt-5 w-full" onClick={() => setRoleModal(activeClient)}>
              <BriefcaseBusiness size={16} />
              Add Role
            </button>
            <div className="mt-5 space-y-3">
              {clientRoles.map((role) => (
                <div key={role.id} className="rounded-lg border border-slate-100 p-3">
                  <div className="font-semibold">{role.job_title}</div>
                  <div className="mt-1 text-xs text-slate-500">{formatDate(role.role_received_date)}</div>
                  <div className="mt-3">
                    <Badge label={role.role_status} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-sm text-slate-500">Select a client to view roles and contact details.</div>
        )}
      </aside>

      <Modal title={clientModal === 'new' ? 'Add Client' : 'Edit Client'} open={Boolean(clientModal)} onClose={() => setClientModal(null)} width="lg">
        <ClientForm
          client={clientModal === 'new' ? null : clientModal}
          onSubmit={(payload) =>
            clientModal && clientModal !== 'new' ? actions.updateClient(clientModal.id, payload) : actions.createClient(payload)
          }
          onDone={() => setClientModal(null)}
        />
      </Modal>

      <Modal title="Add Role" open={Boolean(roleModal)} onClose={() => setRoleModal(null)} width="lg">
        <RoleForm clients={clients} defaultClientId={roleModal?.id} onSubmit={actions.createRole} onDone={() => setRoleModal(null)} />
      </Modal>
    </div>
  );
}

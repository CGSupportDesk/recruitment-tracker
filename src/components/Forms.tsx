import { useEffect, useState, type FormEvent } from 'react';
import { Save } from 'lucide-react';
import { candidateStatuses, roleStatuses, toDateInputValue } from '../lib/domain';
import type {
  CandidateSubmission,
  CandidateStatus,
  Client,
  ClientStatus,
  Role,
  RolePriority,
  RoleStatus,
} from '../types/recruitment';

const clientStatuses: ClientStatus[] = ['Active', 'Inactive', 'On Hold'];
const priorities: RolePriority[] = ['Low', 'Medium', 'High', 'Urgent'];

interface ClientFormProps {
  client?: Client | null;
  onSubmit: (payload: Omit<Client, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onDone: () => void;
}

export function ClientForm({ client, onSubmit, onDone }: ClientFormProps) {
  const [form, setForm] = useState({
    client_name: '',
    onboarding_date: toDateInputValue(),
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    client_status: 'Active' as ClientStatus,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        client_name: client.client_name,
        onboarding_date: toDateInputValue(client.onboarding_date),
        contact_person: client.contact_person ?? '',
        contact_email: client.contact_email ?? '',
        contact_phone: client.contact_phone ?? '',
        client_status: client.client_status,
        notes: client.notes ?? '',
      });
    }
  }, [client]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    await onSubmit({
      ...form,
      contact_person: form.contact_person || null,
      contact_email: form.contact_email || null,
      contact_phone: form.contact_phone || null,
      notes: form.notes || null,
    });
    setSaving(false);
    onDone();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">Client name</span>
          <input required className="field mt-1" value={form.client_name} onChange={(e) => setForm({ ...form, client_name: e.target.value })} />
        </label>
        <label>
          <span className="label">Onboarding date</span>
          <input
            required
            type="date"
            className="field mt-1"
            value={form.onboarding_date}
            onChange={(e) => setForm({ ...form, onboarding_date: e.target.value })}
          />
        </label>
        <label>
          <span className="label">Contact person</span>
          <input className="field mt-1" value={form.contact_person} onChange={(e) => setForm({ ...form, contact_person: e.target.value })} />
        </label>
        <label>
          <span className="label">Contact email</span>
          <input type="email" className="field mt-1" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
        </label>
        <label>
          <span className="label">Contact phone</span>
          <input className="field mt-1" value={form.contact_phone} onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
        </label>
        <label>
          <span className="label">Status</span>
          <select
            className="field mt-1"
            value={form.client_status}
            onChange={(e) => setForm({ ...form, client_status: e.target.value as ClientStatus })}
          >
            {clientStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        <span className="label">Notes</span>
        <textarea className="field mt-1 min-h-24" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </label>
      <div className="flex justify-end gap-3">
        <button type="button" className="btn-outline" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          <Save size={16} />
          Save client
        </button>
      </div>
    </form>
  );
}

interface RoleFormProps {
  clients: Client[];
  role?: Role | null;
  defaultClientId?: string;
  onSubmit: (payload: Omit<Role, 'id' | 'completion_date' | 'created_at' | 'updated_at'>) => Promise<void>;
  onDone: () => void;
}

export function RoleForm({ clients, role, defaultClientId, onSubmit, onDone }: RoleFormProps) {
  const [form, setForm] = useState({
    client_id: defaultClientId || clients[0]?.id || '',
    job_title: '',
    role_received_date: toDateInputValue(),
    budget: '',
    openings: 1,
    experience_required: '',
    job_location: '',
    priority: 'Medium' as RolePriority,
    role_status: 'Open' as RoleStatus,
    job_description: '',
    internal_notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (role) {
      setForm({
        client_id: role.client_id,
        job_title: role.job_title,
        role_received_date: toDateInputValue(role.role_received_date),
        budget: role.budget ?? '',
        openings: role.openings,
        experience_required: role.experience_required ?? '',
        job_location: role.job_location ?? '',
        priority: role.priority,
        role_status: role.role_status,
        job_description: role.job_description ?? '',
        internal_notes: role.internal_notes ?? '',
      });
    } else {
      setForm((current) => ({ ...current, client_id: defaultClientId || clients[0]?.id || '' }));
    }
  }, [clients, defaultClientId, role]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    await onSubmit({
      ...form,
      openings: Number(form.openings) || 1,
      budget: form.budget || null,
      experience_required: form.experience_required || null,
      job_location: form.job_location || null,
      job_description: form.job_description || null,
      internal_notes: form.internal_notes || null,
    });
    setSaving(false);
    onDone();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2">
        <label>
          <span className="label">Client</span>
          <select required className="field mt-1" value={form.client_id} onChange={(e) => setForm({ ...form, client_id: e.target.value })}>
            <option value="" disabled>
              Select client
            </option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.client_name}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Job title</span>
          <input required className="field mt-1" value={form.job_title} onChange={(e) => setForm({ ...form, job_title: e.target.value })} />
        </label>
        <label>
          <span className="label">Received date</span>
          <input
            required
            type="date"
            className="field mt-1"
            value={form.role_received_date}
            onChange={(e) => setForm({ ...form, role_received_date: e.target.value })}
          />
        </label>
        <label>
          <span className="label">Budget</span>
          <input className="field mt-1" placeholder="12 LPA" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
        </label>
        <label>
          <span className="label">Openings</span>
          <input
            type="number"
            min={1}
            className="field mt-1"
            value={form.openings}
            onChange={(e) => setForm({ ...form, openings: Number(e.target.value) })}
          />
        </label>
        <label>
          <span className="label">Experience</span>
          <input className="field mt-1" value={form.experience_required} onChange={(e) => setForm({ ...form, experience_required: e.target.value })} />
        </label>
        <label>
          <span className="label">Location</span>
          <input className="field mt-1" value={form.job_location} onChange={(e) => setForm({ ...form, job_location: e.target.value })} />
        </label>
        <label>
          <span className="label">Priority</span>
          <select className="field mt-1" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as RolePriority })}>
            {priorities.map((priority) => (
              <option key={priority}>{priority}</option>
            ))}
          </select>
        </label>
        <label>
          <span className="label">Status</span>
          <select className="field mt-1" value={form.role_status} onChange={(e) => setForm({ ...form, role_status: e.target.value as RoleStatus })}>
            {roleStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        <span className="label">Job description</span>
        <textarea className="field mt-1 min-h-24" value={form.job_description} onChange={(e) => setForm({ ...form, job_description: e.target.value })} />
      </label>
      <label>
        <span className="label">Internal notes</span>
        <textarea className="field mt-1 min-h-20" value={form.internal_notes} onChange={(e) => setForm({ ...form, internal_notes: e.target.value })} />
      </label>
      <div className="flex justify-end gap-3">
        <button type="button" className="btn-outline" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={saving || !clients.length}>
          <Save size={16} />
          Save role
        </button>
      </div>
    </form>
  );
}

interface CandidateFormProps {
  candidate?: CandidateSubmission | null;
  onSubmit: (payload: Omit<CandidateSubmission, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  onDone: () => void;
  roleId: string;
}

export function CandidateForm({ candidate, onSubmit, onDone, roleId }: CandidateFormProps) {
  const [form, setForm] = useState({
    candidate_name: candidate?.candidate_name ?? '',
    date_shared: candidate?.date_shared ? toDateInputValue(candidate.date_shared) : toDateInputValue(),
    status: (candidate?.status ?? 'Pending') as CandidateStatus,
    remarks: candidate?.remarks ?? '',
  });
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    await onSubmit({
      role_id: roleId,
      ...form,
      remarks: form.remarks || null,
    });
    setSaving(false);
    onDone();
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <label>
        <span className="label">Candidate name</span>
        <input required className="field mt-1" value={form.candidate_name} onChange={(e) => setForm({ ...form, candidate_name: e.target.value })} />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="label">Date shared</span>
          <input required type="date" className="field mt-1" value={form.date_shared} onChange={(e) => setForm({ ...form, date_shared: e.target.value })} />
        </label>
        <label>
          <span className="label">Status</span>
          <select className="field mt-1" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as CandidateStatus })}>
            {candidateStatuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
      </div>
      <label>
        <span className="label">Remarks</span>
        <textarea className="field mt-1 min-h-20" value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} />
      </label>
      <div className="flex justify-end gap-3">
        <button type="button" className="btn-outline" onClick={onDone}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          <Save size={16} />
          Save candidate
        </button>
      </div>
    </form>
  );
}

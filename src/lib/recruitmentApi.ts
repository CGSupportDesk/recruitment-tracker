import { apiFetch } from './apiClient';
import type { CandidateSubmission, Client, Role } from '../types/recruitment';

export async function fetchRecruitmentData() {
  return apiFetch<{
    clients: Client[];
    roles: Role[];
    candidates: CandidateSubmission[];
  }>('/api/data');
}

export async function createClientRecord(payload: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
  await apiFetch('/api/clients', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateClientRecord(id: string, payload: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>) {
  await apiFetch(`/api/client?id=${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteClientRecord(id: string) {
  await apiFetch(`/api/client?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function createRoleRecord(payload: Omit<Role, 'id' | 'completion_date' | 'created_at' | 'updated_at'>) {
  await apiFetch('/api/roles', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateRoleRecord(id: string, payload: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>) {
  await apiFetch(`/api/role?id=${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteRoleRecord(id: string) {
  await apiFetch(`/api/role?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function createCandidateRecord(payload: Omit<CandidateSubmission, 'id' | 'created_at' | 'updated_at'>) {
  await apiFetch('/api/candidates', { method: 'POST', body: JSON.stringify(payload) });
}

export async function updateCandidateRecord(
  id: string,
  payload: Partial<Omit<CandidateSubmission, 'id' | 'created_at' | 'updated_at'>>,
) {
  await apiFetch(`/api/candidate?id=${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(payload) });
}

export async function deleteCandidateRecord(id: string) {
  await apiFetch(`/api/candidate?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
}

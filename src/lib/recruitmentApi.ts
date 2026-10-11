import { supabase } from './supabase';
import type { CandidateSubmission, Client, Profile, Role } from '../types/recruitment';

function requireSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
  return supabase;
}

function throwIfError(error: unknown) {
  if (error && typeof error === 'object' && 'message' in error) {
    throw new Error(String((error as { message: unknown }).message));
  }
}

export async function getSession() {
  const client = requireSupabase();
  const { data, error } = await client.auth.getSession();
  throwIfError(error);
  return data.session;
}

export async function fetchProfile(userId: string): Promise<Profile | null> {
  const client = requireSupabase();
  const { data, error } = await client.from('profiles').select('*').eq('id', userId).maybeSingle();
  throwIfError(error);
  return data;
}

export async function fetchRecruitmentData() {
  const client = requireSupabase();
  const [clients, roles, candidates] = await Promise.all([
    client.from('clients').select('*').order('onboarding_date', { ascending: false }),
    client.from('roles').select('*').order('role_received_date', { ascending: false }),
    client.from('candidate_submissions').select('*').order('date_shared', { ascending: false }),
  ]);

  throwIfError(clients.error);
  throwIfError(roles.error);
  throwIfError(candidates.error);

  return {
    clients: (clients.data ?? []) as Client[],
    roles: (roles.data ?? []) as Role[],
    candidates: (candidates.data ?? []) as CandidateSubmission[],
  };
}

export async function createClientRecord(payload: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
  const client = requireSupabase();
  const { error } = await client.from('clients').insert(payload);
  throwIfError(error);
}

export async function updateClientRecord(id: string, payload: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>) {
  const client = requireSupabase();
  const { error } = await client.from('clients').update(payload).eq('id', id);
  throwIfError(error);
}

export async function deleteClientRecord(id: string) {
  const client = requireSupabase();
  const { error } = await client.from('clients').delete().eq('id', id);
  throwIfError(error);
}

export async function createRoleRecord(payload: Omit<Role, 'id' | 'completion_date' | 'created_at' | 'updated_at'>) {
  const client = requireSupabase();
  const { error } = await client.from('roles').insert(payload);
  throwIfError(error);
}

export async function updateRoleRecord(id: string, payload: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>) {
  const client = requireSupabase();
  const { error } = await client.from('roles').update(payload).eq('id', id);
  throwIfError(error);
}

export async function deleteRoleRecord(id: string) {
  const client = requireSupabase();
  const { error } = await client.from('roles').delete().eq('id', id);
  throwIfError(error);
}

export async function createCandidateRecord(payload: Omit<CandidateSubmission, 'id' | 'created_at' | 'updated_at'>) {
  const client = requireSupabase();
  const { error } = await client.from('candidate_submissions').insert(payload);
  throwIfError(error);
}

export async function updateCandidateRecord(
  id: string,
  payload: Partial<Omit<CandidateSubmission, 'id' | 'created_at' | 'updated_at'>>,
) {
  const client = requireSupabase();
  const { error } = await client.from('candidate_submissions').update(payload).eq('id', id);
  throwIfError(error);
}

export async function deleteCandidateRecord(id: string) {
  const client = requireSupabase();
  const { error } = await client.from('candidate_submissions').delete().eq('id', id);
  throwIfError(error);
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createCandidateRecord,
  createClientRecord,
  createRoleRecord,
  deleteCandidateRecord,
  deleteClientRecord,
  deleteRoleRecord,
  fetchRecruitmentData,
  updateCandidateRecord,
  updateClientRecord,
  updateRoleRecord,
} from './recruitmentApi';
import type { CandidateSubmission, Client, Role } from '../types/recruitment';

export function useRecruitmentData(enabled: boolean) {
  const [clients, setClients] = useState<Client[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [candidates, setCandidates] = useState<CandidateSubmission[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecruitmentData();
      setClients(data.clients);
      setRoles(data.roles);
      setCandidates(data.candidates);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Unable to load recruitment data.');
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const actions = useMemo(
    () => ({
      async createClient(payload: Omit<Client, 'id' | 'created_at' | 'updated_at'>) {
        await createClientRecord(payload);
        await refresh();
      },
      async updateClient(id: string, payload: Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>) {
        await updateClientRecord(id, payload);
        await refresh();
      },
      async deleteClient(id: string) {
        await deleteClientRecord(id);
        await refresh();
      },
      async createRole(payload: Omit<Role, 'id' | 'completion_date' | 'created_at' | 'updated_at'>) {
        await createRoleRecord(payload);
        await refresh();
      },
      async updateRole(id: string, payload: Partial<Omit<Role, 'id' | 'created_at' | 'updated_at'>>) {
        await updateRoleRecord(id, payload);
        await refresh();
      },
      async deleteRole(id: string) {
        await deleteRoleRecord(id);
        await refresh();
      },
      async createCandidate(payload: Omit<CandidateSubmission, 'id' | 'created_at' | 'updated_at'>) {
        await createCandidateRecord(payload);
        await refresh();
      },
      async updateCandidate(
        id: string,
        payload: Partial<Omit<CandidateSubmission, 'id' | 'created_at' | 'updated_at'>>,
      ) {
        await updateCandidateRecord(id, payload);
        await refresh();
      },
      async deleteCandidate(id: string) {
        await deleteCandidateRecord(id);
        await refresh();
      },
      refresh,
    }),
    [refresh],
  );

  return { clients, roles, candidates, loading, error, actions };
}

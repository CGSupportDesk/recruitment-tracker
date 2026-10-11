export type ClientStatus = 'Active' | 'Inactive' | 'On Hold';
export type RolePriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type RoleStatus = 'Open' | 'In Progress' | 'On Hold' | 'Filled' | 'Closed' | 'Cancelled';
export type CandidateStatus = 'Pending' | 'Selected' | 'Rejected';
export type StaffRole = 'admin' | 'staff';

export interface Client {
  id: string;
  client_name: string;
  onboarding_date: string;
  contact_person: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  client_status: ClientStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  client_id: string;
  job_title: string;
  role_received_date: string;
  budget: string | null;
  openings: number;
  experience_required: string | null;
  job_location: string | null;
  priority: RolePriority;
  role_status: RoleStatus;
  job_description: string | null;
  internal_notes: string | null;
  completion_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface CandidateSubmission {
  id: string;
  role_id: string;
  candidate_name: string;
  date_shared: string;
  status: CandidateStatus;
  remarks: string | null;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  role: StaffRole;
  created_at: string;
  updated_at: string;
}

export interface ClientStats {
  activeRoles: number;
  totalRoles: number;
  candidatesShared: number;
}

export interface CandidateCounts {
  total: number;
  pending: number;
  selected: number;
  rejected: number;
}

export type Role = 'Admin' | 'Investigator' | 'Coordinator' | 'Data Manager' | 'Safety' | 'Regulatory';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
}

export interface Trial {
  id: string;
  name: string;
  phase: string;
  status: 'Draft' | 'Active' | 'Closed';
  pi_name: string;
  protocol_summary: Record<string, unknown> | null;
  created_at: string;
}

export interface TrialSite {
  id: string;
  trial_id: string;
  name: string;
  pi_name: string;
  target_enrollment: number;
  enrolled_count: number;
}

export interface Participant {
  id: string;
  trial_id: string;
  site_id: string;
  code: string;
  stage: 'Screening' | 'Eligible' | 'Consented' | 'Enrolled' | 'Randomized';
  prakriti: string | null;
  vikriti: string | null;
  dosha: string | null;
  agni: string | null;
  koshtha: string | null;
}

export interface Visit {
  id: string;
  participant_id: string;
  visit_label: string;
  scheduled_date: string;
  status: 'Scheduled' | 'Completed' | 'Missed' | 'Overdue';
  adherence: string | null;
  notes: string | null;
}

export interface AdverseEvent {
  id: string;
  participant_id: string;
  description: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  event_date: string;
  outcome: string;
}

export interface Alert {
  id: string;
  trial_id: string;
  severity: 'Critical' | 'High' | 'Medium';
  message: string;
  created_at: string;
  resolved: boolean;
}

export interface AuditLog {
  id: string;
  actor_name: string;
  action: string;
  created_at: string;
}

import { Participant } from '../types';

/**
 * Minimal, demonstration-only mapping from a TrialOps participant record to a
 * FHIR ResearchSubject resource. Extend this (and add Patient / ResearchStudy
 * mappings) before treating it as a real interoperability layer — see the
 * "Prototype / Compliance Note" in the original spec.
 */
export function toFhirResearchSubject(p: Participant) {
  return {
    resourceType: 'ResearchSubject',
    identifier: [{ value: p.code }],
    status: p.stage === 'Randomized' ? 'on-study' : 'candidate',
    study: { reference: `ResearchStudy/${p.trial_id}` },
    individual: { reference: `Patient/${p.code}` }
  };
}

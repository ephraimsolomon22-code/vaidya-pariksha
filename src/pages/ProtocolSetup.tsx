import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card } from '../components/ui/Primitives';

interface ExtractedFields {
  study_type: string;
  intervention: string;
  sample_size: number;
  primary_outcome: string;
  eligibility: string;
  visit_schedule: string[];
}

export default function ProtocolSetup() {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fields, setFields] = useState<ExtractedFields | null>(null);
  const [trialName, setTrialName] = useState('');

  async function extract() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      // 1. Store the protocol PDF in Supabase Storage.
      const path = `protocols/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from('documents').upload(path, file);
      if (upErr) throw upErr;

      // 2. Ask the extract-protocol Edge Function to read it and call Gemini.
      const { data, error: fnErr } = await supabase.functions.invoke('extract-protocol', {
        body: { storagePath: path }
      });
      if (fnErr) throw fnErr;
      setFields(data as ExtractedFields);
      setTrialName(file.name.replace(/\.pdf$/i, ''));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Extraction failed');
    } finally {
      setBusy(false);
    }
  }

  async function createTrial() {
    if (!fields) return;
    const { error: insErr } = await supabase.from('trials').insert({
      name: trialName,
      phase: fields.study_type,
      status: 'Draft',
      protocol_summary: fields
    });
    if (insErr) setError(insErr.message);
    else {
      setFields(null);
      setFile(null);
    }
  }

  return (
    <Card title="Upload protocol document">
      <p className="text-sm text-muted mb-3">
        Upload a trial protocol PDF. It's stored in Supabase Storage, then an Edge Function extracts key fields with
        Gemini. Review before the trial record is created.
      </p>
      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] ?? null)}
        className="text-sm mb-3"
      />
      <div>
        <button className="btn" disabled={!file || busy} onClick={extract}>
          {busy ? 'Extracting…' : 'Extract with Gemini'}
        </button>
      </div>
      {error && <p className="text-sm text-red mt-3">{error}</p>}

      {fields && (
        <div className="mt-5 border-t border-line pt-4">
          <h4 className="font-serifh text-base mb-3">Extracted fields — review before creating trial</h4>
          <label className="text-xs text-muted">Trial name</label>
          <input
            className="w-full border border-line rounded p-2 mt-1 mb-3 text-sm"
            value={trialName}
            onChange={(e) => setTrialName(e.target.value)}
          />
          <div className="grid grid-cols-2 gap-2 text-sm mb-4">
            <div>
              <b>Study type:</b> {fields.study_type}
            </div>
            <div>
              <b>Intervention:</b> {fields.intervention}
            </div>
            <div>
              <b>Sample size:</b> {fields.sample_size}
            </div>
            <div>
              <b>Primary outcome:</b> {fields.primary_outcome}
            </div>
            <div className="col-span-2">
              <b>Eligibility:</b> {fields.eligibility}
            </div>
            <div className="col-span-2">
              <b>Visit schedule:</b> {fields.visit_schedule.join(', ')}
            </div>
          </div>
          <button className="btn" onClick={createTrial}>
            Create trial
          </button>
        </div>
      )}
    </Card>
  );
}

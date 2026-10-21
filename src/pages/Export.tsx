import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card } from '../components/ui/Primitives';
import { toFhirResearchSubject } from '../lib/fhir';

export default function ExportPage() {
  const [fhirSample, setFhirSample] = useState<string | null>(null);

  async function generateFhir() {
    const { data } = await supabase.from('participants').select('*').limit(1).single();
    if (data) setFhirSample(JSON.stringify(toFhirResearchSubject(data), null, 2));
  }

  return (
    <>
      <Card title="Generate report">
        <p className="text-sm text-muted mb-3">
          Wire this button to a Supabase Edge Function that queries recruitment, safety and data-quality tables and
          renders a PDF (e.g. with a server-side PDF library), then stores it in Supabase Storage and returns a
          signed URL.
        </p>
        <button className="btn" onClick={() => alert('Hook this up to your report-generation Edge Function.')}>
          Generate report
        </button>
      </Card>

      <Card title="FHIR JSON export (sample)">
        <button className="btn mb-3" onClick={generateFhir}>
          Preview FHIR mapping for one participant
        </button>
        {fhirSample && <pre className="text-xs bg-[#0b423d0d] p-3 rounded overflow-x-auto">{fhirSample}</pre>}
        <p className="text-xs text-muted mt-2">
          Demonstration mapping only — not a certified FHIR/CDISC production export.
        </p>
      </Card>
    </>
  );
}

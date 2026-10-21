import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Trial } from '../types';
import { Card, Pill, severityTone } from '../components/ui/Primitives';

export default function Trials() {
  const [trials, setTrials] = useState<Trial[]>([]);

  useEffect(() => {
    supabase
      .from('trials')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setTrials((data as Trial[]) ?? []));
  }, []);

  return (
    <>
      {trials.length === 0 && <p className="text-sm text-muted">No trials yet — create one from AI Protocol Setup.</p>}
      {trials.map((t) => (
        <Card key={t.id} title={t.name}>
          <div className="grid grid-cols-2 gap-2 text-sm mb-3">
            <div>
              <b>Phase:</b> {t.phase}
            </div>
            <div>
              <b>Principal investigator:</b> {t.pi_name}
            </div>
          </div>
          <Pill text={t.status} tone={severityTone(t.status)} />
        </Card>
      ))}
    </>
  );
}

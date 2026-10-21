import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Participant } from '../types';
import { Card, Pill, severityTone } from '../components/ui/Primitives';

export default function Participants() {
  const [rows, setRows] = useState<Participant[]>([]);

  useEffect(() => {
    supabase.from('participants').select('*').then(({ data }) => setRows((data as Participant[]) ?? []));
  }, []);

  return (
    <Card title="Participants — screening → consent → enrollment → randomization">
      <table>
        <thead>
          <tr>
            <th>Code</th>
            <th>Stage</th>
            <th>Prakriti</th>
            <th>Vikriti</th>
            <th>Dosha</th>
            <th>Agni</th>
            <th>Koshtha</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => (
            <tr key={p.id}>
              <td>{p.code}</td>
              <td>
                <Pill text={p.stage} tone={severityTone(p.stage)} />
              </td>
              <td>{p.prakriti ?? '—'}</td>
              <td>{p.vikriti ?? '—'}</td>
              <td>{p.dosha ?? '—'}</td>
              <td>{p.agni ?? '—'}</td>
              <td>{p.koshtha ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

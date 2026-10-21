import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Visit } from '../types';
import { Card, Pill, severityTone } from '../components/ui/Primitives';

export default function Visits() {
  const [rows, setRows] = useState<Visit[]>([]);

  useEffect(() => {
    supabase
      .from('visits')
      .select('*')
      .order('scheduled_date')
      .then(({ data }) => setRows((data as Visit[]) ?? []));
  }, []);

  return (
    <Card title="Visits">
      <table>
        <thead>
          <tr>
            <th>Visit</th>
            <th>Date</th>
            <th>Adherence</th>
            <th>Status</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((v) => (
            <tr key={v.id}>
              <td>{v.visit_label}</td>
              <td>{v.scheduled_date}</td>
              <td>{v.adherence ?? '—'}</td>
              <td>
                <Pill text={v.status} tone={severityTone(v.status)} />
              </td>
              <td>{v.notes ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { TrialSite } from '../types';
import { Card, Pill } from '../components/ui/Primitives';

export default function Sites() {
  const [sites, setSites] = useState<TrialSite[]>([]);

  useEffect(() => {
    supabase.from('trial_sites').select('*').then(({ data }) => setSites((data as TrialSite[]) ?? []));
  }, []);

  return (
    <Card title="Sites">
      <table>
        <thead>
          <tr>
            <th>Site</th>
            <th>PI</th>
            <th>Target</th>
            <th>Enrolled</th>
            <th>Performance</th>
          </tr>
        </thead>
        <tbody>
          {sites.map((s) => {
            const onTrack = s.enrolled_count >= s.target_enrollment * 0.6;
            return (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{s.pi_name}</td>
                <td>{s.target_enrollment}</td>
                <td>{s.enrolled_count}</td>
                <td>
                  <Pill text={onTrack ? 'On track' : 'Behind'} tone={onTrack ? 'green' : 'amber'} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Card>
  );
}

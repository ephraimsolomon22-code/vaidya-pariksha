import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, Pill } from '../components/ui/Primitives';

interface EthicsRow {
  id: string;
  trial_id: string;
  trial_name: string;
  approval_status: string;
  ctri_number: string;
  responsible_user: string;
}

export default function Ethics() {
  const [rows, setRows] = useState<EthicsRow[]>([]);

  useEffect(() => {
    supabase
      .from('ethics_reviews')
      .select('id, trial_id, approval_status, ctri_number, responsible_user, trials(name)')
      .then(({ data }) => {
        setRows((data ?? []).map((r: any) => ({ ...r, trial_name: r.trials?.name ?? r.trial_id })));
      });
  }, []);

  return (
    <Card title="Ethics & regulatory tracking">
      <table>
        <thead>
          <tr>
            <th>Trial</th>
            <th>Ethics approval</th>
            <th>CTRI registration</th>
            <th>Responsible user</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.trial_name}</td>
              <td>
                <Pill text={r.approval_status} tone={r.approval_status === 'Approved' ? 'green' : 'amber'} />
              </td>
              <td>{r.ctri_number}</td>
              <td>{r.responsible_user}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

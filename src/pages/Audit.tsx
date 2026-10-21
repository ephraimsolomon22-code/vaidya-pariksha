import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AuditLog } from '../types';
import { Card } from '../components/ui/Primitives';

export default function Audit() {
  const [rows, setRows] = useState<AuditLog[]>([]);

  useEffect(() => {
    supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100)
      .then(({ data }) => setRows((data as AuditLog[]) ?? []));
  }, []);

  return (
    <Card title="Audit log">
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>User</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.id}>
              <td>{new Date(a.created_at).toLocaleString()}</td>
              <td>{a.actor_name}</td>
              <td>{a.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

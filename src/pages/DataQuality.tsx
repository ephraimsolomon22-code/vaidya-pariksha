import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, Pill, severityTone } from '../components/ui/Primitives';

interface DQIssue {
  id: string;
  issue: string;
  affected_record: string;
  issue_type: 'Missing' | 'Duplicate' | 'Inconsistent' | 'Overdue';
  severity: 'High' | 'Medium';
  resolved: boolean;
}

export default function DataQuality() {
  const [rows, setRows] = useState<DQIssue[]>([]);

  useEffect(() => {
    supabase
      .from('data_quality_issues')
      .select('*')
      .eq('resolved', false)
      .then(({ data }) => setRows((data as DQIssue[]) ?? []));
  }, []);

  return (
    <Card title="Data Quality Guardian">
      <p className="text-sm text-muted mb-3">
        Finds missing, duplicate, inconsistent and overdue records. In production this table is populated by a
        scheduled Supabase Edge Function (or DB triggers) that scan <code>visits</code>, <code>participants</code>
        and <code>clinical_observations</code> for gaps.
      </p>
      <table>
        <thead>
          <tr>
            <th>Issue</th>
            <th>Affected record</th>
            <th>Type</th>
            <th>Severity</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.id}>
              <td>{d.issue}</td>
              <td>{d.affected_record}</td>
              <td>{d.issue_type}</td>
              <td>
                <Pill text={d.severity} tone={severityTone(d.severity)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

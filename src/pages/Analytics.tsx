import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card } from '../components/ui/Primitives';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export default function Analytics() {
  const [siteData, setSiteData] = useState<{ name: string; enrolled: number }[]>([]);
  const [recruitment, setRecruitment] = useState<{ week: string; count: number }[]>([]);

  useEffect(() => {
    supabase
      .from('trial_sites')
      .select('name, enrolled_count')
      .then(({ data }) => setSiteData((data ?? []).map((s: any) => ({ name: s.name, enrolled: s.enrolled_count }))));

    // Recruitment-over-time is best served by a Postgres view (e.g. weekly_enrollment)
    // that buckets participants.created_at by week. See schema.sql for the view definition.
    supabase
      .from('weekly_enrollment')
      .select('*')
      .then(({ data }) => setRecruitment((data ?? []).map((r: any) => ({ week: r.week_label, count: r.cumulative }))));
  }, []);

  return (
    <>
      <Card title="Recruitment curve">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={recruitment}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ece7d9" />
            <XAxis dataKey="week" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#13615a" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card title="Site comparison">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={siteData}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="enrolled" fill="#13615a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      <p className="text-xs text-muted">
        Safety trends, visit adherence and risk heatmaps follow the same pattern: query a Postgres view or table and
        render it with Recharts (or swap in ECharts for the heatmap, which Recharts doesn't support natively).
      </p>
    </>
  );
}

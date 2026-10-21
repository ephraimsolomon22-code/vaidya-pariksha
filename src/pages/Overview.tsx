import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAlerts } from '../lib/useAlerts';
import { Card, Pill, severityTone, StatCard } from '../components/ui/Primitives';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { FlaskConical, Users, Sparkles, HeartPulse } from 'lucide-react';

export default function Overview() {
  const { alerts } = useAlerts();
  const [kpis, setKpis] = useState({ trials: 0, participants: 0, dqIssues: 0, openAes: 0 });
  const [siteData, setSiteData] = useState<{ name: string; enrolled: number; target: number }[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: trials }, { count: participants }, { count: dqIssues }, { count: openAes }, { data: sites }] =
        await Promise.all([
          supabase.from('trials').select('*', { count: 'exact', head: true }),
          supabase.from('participants').select('*', { count: 'exact', head: true }),
          supabase.from('data_quality_issues').select('*', { count: 'exact', head: true }).eq('resolved', false),
          supabase.from('adverse_events').select('*', { count: 'exact', head: true }).neq('outcome', 'Resolved'),
          supabase.from('trial_sites').select('name, enrolled_count, target_enrollment')
        ]);
      setKpis({ trials: trials ?? 0, participants: participants ?? 0, dqIssues: dqIssues ?? 0, openAes: openAes ?? 0 });
      setSiteData((sites ?? []).map((s: any) => ({ name: s.name, enrolled: s.enrolled_count, target: s.target_enrollment })));
    })();
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-serifh text-2xl">Overview</h1>
        <p className="text-sm text-muted mt-0.5">Live snapshot across all active trials.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Active trials" value={kpis.trials} icon={FlaskConical} />
        <StatCard label="Enrolled participants" value={kpis.participants} icon={Users} />
        <StatCard label="Open data-quality issues" value={kpis.dqIssues} icon={Sparkles} tone="amber" />
        <StatCard label="Open safety events" value={kpis.openAes} icon={HeartPulse} tone="red" />
      </div>

      <Card title="Smart alerts">
        {alerts.length === 0 && <p className="text-sm text-muted">No alerts right now.</p>}
        {alerts.map((a) => (
          <div key={a.id} className="flex items-center justify-between py-2 border-b border-[#eee9db] last:border-0 text-sm">
            <span>{a.message}</span>
            <Pill text={a.severity} tone={severityTone(a.severity)} />
          </div>
        ))}
      </Card>

      <Card title="Recruitment by site">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={siteData}>
            <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#736c5c' }} axisLine={{ stroke: '#e4dfd0' }} />
            <YAxis tick={{ fontSize: 11, fill: '#736c5c' }} axisLine={{ stroke: '#e4dfd0' }} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e4dfd0', fontSize: 13 }} />
            <Bar dataKey="enrolled" fill="#13615a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}

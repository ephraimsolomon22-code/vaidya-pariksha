import { ReactNode } from 'react';

export function Card({ title, action, children }: { title?: string; action?: ReactNode; children: ReactNode }) {
  return (
    <div className="card mb-5">
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="font-serifh text-base text-ink">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

export function Pill({ text, tone }: { text: string; tone: 'red' | 'amber' | 'green' | 'grey' }) {
  return <span className={`pill pill-${tone}`}>{text}</span>;
}

export function severityTone(s: string): 'red' | 'amber' | 'green' | 'grey' {
  if (s === 'Critical' || s === 'High' || s === 'Severe' || s === 'Overdue') return 'red';
  if (s === 'Medium' || s === 'Moderate') return 'amber';
  if (s === 'Low' || s === 'Mild' || s === 'Completed' || s === 'Active' || s === 'On track') return 'green';
  return 'grey';
}

export function Table<T extends Record<string, unknown>>({
  columns,
  rows,
  empty
}: {
  columns: { key: keyof T; label: string; render?: (row: T) => ReactNode }[];
  rows: T[];
  empty?: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted py-6 text-center">{empty ?? 'Nothing here yet.'}</p>;
  }
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={String(c.key)}>{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={String(c.key)}>{c.render ? c.render(row) : String(row[c.key] ?? '')}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, tone = 'teal' }: { label: string; value: string | number; icon: any; tone?: 'teal' | 'red' | 'amber' }) {
  const bg = tone === 'red' ? 'bg-[#f8e0e0] text-red' : tone === 'amber' ? 'bg-[#f8ecd4] text-amber' : 'bg-teal-light text-teal-dark';
  return (
    <div className="card flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl2 flex items-center justify-center shrink-0 ${bg}`}>
        <Icon size={20} />
      </div>
      <div>
        <div className="text-2xl font-serifh leading-none">{value}</div>
        <div className="text-xs text-muted mt-1">{label}</div>
      </div>
    </div>
  );
}

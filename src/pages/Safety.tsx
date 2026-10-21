import { FormEvent, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { AdverseEvent, Participant } from '../types';
import { Card, Pill, severityTone } from '../components/ui/Primitives';

export default function Safety() {
  const [rows, setRows] = useState<AdverseEvent[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [form, setForm] = useState({ participant_id: '', description: '', severity: 'Mild', event_date: '' });

  async function load() {
    const [{ data: aes }, { data: ps }] = await Promise.all([
      supabase.from('adverse_events').select('*').order('event_date', { ascending: false }),
      supabase.from('participants').select('*')
    ]);
    setRows((aes as AdverseEvent[]) ?? []);
    setParticipants((ps as Participant[]) ?? []);
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!form.participant_id || !form.description || !form.event_date) return;
    await supabase.from('adverse_events').insert({ ...form, outcome: 'Ongoing' });
    // A DB trigger (see schema.sql) raises a Critical/High alert automatically for Severe events.
    setForm({ participant_id: '', description: '', severity: 'Mild', event_date: '' });
    load();
  }

  return (
    <>
      <Card title="Adverse events">
        <table>
          <thead>
            <tr>
              <th>Participant</th>
              <th>Description</th>
              <th>Severity</th>
              <th>Date</th>
              <th>Outcome</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id}>
                <td>{a.participant_id}</td>
                <td>{a.description}</td>
                <td>
                  <Pill text={a.severity} tone={severityTone(a.severity)} />
                </td>
                <td>{a.event_date}</td>
                <td>{a.outcome}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card title="Log new adverse event">
        <form onSubmit={submit} className="grid grid-cols-2 gap-3 text-sm">
          <select
            className="border border-line rounded p-2"
            value={form.participant_id}
            onChange={(e) => setForm({ ...form, participant_id: e.target.value })}
          >
            <option value="">Select participant…</option>
            {participants.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code}
              </option>
            ))}
          </select>
          <select
            className="border border-line rounded p-2"
            value={form.severity}
            onChange={(e) => setForm({ ...form, severity: e.target.value })}
          >
            <option>Mild</option>
            <option>Moderate</option>
            <option>Severe</option>
          </select>
          <input
            className="border border-line rounded p-2 col-span-2"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <input
            type="date"
            className="border border-line rounded p-2"
            value={form.event_date}
            onChange={(e) => setForm({ ...form, event_date: e.target.value })}
          />
          <button className="btn" type="submit">
            Log event
          </button>
        </form>
      </Card>
    </>
  );
}

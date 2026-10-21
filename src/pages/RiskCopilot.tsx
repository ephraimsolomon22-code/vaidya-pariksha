import { FormEvent, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Card, Pill } from '../components/ui/Primitives';

interface Msg {
  role: 'user' | 'assistant';
  text: string;
}

export default function RiskCopilot() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [question, setQuestion] = useState('');
  const [busy, setBusy] = useState(false);

  async function ask(e: FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;
    const q = question;
    setMessages((m) => [...m, { role: 'user', text: q }]);
    setQuestion('');
    setBusy(true);
    try {
      // The Edge Function pulls current trial/site/participant/visit data and passes
      // it to Gemini as context so the copilot answers from real trial data.
      const { data, error } = await supabase.functions.invoke('ai-copilot', { body: { question: q } });
      if (error) throw error;
      setMessages((m) => [...m, { role: 'assistant', text: data.answer as string }]);
    } catch (err) {
      setMessages((m) => [...m, { role: 'assistant', text: 'Sorry, I could not reach the copilot service.' }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Card title="Risk engine — flags">
        <div className="text-sm space-y-2">
          <div className="flex justify-between border-b border-[#ece7d9] pb-2">
            <span>Recruitment slowdown detected at a trial site</span>
            <Pill text="High" tone="red" />
          </div>
          <div className="flex justify-between border-b border-[#ece7d9] pb-2">
            <span>Overdue visits pending follow-up</span>
            <Pill text="High" tone="red" />
          </div>
          <div className="flex justify-between">
            <span>Open data-quality issues</span>
            <Pill text="Medium" tone="amber" />
          </div>
        </div>
        <p className="text-xs text-muted mt-3">
          These flags are computed by a Supabase Edge Function / scheduled job that reads recruitment pace, visit
          due-dates and open data-quality issues, then writes rows into the <code>risk_flags</code> table.
        </p>
      </Card>

      <Card title="AI Trial Copilot">
        <div className="text-sm space-y-2 mb-3 max-h-64 overflow-y-auto">
          {messages.map((m, i) => (
            <div key={i} className={m.role === 'user' ? 'text-right' : ''}>
              <span className={`inline-block rounded px-2 py-1 ${m.role === 'user' ? 'bg-[#eee9dc]' : 'bg-[#dcefe0]'}`}>
                {m.text}
              </span>
            </div>
          ))}
        </div>
        <form onSubmit={ask} className="flex gap-2">
          <input
            className="flex-1 border border-line rounded p-2 text-sm"
            placeholder="Ask about this trial… e.g. Which site has the lowest recruitment?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button className="btn" disabled={busy} type="submit">
            {busy ? '…' : 'Ask'}
          </button>
        </form>
      </Card>
    </>
  );
}

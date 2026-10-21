// Supabase Edge Function (Deno). Deploy with:
//   supabase functions deploy ai-copilot
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

Deno.serve(async (req) => {
  try {
    const { question } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Pull a compact snapshot of current trial data as grounding context —
    // this is what makes the copilot "trial-aware" instead of a generic chatbot.
    const [{ data: trials }, { data: sites }, { data: participants }, { data: visits }, { data: aes }] =
      await Promise.all([
        supabase.from('trials').select('id, name, status, phase'),
        supabase.from('trial_sites').select('name, target_enrollment, enrolled_count'),
        supabase.from('participants').select('stage'),
        supabase.from('visits').select('status'),
        supabase.from('adverse_events').select('severity, outcome')
      ]);

    const context = { trials, sites, participants, visits, adverse_events: aes };

    const prompt = `You are the AI Trial Copilot for a clinical trial management system.
Answer the researcher's question using ONLY the JSON data below. Be concise (2-3 sentences), factual, and
mention specific numbers or site names where relevant. If the data doesn't answer the question, say so.

DATA:
${JSON.stringify(context)}

QUESTION: ${question}`;

    const geminiRes = await fetch(`${GEMINI_URL}?key=${Deno.env.get('GEMINI_API_KEY')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    const geminiJson = await geminiRes.json();
    const answer = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No answer available.';

    return new Response(JSON.stringify({ answer }), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

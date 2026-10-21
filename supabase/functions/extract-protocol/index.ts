// Supabase Edge Function (Deno). Deploy with:
//   supabase functions deploy extract-protocol
// Requires a GEMINI_API_KEY secret:
//   supabase secrets set GEMINI_API_KEY=your-key
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

Deno.serve(async (req) => {
  try {
    const { storagePath } = await req.json();

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Download the PDF the client just uploaded, then base64-encode it for Gemini.
    const { data: file, error } = await supabase.storage.from('documents').download(storagePath);
    if (error) throw error;
    const bytes = new Uint8Array(await file.arrayBuffer());
    const base64 = btoa(String.fromCharCode(...bytes));

    const prompt = `You are extracting structured fields from a clinical trial protocol document.
Return ONLY minified JSON with exactly these keys:
study_type, intervention, sample_size (number), primary_outcome, eligibility, visit_schedule (array of strings).
No prose, no markdown fences.`;

    const geminiRes = await fetch(`${GEMINI_URL}?key=${Deno.env.get('GEMINI_API_KEY')}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: prompt },
              { inline_data: { mime_type: 'application/pdf', data: base64 } }
            ]
          }
        ]
      })
    });
    const geminiJson = await geminiRes.json();
    const text = geminiJson.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const fields = JSON.parse(cleaned);

    return new Response(JSON.stringify(fields), { headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});

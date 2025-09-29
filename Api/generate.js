export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt) return res.status(400).json({ error: 'prompt gerekli' });

    const GEMINI_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_KEY) return res.status(500).json({ error: 'Sunucuda GEMINI_API_KEY tanımlı değil' });

    const model = 'gemini-2.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

    const body = { contents: [{ parts: [{ text: prompt }] }] };

    const r = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_KEY
      },
      body: JSON.stringify(body)
    });

    if (!r.ok) return res.status(502).json({ error: 'API hatası' });

    const data = await r.json();
    let aiText = '';
    if (data.candidates?.length) {
      aiText = data.candidates.map(c => c.output?.[0]?.content?.[0]?.text ?? '').join('\n');
    } else if (data.output?.length) {
      aiText = data.output.map(o => o.content?.map(p => p.text).join(' ') ?? '').join('\n');
    } else aiText = data.text ?? '';
    return res.status(200).json({ text: aiText });
  } catch (err) {
    return res.status(500).json({ error: 'Sunucu hatası', details: err.message });
  }
                          }

// Vercel serverless function: veilige proxy naar de Anthropic API.
// De ANTHROPIC_API_KEY staat NIET in de browser-code, maar als environment
// variable in het Vercel-project (Project Settings -> Environment Variables).
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: 'ANTHROPIC_API_KEY ontbreekt in de Vercel environment variables.' });
    return;
  }

  const { system, messages, max_tokens } = req.body || {};
  if (!Array.isArray(messages)) {
    res.status(400).json({ error: 'messages array is verplicht.' });
    return;
  }

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: max_tokens || 600,
        system,
        messages,
      }),
    });
    const data = await upstream.json();
    res.status(upstream.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Onbekende fout bij het aanroepen van de AI.' });
  }
}

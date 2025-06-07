const API = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/messages';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const fetchRes = await fetch(API);
      const messages = await fetchRes.json();
      return res.status(200).json(messages);
    }

    if (req.method === 'POST') {
      const { username, name, text, fileUrl, fileName } = req.body;
      if (!username) {
        return res.status(400).json({ error: 'Invalid message' });
      }

      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, name, text: text || '', fileUrl, fileName })
      });

      return res.status(201).json({ success: true });
    }

    if (req.method === 'PUT') {
      const { id } = req.query;
      const { text } = req.body;
      if (!id || !text) return res.status(400).json({ error: 'Missing id or text' });

      // Update message text
      await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      });

      return res.status(200).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing ID' });

      // HARD delete message instead of editing text
      await fetch(`${API}/${id}`, {
        method: 'DELETE',
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

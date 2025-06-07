const API_URL = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/messages';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const response = await fetch(API_URL);
      const messages = await response.json();
      res.status(200).json(messages);
    } else if (req.method === 'POST') {
      const { username, text } = req.body;
      if (!username || !text) {
        return res.status(400).json({ error: 'Invalid message data' });
      }
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, text }),
      });
      res.status(201).json({ success: true });
    } else if (req.method === 'PUT') {
      // Update existing message text
      const { id, text } = req.body;
      if (!id || typeof text !== 'string') {
        return res.status(400).json({ error: 'Missing id or text' });
      }
      await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      res.status(200).json({ success: true });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
}

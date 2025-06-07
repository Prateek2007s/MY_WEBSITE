const API = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/messages';

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const fetchRes = await fetch(API);
      const messages = await fetchRes.json();
      // Return last 50 messages
      return res.status(200).json(messages.slice(-50));
    }

    if (req.method === 'POST') {
      const { username, content, type = 'text', fileUrl = null } = req.body;
      if (!username || (!content && !fileUrl)) {
        return res.status(400).json({ error: 'Invalid message data' });
      }

      const newMessage = {
        username,
        content: content || '',
        type,
        fileUrl,
        timestamp: new Date().toISOString(),
      };

      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMessage),
      });

      return res.status(201).json({ success: true });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: 'Missing message ID' });

      // Soft delete message by replacing content
      await fetch(`${API}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '[MESSAGE DELETED]', type: 'text', fileUrl: null }),
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method Not Allowed' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Server error' });
  }
}

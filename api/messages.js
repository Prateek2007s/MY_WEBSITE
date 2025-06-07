export default async function handler(req, res) {
  const API = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/messages';

  try {
    if (req.method === 'GET') {
      const response = await fetch(API);
      const data = await response.json();
      return res.status(200).json(data);
    }

    if (req.method === 'POST') {
      const { username, text, createdAt } = req.body;
      const response = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, text, createdAt })
      });
      const data = await response.json();
      return res.status(201).json(data);
    }

    return res.status(405).json({ message: 'Method not allowed' });
  } catch (error) {
    return res.status(500).json({ message: 'Server error', error });
  }
}

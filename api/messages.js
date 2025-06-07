// api/messages.js
import axios from 'axios';

export default async function handler(req, res) {
  const url = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/messages';

  if (req.method === 'GET') {
    const response = await axios.get(url);
    return res.status(200).json(response.data);
  }

  if (req.method === 'POST') {
    const { username, text } = req.body;
    const createdAt = new Date().toISOString();
    try {
      const response = await axios.post(url, { username, text, createdAt });
      return res.status(200).json(response.data);
    } catch (err) {
      return res.status(500).json({ message: 'Failed to send message' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

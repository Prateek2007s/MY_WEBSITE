// api/accounts.js
import axios from 'axios';

export default async function handler(req, res) {
  const { method } = req;

  if (method === 'POST') {
    const { name, username, email, password } = req.body;
    if (req.url.endsWith('/register')) {
      try {
        const response = await axios.post('https://6842adafe1347494c31d8de0.mockapi.io/api/v1/users', {
          name,
          username,
          email,
          password
        });
        return res.status(200).json({ message: 'Registered successfully' });
      } catch (err) {
        return res.status(500).json({ message: 'Registration failed' });
      }
    }

    if (req.url.endsWith('/login')) {
      try {
        const response = await axios.get('https://6842adafe1347494c31d8de0.mockapi.io/api/v1/users');
        const user = response.data.find(u => u.email === email && u.password === password);
        if (user) {
          return res.status(200).json({ name: user.name, username: user.username });
        }
        return res.status(401).json({ message: 'Invalid credentials' });
      } catch (err) {
        return res.status(500).json({ message: 'Login failed' });
      }
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}

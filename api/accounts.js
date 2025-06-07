// api/accounts.js

import express from 'express'; import fetch from 'node-fetch'; const router = express.Router();

const API_URL = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/users';

router.post('/', async (req, res) => { const { action, name, username, email, password } = req.body;

if (!email || !password) { return res.json({ success: false, message: 'Email and password are required.' }); }

try { const response = await fetch(API_URL); const users = await response.json();

if (action === 'register') {
  if (!name || !username) {
    return res.json({ success: false, message: 'Name and username are required.' });
  }

  if (/\s|#/.test(username)) {
    return res.json({ success: false, message: 'Username cannot contain spaces or #.' });
  }

  const userExists = users.find(u => u.email === email || u.username === username);
  if (userExists) {
    return res.json({ success: false, message: 'User already exists.' });
  }

  const newUserRes = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, username, email, password })
  });
  const newUser = await newUserRes.json();
  return res.json({ success: true, user: newUser });

} else if (action === 'login') {
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.json({ success: false, message: 'Invalid credentials.' });
  }
  return res.json({ success: true, user });
} else {
  return res.json({ success: false, message: 'Invalid action.' });
}

} catch (err) { console.error('Server error:', err); return res.json({ success: false, message: 'Server error.' }); } });

export default router;


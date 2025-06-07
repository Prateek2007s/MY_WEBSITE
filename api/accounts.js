// api/accounts.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

const USERS_API = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/users';

// Sign up
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existing = await axios.get(`${USERS_API}?email=${email}`);
    if (existing.data.length) return res.status(409).json({ error: 'Email already exists' });

    const newUser = await axios.post(USERS_API, { name, email, password });
    res.json(newUser.data);
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const users = await axios.get(`${USERS_API}?email=${email}`);
    const user = users.data.find(u => u.password === password);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;

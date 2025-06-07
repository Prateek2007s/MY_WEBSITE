// api/accounts.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_URL = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/users';

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existing = await axios.get(`${API_URL}?email=${email}`);
    if (existing.data.length > 0) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = await axios.post(API_URL, { name, email, password });
    res.json(user.data);
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const users = await axios.get(`${API_URL}?email=${email}`);
    const user = users.data[0];

    if (user && user.password === password) {
      res.json(user);
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = router;

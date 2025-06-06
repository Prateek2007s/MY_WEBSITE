// api/accounts.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

const API_BASE = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/users';

// Register
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const check = await axios.get(`${API_BASE}?email=${email}`);
    if (check.data.length > 0) return res.status(400).json({ message: 'Email already exists' });

    const user = await axios.post(API_BASE, { name, email, password });
    res.status(201).json(user.data);
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await axios.get(`${API_BASE}?email=${email}`);
    const user = result.data.find(u => u.password === password);
    if (user) res.json(user);
    else res.status(401).json({ message: 'Invalid credentials' });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

module.exports = router;

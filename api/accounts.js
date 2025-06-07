import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();
const API_BASE = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/users';

// Register
router.post('/register', async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Please fill all fields' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const checkRes = await fetch(`${API_BASE}?email=${email}`);
    const existing = await checkRes.json();

    if (existing.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const createRes = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    const user = await createRes.json();
    res.status(200).json({ message: 'Registered successfully', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const getRes = await fetch(`${API_BASE}?email=${email}`);
    const users = await getRes.json();

    if (users.length === 0 || users[0].password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ message: 'Login successful', user: users[0] });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;

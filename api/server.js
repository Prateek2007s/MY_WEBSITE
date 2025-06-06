// api/server.js

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch'); // need to install node-fetch@2
const app = express();

app.use(cors());
app.use(express.json());

const BASE_URL = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1';

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/messages`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

// Post new message
app.post('/api/messages', async (req, res) => {
  try {
    const { username, text } = req.body;
    const response = await fetch(`${BASE_URL}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, text, createdAt: new Date().toISOString() }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Get all users (for login validation)
app.get('/api/users', async (req, res) => {
  try {
    const response = await fetch(`${BASE_URL}/users`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Register new user
app.post('/api/users', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to register user' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`AntiChat server running on port ${PORT}`);
});

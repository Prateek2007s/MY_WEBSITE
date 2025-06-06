const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const app = express();
const router = express.Router();

const API_BASE = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1';

app.use(cors());
app.use(bodyParser.json());
app.use('/api', router);

// Register new user
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  const check = await fetch(`${API_BASE}/users?email=${email}`);
  const exists = await check.json();

  if (exists.length > 0) return res.status(409).json({ error: 'Email already registered' });

  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });

  const data = await response.json();
  res.json(data);
});

// Login user
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const check = await fetch(`${API_BASE}/users?email=${email}`);
  const users = await check.json();

  if (users.length === 0 || users[0].password !== password)
    return res.status(401).json({ error: 'Invalid credentials' });

  res.json(users[0]);
});

// Post message
router.post('/messages', async (req, res) => {
  const { username, text } = req.body;

  const response = await fetch(`${API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, text, createdAt: new Date().toISOString() }),
  });

  const data = await response.json();
  res.json(data);
});

// Get messages
router.get('/messages', async (_req, res) => {
  const response = await fetch(`${API_BASE}/messages`);
  const messages = await response.json();
  res.json(messages);
});

module.exports = app;
module.exports.handler = serverless(app);

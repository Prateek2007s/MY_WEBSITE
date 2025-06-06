const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const serverless = require('serverless-http');

const USERS_API = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/users';
const MESSAGES_API = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/messages';

app.use(cors());
app.use(express.json());

// Register
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const { data: users } = await axios.get(USERS_API);
    if (users.find(user => user.email === email)) {
      return res.status(409).json({ message: 'Email already registered' });
    }
    const { data: newUser } = await axios.post(USERS_API, { name, email, password });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ message: 'Registration failed' });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const { data: users } = await axios.get(USERS_API);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Login failed' });
  }
});

// Fetch messages
app.get('/messages', async (req, res) => {
  try {
    const { data } = await axios.get(MESSAGES_API);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get messages' });
  }
});

// Post message
app.post('/messages', async (req, res) => {
  const { username, text } = req.body;
  try {
    const { data: newMsg } = await axios.post(MESSAGES_API, {
      username,
      text,
      createdAt: new Date().toISOString()
    });
    res.status(201).json(newMsg);
  } catch (err) {
    res.status(500).json({ message: 'Failed to send message' });
  }
});

module.exports = app;
module.exports.handler = serverless(app);

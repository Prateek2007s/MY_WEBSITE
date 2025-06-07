// api/messages.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

const MESSAGES_API = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/messages';

// Get messages
router.get('/', async (req, res) => {
  try {
    const messages = await axios.get(MESSAGES_API);
    res.json(messages.data);
  } catch {
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// Post message
router.post('/', async (req, res) => {
  const { username, text } = req.body;
  try {
    const newMsg = await axios.post(MESSAGES_API, {
      username,
      text,
      createdAt: new Date().toISOString()
    });
    res.json(newMsg.data);
  } catch {
    res.status(500).json({ error: 'Message send failed' });
  }
});

module.exports = router;

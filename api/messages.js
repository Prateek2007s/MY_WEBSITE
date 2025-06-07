// api/messages.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

const MSG_URL = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/messages';

router.get('/', async (req, res) => {
  try {
    const response = await axios.get(MSG_URL);
    res.json(response.data);
  } catch {
    res.status(500).json({ error: 'Could not fetch messages' });
  }
});

router.post('/', async (req, res) => {
  const { username, text } = req.body;

  try {
    const message = await axios.post(MSG_URL, { username, text, createdAt: new Date() });
    res.json(message.data);
  } catch {
    res.status(500).json({ error: 'Could not send message' });
  }
});

module.exports = router;

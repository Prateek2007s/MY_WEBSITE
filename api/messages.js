// api/messages.js
const express = require('express');
const router = express.Router();
const axios = require('axios');

const MESSAGES_API = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/messages';

router.get('/', async (req, res) => {
  try {
    const response = await axios.get(MESSAGES_API);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

router.post('/', async (req, res) => {
  const { username, text } = req.body;
  try {
    const response = await axios.post(MESSAGES_API, {
      username,
      text,
      createdAt: new Date().toISOString()
    });
    res.status(201).json(response.data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to post message' });
  }
});

module.exports = router;

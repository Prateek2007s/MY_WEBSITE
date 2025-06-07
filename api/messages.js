// /api/messages.js
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const MOCKAPI_BASE = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/messages';

router.get('/', async (req, res) => {
  const r = await fetch(MOCKAPI_BASE);
  const data = await r.json();
  res.json(data);
});

router.post('/', async (req, res) => {
  const { username, text, createdAt } = req.body;
  const r = await fetch(MOCKAPI_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, text, createdAt })
  });
  const data = await r.json();
  res.json(data);
});

module.exports = router;

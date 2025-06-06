const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

const USERS_API = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/users';
const MSGS_API = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/messages';

app.use(cors());
app.use(bodyParser.json());

const axios = require('axios');

app.get('/api/users', async (req, res) => {
  const result = await axios.get(USERS_API);
  res.json(result.data);
});

app.post('/api/users', async (req, res) => {
  const result = await axios.post(USERS_API, req.body);
  res.json(result.data);
});

app.get('/api/messages', async (req, res) => {
  const result = await axios.get(MSGS_API);
  res.json(result.data);
});

app.post('/api/messages', async (req, res) => {
  const result = await axios.post(MSGS_API, req.body);
  res.json(result.data);
});

module.exports = app;
module.exports.handler = serverless(app);

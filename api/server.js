const express = require('express');
const serverless = require('serverless-http');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
const SECRET_KEY = 'supersecretkey123456'; // Change this before production!

// Since Vercel runs in a read-only environment except /tmp, 
// we will store files in /tmp/data instead of relative folder for writable access.
const DATA_DIR = path.join('/tmp', 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure /tmp/data directory and files exist on every cold start
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, '[]');

// Helpers
const readJSON = file => JSON.parse(fs.readFileSync(file, 'utf-8'));
const writeJSON = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');

function createToken(name) {
  return jwt.sign({ name }, SECRET_KEY, { expiresIn: '7d' });
}

function verifyToken(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.json({ success: false, message: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded.name;
    next();
  } catch {
    return res.json({ success: false, message: 'Invalid token' });
  }
}

// Routes

app.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.json({ success: false, message: 'Name, email, and password are required' });

  const users = readJSON(USERS_FILE);
  if (users.find(u => u.email === email)) return res.json({ success: false, message: 'Email already exists' });
  if (password.length < 8) return res.json({ success: false, message: 'Password must be at least 8 characters' });

  users.push({ name, email, password });
  writeJSON(USERS_FILE, users);
  res.json({ success: true, name, token: createToken(name) });
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.json({ success: false, message: 'Email and password required' });

  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.json({ success: false, message: 'Invalid email or password' });

  res.json({ success: true, name: user.name, token: createToken(user.name) });
});

app.get('/verify-token', verifyToken, (req, res) => {
  res.json({ success: true });
});

app.get('/messages', verifyToken, (req, res) => {
  const messages = readJSON(MESSAGES_FILE);
  res.json({ success: true, messages });
});

app.post('/messages', verifyToken, (req, res) => {
  const { text } = req.body;
  if (!text || text.trim() === '') return res.json({ success: false, message: 'Message text is required' });

  const messages = readJSON(MESSAGES_FILE);
  const newMessage = {
    id: crypto.randomUUID(),
    user: req.user,
    text: text.trim(),
    timestamp: Date.now()
  };
  messages.push(newMessage);
  writeJSON(MESSAGES_FILE, messages);

  res.json({ success: true });
});

app.delete('/messages/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  let messages = readJSON(MESSAGES_FILE);
  let found = false;

  messages = messages.map(msg => {
    if (msg.id === id && msg.user === req.user) {
      found = true;
      return { ...msg, text: '[MESSAGE DELETED]' };
    }
    return msg;
  });

  if (!found) return res.json({ success: false, message: 'Message not found or not authorized' });

  writeJSON(MESSAGES_FILE, messages);
  res.json({ success: true });
});

// Export handler for Vercel
module.exports = app;
module.exports.handler = serverless(app);

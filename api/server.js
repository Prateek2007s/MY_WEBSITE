const express = require('express');
const cors = require('cors');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const serverless = require('serverless-http');
const path = require('path');

const app = express();
const router = express.Router();

const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const MESSAGES_FILE = path.join(__dirname, 'data', 'messages.json');
const SECRET_KEY = 'antifiednull_super_secret';

app.use(cors());
app.use(bodyParser.json());

if (!fs.existsSync(path.dirname(USERS_FILE))) fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
if (!fs.existsSync(MESSAGES_FILE)) fs.writeFileSync(MESSAGES_FILE, '[]');

function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function loadMessages() {
  return JSON.parse(fs.readFileSync(MESSAGES_FILE));
}

function saveMessages(messages) {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// Middleware to verify token
function verifyToken(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch {
    res.status(403).json({ success: false, message: 'Invalid token' });
  }
}

// === ROUTES ===

// Sign Up
router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  const users = loadUsers();

  if (users.find(u => u.email === email)) {
    return res.json({ success: false, message: 'Email already registered' });
  }

  const newUser = { name, email, password };
  users.push(newUser);
  saveUsers(users);

  const token = jwt.sign({ email, name }, SECRET_KEY);
  res.json({ success: true, token, name });
});

// Login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const users = loadUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return res.json({ success: false, message: 'Invalid credentials' });

  const token = jwt.sign({ email: user.email, name: user.name }, SECRET_KEY);
  res.json({ success: true, token, name: user.name });
});

// Token verification
router.get('/verify-token', verifyToken, (req, res) => {
  res.json({ success: true, name: req.user.name });
});

// Get messages
router.get('/messages', verifyToken, (req, res) => {
  const messages = loadMessages();
  res.json({ messages });
});

// Post a message
router.post('/messages', verifyToken, (req, res) => {
  const { text } = req.body;
  const messages = loadMessages();
  const newMessage = {
    id: Date.now().toString(),
    user: req.user.name,
    text
  };
  messages.push(newMessage);
  saveMessages(messages);
  res.json({ success: true });
});

// Delete a message
router.delete('/messages/:id', verifyToken, (req, res) => {
  const id = req.params.id;
  const messages = loadMessages();
  const message = messages.find(m => m.id === id);

  if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
  if (message.user !== req.user.name) return res.status(403).json({ success: false, message: 'You can only delete your own messages' });

  message.text = '[MESSAGE DELETED]';
  saveMessages(messages);
  res.json({ success: true });
});

app.use('/api/server', router);

module.exports = serverless(app);

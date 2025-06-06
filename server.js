const express = require('express');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('.')); // serve current directory files like index.html, chat.html

const USERS_FILE = './users.json';
const MESSAGES_FILE = './messages.json';

const JWT_SECRET = 'your_super_secret_key_change_this';

// Load or initialize users
let users = {};
if (fs.existsSync(USERS_FILE)) {
  users = JSON.parse(fs.readFileSync(USERS_FILE));
} else {
  fs.writeFileSync(USERS_FILE, '{}');
}

// Load or initialize messages
let messages = [];
if (fs.existsSync(MESSAGES_FILE)) {
  messages = JSON.parse(fs.readFileSync(MESSAGES_FILE));
} else {
  fs.writeFileSync(MESSAGES_FILE, '[]');
}

// Helper: Save users
function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Helper: Save messages
function saveMessages() {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

// Middleware: Verify JWT token
function authenticate(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ success: false, message: 'No auth token' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Malformed auth token' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid token' });
    req.user = user;
    next();
  });
}

// Signup endpoint
app.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.json({ success: false, message: 'Missing fields' });
  if (users[email]) return res.json({ success: false, message: 'Email already registered' });

  try {
    const hashed = await bcrypt.hash(password, 10);
    users[email] = { name, email, password: hashed };
    saveUsers();

    const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ success: true, name, token });
  } catch (err) {
    res.json({ success: false, message: 'Error creating user' });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.json({ success: false, message: 'Missing fields' });

  const user = users[email];
  if (!user) return res.json({ success: false, message: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ success: false, message: 'Incorrect password' });

  const token = jwt.sign({ email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, name: user.name, token });
});

// Verify token endpoint
app.get('/verify-token', authenticate, (req, res) => {
  res.json({ success: true, name: req.user.name });
});

// Get messages
app.get('/messages', authenticate, (req, res) => {
  // Return messages with id, user, text (replace deleted texts)
  const safeMessages = messages.map(msg => ({
    id: msg.id,
    user: msg.user,
    text: msg.deleted ? '[MESSAGE DELETED]' : msg.text
  }));
  res.json({ success: true, messages: safeMessages });
});

// Post message
app.post('/messages', authenticate, (req, res) => {
  const text = (req.body.text || '').trim();
  if (!text) return res.json({ success: false, message: 'Empty message' });

  // Limit message length
  if (text.length > 500) return res.json({ success: false, message: 'Message too long' });

  // Add message
  const newMsg = {
    id: Date.now().toString() + Math.random().toString(36).slice(2,7),
    user: req.user.name,
    text,
    deleted: false
  };
  messages.push(newMsg);
  saveMessages();
  res.json({ success: true });
});

// Delete message (only owner)
app.delete('/messages/:id', authenticate, (req, res) => {
  const id = req.params.id;
  const msg = messages.find(m => m.id === id);
  if (!msg) return res.json({ success: false, message: 'Message not found' });
  if (msg.user !== req.user.name) return res.status(403).json({ success: false, message: 'Forbidden' });

  msg.text = '[MESSAGE DELETED]';
  msg.deleted = true;
  saveMessages();
  res.json({ success: true });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
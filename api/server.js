const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { parse } = require('url');

const USERS_FILE = '/tmp/users.json';
const MESSAGES_FILE = '/tmp/messages.json';
const JWT_SECRET = 'your_super_secret_key_change_this';

// Initialize users and messages
let users = {};
let messages = [];

function loadData() {
  if (fs.existsSync(USERS_FILE)) {
    users = JSON.parse(fs.readFileSync(USERS_FILE));
  } else {
    fs.writeFileSync(USERS_FILE, '{}');
  }

  if (fs.existsSync(MESSAGES_FILE)) {
    messages = JSON.parse(fs.readFileSync(MESSAGES_FILE));
  } else {
    fs.writeFileSync(MESSAGES_FILE, '[]');
  }
}

function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function saveMessages() {
  fs.writeFileSync(MESSAGES_FILE, JSON.stringify(messages, null, 2));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk.toString());
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (e) {
        reject(e);
      }
    });
  });
}

function send(res, status, data) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

function authenticate(req) {
  const auth = req.headers['authorization'] || '';
  const token = auth.split(' ')[1];
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

module.exports = async (req, res) => {
  loadData();
  const { pathname, query } = parse(req.url, true);

  if (req.method === 'POST' && pathname === '/api/signup') {
    const { name, email, password } = await parseBody(req);
    if (!name || !email || !password)
      return send(res, 400, { success: false, message: 'Missing fields' });

    if (users[email])
      return send(res, 409, { success: false, message: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    users[email] = { name, email, password: hashed };
    saveUsers();

    const token = jwt.sign({ email, name }, JWT_SECRET, { expiresIn: '7d' });
    return send(res, 200, { success: true, name, token });
  }

  if (req.method === 'POST' && pathname === '/api/login') {
    const { email, password } = await parseBody(req);
    if (!email || !password)
      return send(res, 400, { success: false, message: 'Missing fields' });

    const user = users[email];
    if (!user)
      return send(res, 404, { success: false, message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return send(res, 403, { success: false, message: 'Incorrect password' });

    const token = jwt.sign({ email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    return send(res, 200, { success: true, name: user.name, token });
  }

  if (req.method === 'GET' && pathname === '/api/verify-token') {
    const user = authenticate(req);
    if (!user) return send(res, 403, { success: false, message: 'Invalid token' });
    return send(res, 200, { success: true, name: user.name });
  }

  if (req.method === 'GET' && pathname === '/api/messages') {
    const user = authenticate(req);
    if (!user) return send(res, 403, { success: false, message: 'Invalid token' });

    const safeMessages = messages.map(msg => ({
      id: msg.id,
      user: msg.user,
      text: msg.deleted ? '[MESSAGE DELETED]' : msg.text
    }));
    return send(res, 200, { success: true, messages: safeMessages });
  }

  if (req.method === 'POST' && pathname === '/api/messages') {
    const user = authenticate(req);
    if (!user) return send(res, 403, { success: false, message: 'Invalid token' });

    const { text } = await parseBody(req);
    if (!text || text.trim().length === 0)
      return send(res, 400, { success: false, message: 'Empty message' });

    if (text.length > 500)
      return send(res, 400, { success: false, message: 'Message too long' });

    const newMsg = {
      id: Date.now().toString() + Math.random().toString(36).slice(2, 7),
      user: user.name,
      text: text.trim(),
      deleted: false
    };
    messages.push(newMsg);
    saveMessages();
    return send(res, 200, { success: true });
  }

  if (req.method === 'DELETE' && pathname.startsWith('/api/messages/')) {
    const user = authenticate(req);
    if (!user) return send(res, 403, { success: false, message: 'Invalid token' });

    const id = pathname.split('/').pop();
    const msg = messages.find(m => m.id === id);
    if (!msg) return send(res, 404, { success: false, message: 'Message not found' });
    if (msg.user !== user.name)
      return send(res, 403, { success: false, message: 'Forbidden' });

    msg.text = '[MESSAGE DELETED]';
    msg.deleted = true;
    saveMessages();
    return send(res, 200, { success: true });
  }

  return send(res, 404, { success: false, message: 'Route not found' });
};

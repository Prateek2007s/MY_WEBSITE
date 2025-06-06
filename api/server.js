const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const BASE_API = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1';

// Signup new user
app.post('/register', async (req, res) => {
    try {
        const response = await fetch(`${BASE_API}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to register' });
    }
});

// Login user
app.post('/login', async (req, res) => {
    try {
        const response = await fetch(`${BASE_API}/users`);
        const users = await response.json();
        const user = users.find(u => u.email === req.body.email && u.password === req.body.password);
        if (user) res.json(user);
        else res.status(401).json({ error: 'Invalid credentials' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to login' });
    }
});

// Get messages
app.get('/messages', async (req, res) => {
    try {
        const response = await fetch(`${BASE_API}/messages`);
        const messages = await response.json();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// Post new message
app.post('/messages', async (req, res) => {
    try {
        const response = await fetch(`${BASE_API}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: 'Failed to send message' });
    }
});

module.exports = app;

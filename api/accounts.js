const express = require('express');
const axios = require('axios');
const router = express.Router();

const USERS_API = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/users';

// Validate username format (no spaces or #)
function isValidUsername(username) {
  return /^[^\s#]+$/.test(username);
}

// Register
router.post('/register', async (req, res) => {
  const { name, username, email, password, confirmPassword } = req.body;

  if (!name || !username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required.' });
  }

  if (!isValidUsername(username)) {
    return res.status(400).json({ message: 'Username cannot contain spaces or #.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  try {
    const { data: existingUsers } = await axios.get(USERS_API);
    const alreadyExists = existingUsers.some(user =>
      user.email === email || user.username === username
    );

    if (alreadyExists) {
      return res.status(400).json({ message: 'Email or username already in use.' });
    }

    const newUser = { name, username, email, password };
    await axios.post(USERS_API, newUser);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed.' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const { data: users } = await axios.get(USERS_API);
    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ message: 'Invalid email or password.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Login failed.' });
  }
});

module.exports = router;

import express from 'express'
import fetch from 'node-fetch'

const router = express.Router()
const USERS_API = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/users'

// Register a new user
router.post('/register', async (req, res) => {
  const { name, username, email, password } = req.body

  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required.' })
  }

  if (/\s|#/.test(username)) {
    return res.status(400).json({ error: 'Username cannot contain spaces or "#"' })
  }

  try {
    const usersRes = await fetch(USERS_API)
    const users = await usersRes.json()

    const existingEmail = users.find(user => user.email === email)
    const existingUsername = users.find(user => user.username === username)

    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered.' })
    }
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken.' })
    }

    const createRes = await fetch(USERS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, username, email, password })
    })

    const createdUser = await createRes.json()
    return res.status(201).json({ username: createdUser.username })

  } catch (err) {
    console.error('Registration error:', err)
    return res.status(500).json({ error: 'Server error during registration.' })
  }
})

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  try {
    const usersRes = await fetch(USERS_API)
    const users = await usersRes.json()

    const user = users.find(u => u.email === email && u.password === password)

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials.' })
    }

    return res.json({ username: user.username })
  } catch (err) {
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Server error during login.' })
  }
})

export default router

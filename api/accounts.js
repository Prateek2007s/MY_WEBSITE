// api/accounts.js
import fetch from 'node-fetch';

const API_BASE = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1';

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, username, email, password } = body;

    if (!action || !email || !password) {
      return new Response(JSON.stringify({ success: false, message: 'Missing fields' }), { status: 400 });
    }

    // Validate username on register
    if (action === 'register') {
      if (!username) {
        return new Response(JSON.stringify({ success: false, message: 'Username required' }), { status: 400 });
      }
      // No spaces or # allowed in username
      if (/\s|#/.test(username)) {
        return new Response(JSON.stringify({ success: false, message: 'Username cannot contain spaces or #' }), { status: 400 });
      }

      // Check if email or username already exists
      const usersRes = await fetch(`${API_BASE}/users`);
      const users = await usersRes.json();

      if (users.find(u => u.email === email)) {
        return new Response(JSON.stringify({ success: false, message: 'Email already registered' }), { status: 409 });
      }
      if (users.find(u => u.username === username)) {
        return new Response(JSON.stringify({ success: false, message: 'Username already taken' }), { status: 409 });
      }

      // Create new user
      const createRes = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      if (!createRes.ok) {
        return new Response(JSON.stringify({ success: false, message: 'Registration failed' }), { status: 500 });
      }

      const newUser = await createRes.json();
      return new Response(JSON.stringify({ success: true, user: newUser }), { status: 201 });
    }

    // Login action
    if (action === 'login') {
      // Find user by email & password
      const usersRes = await fetch(`${API_BASE}/users`);
      const users = await usersRes.json();

      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid email or password' }), { status: 401 });
      }

      // Return user info without password
      const { password: _, ...userData } = user;
      return new Response(JSON.stringify({ success: true, user: userData }), { status: 200 });
    }

    return new Response(JSON.stringify({ success: false, message: 'Invalid action' }), { status: 400 });
  } catch (e) {
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), { status: 500 });
  }
}

// api/accounts.js
import fetch from 'node-fetch';

const API_BASE = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1';

export async function POST(req) {
  try {
    const body = await req.json();
    const { action, username, email, password, name } = body;

    if (!action || !email || !password) {
      return new Response(JSON.stringify({ success: false, message: 'Missing fields' }), { status: 400 });
    }

    if (action === 'register') {
      if (!username || !name) {
        return new Response(JSON.stringify({ success: false, message: 'Username and name required' }), { status: 400 });
      }

      if (/\s|#/.test(username)) {
        return new Response(JSON.stringify({ success: false, message: 'Username cannot contain spaces or #' }), { status: 400 });
      }

      // Check if username or email exists
      const usersRes = await fetch(`${API_BASE}/users`);
      const users = await usersRes.json();

      if (users.find(u => u.email === email)) {
        return new Response(JSON.stringify({ success: false, message: 'Email already registered' }), { status: 409 });
      }
      if (users.find(u => u.username === username)) {
        return new Response(JSON.stringify({ success: false, message: 'Username already taken' }), { status: 409 });
      }

      // Create new user with name field
      const createRes = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, name }),
      });

      if (!createRes.ok) {
        return new Response(JSON.stringify({ success: false, message: 'Registration failed' }), { status: 500 });
      }

      const newUser = await createRes.json();
      // Don't send password back
      delete newUser.password;

      return new Response(JSON.stringify({ success: true, user: newUser }), { status: 201 });
    }

    if (action === 'login') {
      const usersRes = await fetch(`${API_BASE}/users`);
      const users = await usersRes.json();

      const user = users.find(u => u.email === email && u.password === password);
      if (!user) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid email or password' }), { status: 401 });
      }

      delete user.password;
      return new Response(JSON.stringify({ success: true, user }), { status: 200 });
    }

    return new Response(JSON.stringify({ success: false, message: 'Invalid action' }), { status: 400 });
  } catch (e) {
    // Log error if possible
    console.error('accounts.js POST error:', e);
    return new Response(JSON.stringify({ success: false, message: 'Server error occurred' }), { status: 500 });
  }
}

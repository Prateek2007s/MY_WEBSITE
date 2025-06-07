export default async function handler(req, res) {
  const API = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/users';

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { name, username, email, password, action } = req.body;

  try {
    const userReq = await fetch(API);
    const users = await userReq.json();

    const emailExists = users.find(u => u.email === email);
    const usernameExists = users.find(u => u.username === username);

    if (action === 'register') {
      if (!name || !username || !email || !password) {
        return res.json({ success: false, message: 'All fields are required.' });
      }

      if (/\s|#/.test(username)) {
        return res.json({ success: false, message: 'Username cannot contain spaces or #' });
      }

      if (usernameExists) return res.json({ success: false, message: 'Username already taken.' });
      if (emailExists) return res.json({ success: false, message: 'Email already registered.' });

      await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password })
      });

      return res.json({ success: true, message: 'Registration successful.' });
    }

    if (action === 'login') {
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) return res.json({ success: false, message: 'Invalid email or password.' });

      return res.json({ success: true, message: 'Login successful.', name: user.name, username: user.username });
    }

    return res.status(400).json({ message: 'Invalid action.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
}

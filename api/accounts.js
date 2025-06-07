export default async function handler(req, res) {
  const API = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1/users';

  if (req.method !== 'POST') return res.status(405).json({ message: 'Method Not Allowed' });

  const { name, email, password, action } = req.body;

  try {
    const userReq = await fetch(API);
    const users = await userReq.json();
    const existingUser = users.find(u => u.email === email);

    if (action === 'register') {
      if (existingUser) return res.json({ success: false, message: 'Email already registered.' });
      const created = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      return res.json({ success: true, message: 'Registration successful.' });
    }

    if (action === 'login') {
      if (!existingUser || existingUser.password !== password) {
        return res.json({ success: false, message: 'Invalid email or password.' });
      }
      return res.json({ success: true, message: 'Login successful.' });
    }

    return res.status(400).json({ message: 'Invalid action.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Server error.' });
  }
}

// api/messages.js
import fetch from 'node-fetch';

const API_BASE = 'https://6842adafe1347494c31d8de0.mockapi.io/api/v1';

export async function GET(req) {
  try {
    const messagesRes = await fetch(`${API_BASE}/messages`);
    const messages = await messagesRes.json();
    return new Response(JSON.stringify({ success: true, messages }), { status: 200 });
  } catch {
    return new Response(JSON.stringify({ success: false, message: 'Failed to fetch messages' }), { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { username, message } = body;
    if (!username || !message) {
      return new Response(JSON.stringify({ success: false, message: 'Missing username or message' }), { status: 400 });
    }

    const createRes = await fetch(`${API_BASE}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, message, createdAt: new Date().toISOString() }),
    });

    if (!createRes.ok) {
      return new Response(JSON.stringify({ success: false, message: 'Failed to send message' }), { status: 500 });
    }

    const newMsg = await createRes.json();
    return new Response(JSON.stringify({ success: true, message: newMsg }), { status: 201 });
  } catch {
    return new Response(JSON.stringify({ success: false, message: 'Server error' }), { status: 500 });
  }
}

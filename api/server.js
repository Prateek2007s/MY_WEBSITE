// api/server.js

const express = require("express");
const fs = require("fs");
const cors = require("cors");
const path = require("path");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
const SECRET_KEY = "nullgod-secret";
const dataDir = path.join(__dirname, "data");
const usersFile = path.join(dataDir, "users.json");
const messagesFile = path.join(dataDir, "messages.json");

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Ensure data directory and files exist
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, "{}", "utf8");
if (!fs.existsSync(messagesFile)) fs.writeFileSync(messagesFile, "[]", "utf8");

// Helpers
function readJSON(file) {
  return JSON.parse(fs.readFileSync(file, "utf8"));
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

// Signup
app.post("/api/server/signup", (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(usersFile);
  if (users[username]) return res.status(400).json({ error: "User exists" });
  users[username] = { password };
  writeJSON(usersFile, users);
  res.json({ success: true });
});

// Login
app.post("/api/server/login", (req, res) => {
  const { username, password } = req.body;
  const users = readJSON(usersFile);
  if (!users[username] || users[username].password !== password) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ username }, SECRET_KEY);
  res.json({ token });
});

// Get messages
app.get("/api/server/messages", (req, res) => {
  const messages = readJSON(messagesFile);
  res.json(messages);
});

// Post message
app.post("/api/server/messages", (req, res) => {
  const { token, text } = req.body;
  if (!token || !text) return res.status(400).json({ error: "Missing data" });

  try {
    const { username } = jwt.verify(token, SECRET_KEY);
    const messages = readJSON(messagesFile);
    const message = {
      id: Date.now().toString(),
      user: username,
      text,
      time: new Date().toLocaleString(),
    };
    messages.push(message);
    writeJSON(messagesFile, messages);
    res.json({ success: true, message });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

// Delete message
app.post("/api/server/delete", (req, res) => {
  const { token, id } = req.body;
  if (!token || !id) return res.status(400).json({ error: "Missing data" });

  try {
    const { username } = jwt.verify(token, SECRET_KEY);
    const messages = readJSON(messagesFile);
    const index = messages.findIndex((m) => m.id === id && m.user === username);
    if (index === -1) return res.status(403).json({ error: "Unauthorized" });
    messages[index].text = "[MESSAGE DELETED]";
    writeJSON(messagesFile, messages);
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

module.exports = app;

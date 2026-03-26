const express = require('express');
const Database = require('better-sqlite3');
const session = require('express-session');
const cors = require('cors');
const crypto = require('crypto');

const app = express();
const db = new Database('game.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(session({
  secret: 'treasure-game-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '請輸入帳號和密碼' });
  }
  try {
    const hash = hashPassword(password);
    const result = db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').run(username, hash);
    req.session.userId = result.lastInsertRowid;
    req.session.username = username;
    res.json({ username });
  } catch (e) {
    if (e.message.includes('UNIQUE')) {
      res.status(409).json({ error: '此帳號已被使用' });
    } else {
      res.status(500).json({ error: '伺服器錯誤' });
    }
  }
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: '請輸入帳號和密碼' });
  }
  const hash = hashPassword(password);
  const user = db.prepare('SELECT * FROM users WHERE username = ? AND password_hash = ?').get(username, hash);
  if (!user) return res.status(401).json({ error: '帳號或密碼錯誤' });
  req.session.userId = user.id;
  req.session.username = user.username;
  res.json({ username: user.username });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/me', (req, res) => {
  if (req.session.userId) {
    res.json({ username: req.session.username });
  } else {
    res.json({ username: null });
  }
});

app.listen(3001, () => console.log('API server running on http://localhost:3001'));

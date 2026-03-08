/**
 * Standalone server for Parolla landing + annotation API.
 * Serves static site and /api/* routes with SQLite storage.
 *
 * Usage: node server/index.js
 * Env: PORT, ANNOTATIONS_DB, ANNOTATIONS_ADMIN_KEY
 */
const express = require('express');
const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

const PORT = process.env.PORT || 4321;
const DB_PATH = process.env.ANNOTATIONS_DB || path.join(process.cwd(), 'data', 'annotations.db');
const ADMIN_KEY = process.env.ANNOTATIONS_ADMIN_KEY;

const app = express();
app.use(express.json());

// Ensure data dir exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// SQLite setup
const db = new Database(DB_PATH);
db.exec(`
  CREATE TABLE IF NOT EXISTS annotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pair_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    valid INTEGER NOT NULL,
    comment TEXT,
    user_translation TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS blocked_users (
    user_id TEXT PRIMARY KEY
  );
  CREATE INDEX IF NOT EXISTS idx_annotations_pair ON annotations(pair_id);
  CREATE INDEX IF NOT EXISTS idx_annotations_user ON annotations(user_id);
`);
try {
  db.exec('ALTER TABLE annotations ADD COLUMN user_translation TEXT');
} catch (e) { /* column may already exist */ }

function isUserBlocked(userId) {
  return !!db.prepare('SELECT 1 FROM blocked_users WHERE user_id = ?').get(userId);
}

// Load pairs (from built app or source)
const pairsPath = path.join(process.cwd(), 'src', 'data', 'pairs.json');
let pairs = [];
if (fs.existsSync(pairsPath)) {
  pairs = JSON.parse(fs.readFileSync(pairsPath, 'utf8'));
}

// API: GET /api/pairs
app.get('/api/pairs', (req, res) => {
  res.json(pairs);
});

// API: POST /api/annotate
app.post('/api/annotate', (req, res) => {
  const { pairId, valid, comment, userTranslation, userId } = req.body || {};
  if (typeof userId !== 'string' || !userId.trim()) {
    return res.status(400).json({ error: 'userId is required' });
  }
  if (typeof pairId !== 'number' || (valid !== true && valid !== false)) {
    return res.status(400).json({ error: 'pairId (number) and valid (boolean) are required' });
  }
  if (isUserBlocked(userId)) {
    return res.status(403).json({ error: 'User is blocked' });
  }
  try {
    const userTrans = typeof userTranslation === 'string' ? userTranslation.trim() || null : null;
    db.prepare(
      'INSERT INTO annotations (pair_id, user_id, valid, comment, user_translation) VALUES (?, ?, ?, ?, ?)'
    ).run(pairId, userId.trim(), valid ? 1 : 0, typeof comment === 'string' ? comment.trim() || null : null, userTrans);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// API: POST /api/admin/block-user (requires Authorization: Bearer <ADMIN_KEY>)
app.post('/api/admin/block-user', (req, res) => {
  const auth = req.headers.authorization?.replace('Bearer ', '');
  if (!ADMIN_KEY || auth !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { userId } = req.body || {};
  if (!userId || typeof userId !== 'string') {
    return res.status(400).json({ error: 'userId required' });
  }
  db.prepare('INSERT OR IGNORE INTO blocked_users (user_id) VALUES (?)').run(userId.trim());
  res.json({ ok: true });
});

// API: GET /api/annotations/export (requires Authorization: Bearer <ADMIN_KEY>)
app.get('/api/annotations/export', (req, res) => {
  const auth = req.headers.authorization?.replace('Bearer ', '');
  if (!ADMIN_KEY || auth !== ADMIN_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const rows = db.prepare(
    `SELECT id, pair_id, user_id, valid, comment, user_translation, created_at FROM annotations 
     WHERE user_id NOT IN (SELECT user_id FROM blocked_users) ORDER BY created_at`
  ).all();
  res.setHeader('Content-Disposition', 'attachment; filename="annotations.json"');
  res.json(rows);
});

// Static files (must be last)
const distPath = path.join(process.cwd(), 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Astro static: / -> index.html, /annotate -> annotate/index.html
  app.get('/{*path}', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    const clean = (req.path.endsWith('/') ? req.path.slice(0, -1) : req.path).replace(/^\//, '') || 'index';
    const idx = path.join(distPath, clean === 'index' ? 'index.html' : path.join(clean, 'index.html'));
    if (fs.existsSync(idx)) return res.sendFile(path.resolve(idx));
    next();
  });
} else {
  app.get('*', (req, res) => {
    res.status(503).send('Build the site first: pnpm run build');
  });
}

app.listen(PORT, () => {
  console.log(`Parolla server on http://localhost:${PORT}`);
  console.log(`  Annotation API: /api/pairs, /api/annotate`);
  if (ADMIN_KEY) console.log(`  Admin API: /api/admin/block-user, /api/annotations/export`);
});

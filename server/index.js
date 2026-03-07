const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = 'dongreggiebrewery_secret';

app.use(cors());
app.use(bodyParser.json());

// SQLite DB setup
const db = new sqlite3.Database('./dongreggiebrewery.db', (err) => {
  if (err) console.error('DB error:', err);
});

// Create tables if not exist
// Users
const userTable = `CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT DEFAULT 'user'
)';
db.run(userTable);
// Menu Items
const menuTable = `CREATE TABLE IF NOT EXISTS menu_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  price REAL NOT NULL,
  image_url TEXT
)';
db.run(menuTable);
// Orders
const orderTable = `CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  items TEXT,
  total REAL,
  status TEXT DEFAULT 'Pending',
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id)
)';
db.run(orderTable);

app.get('/', (req, res) => {
  res.send('Dong Reggie\'s Brewery API running!');
});

app.post('/api/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required.' });
  const hash = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', [name, email, hash], function(err) {
    if (err) return res.status(400).json({ error: 'Email already exists.' });
    const token = jwt.sign({ id: this.lastID, email, role: 'user' }, SECRET, { expiresIn: '2h' });
    res.json({ token });
  });
});

app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err || !user) return res.status(400).json({ error: 'Invalid credentials.' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Invalid credentials.' });
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, SECRET, { expiresIn: '2h' });
    res.json({ token });
  });
});

app.get('/api/menu', (req, res) => {
  db.all('SELECT * FROM menu_items', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch menu.' });
    res.json(rows);
  });
});

app.post('/api/menu', (req, res) => {
  const { name, category, description, price, image_url } = req.body;
  db.run('INSERT INTO menu_items (name, category, description, price, image_url) VALUES (?, ?, ?, ?, ?)', [name, category, description, price, image_url], function(err) {
    if (err) return res.status(400).json({ error: 'Failed to add item.' });
    res.json({ id: this.lastID });
  });
});

app.put('/api/menu/:id', (req, res) => {
  const { name, category, description, price, image_url } = req.body;
  db.run('UPDATE menu_items SET name=?, category=?, description=?, price=?, image_url=? WHERE id=?', [name, category, description, price, image_url, req.params.id], function(err) {
    if (err) return res.status(400).json({ error: 'Failed to update item.' });
    res.json({ updated: this.changes });
  });
});

app.delete('/api/menu/:id', (req, res) => {
  db.run('DELETE FROM menu_items WHERE id=?', [req.params.id], function(err) {
    if (err) return res.status(400).json({ error: 'Failed to delete item.' });
    res.json({ deleted: this.changes });
  });
});

app.post('/api/orders', (req, res) => {
  const { user_id, items, total } = req.body;
  db.run('INSERT INTO orders (user_id, items, total) VALUES (?, ?, ?)', [user_id, JSON.stringify(items), total], function(err) {
    if (err) return res.status(400).json({ error: 'Failed to place order.' });
    res.json({ id: this.lastID });
  });
});

app.get('/api/orders', (req, res) => {
  const { user_id } = req.query;
  let sql = 'SELECT o.*, u.name, u.email FROM orders o LEFT JOIN users u ON o.user_id = u.id';
  let params = [];
  if (user_id) {
    sql += ' WHERE o.user_id = ?';
    params.push(user_id);
  }
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch orders.' });
    res.json(rows);
  });
});

app.put('/api/orders/:id', (req, res) => {
  const { status } = req.body;
  db.run('UPDATE orders SET status=? WHERE id=?', [status, req.params.id], function(err) {
    if (err) return res.status(400).json({ error: 'Failed to update order.' });
    res.json({ updated: this.changes });
  });
});

// Change password endpoint
app.post('/api/change-password', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'All fields required.' });
  const hash = bcrypt.hashSync(password, 10);
  db.run('UPDATE users SET password=? WHERE email=?', [hash, email], function(err) {
    if (err || this.changes === 0) return res.status(400).json({ error: 'User not found.' });
    res.json({ success: true });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

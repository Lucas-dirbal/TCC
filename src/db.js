// db.js
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// Criar tabela de usuários
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    role TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

// Inserir usuários de demonstração (apenas se não existirem)
const users = [
  { username: 'admin', password: 'admin123', role: 'admin' },
  { username: 'professor', password: 'prof123', role: 'professor' },
  { username: 'aluno', password: 'aluno123', role: 'aluno' }
];

users.forEach(u => {
  const exists = db.prepare('SELECT * FROM users WHERE username = ?').get(u.username);
  if (!exists) {
    const hash = bcrypt.hashSync(u.password, 10);
    db.prepare('INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)')
      .run(u.username, hash, u.role);
  }
});

module.exports = db;

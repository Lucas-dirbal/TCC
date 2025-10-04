const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.db');
const db = new Database(dbPath);

// Criar tabela de usuários, se não existir
db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password_hash TEXT,
    classe TEXT
  )
`).run();

// Inserir usuários de demonstração (hash das senhas)
const users = [
  { username: 'admin', password: 'admin123', classe: 'admin' },
  { username: 'professor', password: 'prof123', classe: 'professor' },
  { username: 'aluno', password: 'aluno123', classe: 'aluno' }
];

users.forEach(u => {
  const exists = db.prepare('SELECT * FROM users WHERE username = ?').get(u.username);
  if (!exists) {
    const hash = bcrypt.hashSync(u.password, 10);
    db.prepare('INSERT INTO users (username, password_hash, classe) VALUES (?, ?, ?)').run(u.username, hash, u.classe);
  }
});

module.exports = db;

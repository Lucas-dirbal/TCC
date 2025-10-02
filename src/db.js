// Tabela de reservas de equipamentos
db.prepare(`
  CREATE TABLE IF NOT EXISTS reservas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    equipamento TEXT NOT NULL,
    data TEXT NOT NULL,
    horario TEXT NOT NULL,
    observacoes TEXT,
    status TEXT DEFAULT 'pendente',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();
const Database = require('better-sqlite3');
const db = new Database('data.sqlite');

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    classe INTEGER DEFAULT 1,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`).run();

module.exports = db;
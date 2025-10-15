const Database = require('better-sqlite3');
const path = require('path');

// Caminho do banco de dados
const dbPath = path.join(__dirname, 'database.sqlite');
const db = new Database(dbPath);

// Criação da tabela de usuários
const createTable = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT,
  email TEXT,
  role TEXT
);
`;
db.exec(createTable);

module.exports = db;

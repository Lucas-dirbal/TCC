// server.js
const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "..", "public")));

// Sessões
app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.sqlite",
      dir: __dirname,
    }),
    secret: "seu-segredo-aqui",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }, // 24h
  })
);

// Banco de Dados
const db = new sqlite3.Database(path.join(__dirname, "data.sqlite"));

// Inicializar banco
function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  const users = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "professor", password: "prof123", role: "professor" },
    { username: "aluno", password: "aluno123", role: "aluno" },
  ];

  const insert = db.prepare(
    `INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`
  );
  users.forEach((u) => insert.run(u.username, u.password, u.role));
  insert.finalize();
}
initializeDatabase();

// Middleware de autenticação
function requireAuth(req, res, next) {
  if (req.session.user) next();
  else res.redirect("/login");
}

// Rotas de páginas
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "login.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "register.html"));
});

app.get("/sobre", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "sobre.html"));
});

app.get("/sistema", requireAuth, (req, res) => {
  res.sendFile(path.join(__dirname, "..", "public", "sistema.html"));
});

// Rotas de API
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) return res.status(500).json({ success: false, message: "Erro no servidor" });
    if (!user || user.password !== password)
      return res.status(401).json({ success: false, message: "Usuário ou senha incorretos" });

    req.session.user = { id: user.id, username: user.username, role: user.role };
    res.json({ success: true, user: req.session.user });
  });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.post("/api/register", (req, res) => {
  const { username, password, classe } = req.body;
  if (!username || !password || !classe)
    return res.status(400).json({ success: false, message: "Campos obrigatórios" });

  db.run(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, password, classe],
    function (err) {
      if (err)
        return res.status(500).json({ success: false, message: "Erro ao registrar usuário" });
      res.json({ success: true, id: this.lastID });
    }
  );
});

app.get("/api/user", (req, res) => {
  if (req.session.user) res.json({ success: true, user: req.session.user });
  else res.json({ success: false });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", time: new Date().toISOString() });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
  console.log("📂 Acesse as páginas:");
  console.log(`➡️  /           → index.html`);
  console.log(`➡️  /login      → login.html`);
  console.log(`➡️  /sistema    → sistema.html (após login)`);
});

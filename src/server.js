// server.js
const express = require("express");
const path = require("path");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
const bcrypt = require("bcryptjs");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "..", "public")));

// Sessões
app.use(
  session({
    store: new SQLiteStore({ db: "sessions.sqlite", dir: __dirname }),
    secret: "seu-segredo-aqui",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 },
  })
);

// Middleware de autenticação
function requireAuth(req, res, next) {
  if (req.session.user) next();
  else res.redirect("/login");
}

// Middleware por cargo
function requireRole(role) {
  return (req, res, next) => {
    if (req.session.user && req.session.user.role === role) next();
    else res.status(403).send("Acesso negado!");
  };
}

// Rotas de páginas
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "..", "public", "index.html")));
app.get("/login", (req, res) => res.sendFile(path.join(__dirname, "..", "public", "login.html")));
app.get("/register", (req, res) => res.sendFile(path.join(__dirname, "..", "public", "register.html")));
app.get("/sobre", (req, res) => res.sendFile(path.join(__dirname, "..", "public", "sobre.html")));
app.get("/sistema", requireAuth, (req, res) => res.sendFile(path.join(__dirname, "..", "public", "sistema.html")));

// APIs
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username);

  if (!user) return res.status(401).json({ success: false, message: "Usuário não encontrado" });

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) return res.status(401).json({ success: false, message: "Senha incorreta" });

  req.session.user = { id: user.id, username: user.username, role: user.role };
  res.json({ success: true, user: req.session.user });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.post("/api/register", (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role)
    return res.status(400).json({ success: false, message: "Campos obrigatórios" });

  const hash = bcrypt.hashSync(password, 10);

  try {
    const stmt = db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, ?)");
    const info = stmt.run(username, hash, role);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ success: false, message: "Usuário já existe" });
    } else {
      res.status(500).json({ success: false, message: "Erro ao registrar usuário" });
    }
  }
});

app.get("/api/user", (req, res) => {
  if (req.session.user) res.json({ success: true, user: req.session.user });
  else res.json({ success: false });
});

app.get("/api/health", (req, res) => res.json({ status: "OK", time: new Date().toISOString() }));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});

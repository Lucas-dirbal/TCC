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

// Endpoint para editar usuário (apenas admin pode editar qualquer usuário)
app.put("/api/user/:id", requireAuth, requireRole("admin"), (req, res) => {
  const userId = parseInt(req.params.id);
  const { username, email, role, password } = req.body;
  if (!username && !email && !role && !password) {
    return res.status(400).json({ success: false, message: "Nenhum dado para atualizar" });
  }
  try {
    // Monta query dinâmica
    let fields = [];
    let values = [];
    if (username) { fields.push("username = ?"); values.push(username); }
    if (email) { fields.push("email = ?"); values.push(email); }
    if (role) { fields.push("role = ?"); values.push(role); }
    if (password) { fields.push("password = ?"); values.push(password); }
    values.push(userId);
    const stmt = db.prepare(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`);
    const info = stmt.run(...values);
    if (info.changes > 0) {
      res.json({ success: true, message: "Usuário atualizado com sucesso!" });
    } else {
      res.status(404).json({ success: false, message: "Usuário não encontrado" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro ao atualizar usuário" });
  }
});

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

  if (user.password !== password) return res.status(401).json({ success: false, message: "Senha incorreta" });

  req.session.user = { id: user.id, username: user.username, email: user.email, role: user.role };
  res.json({ success: true, user: req.session.user });
});

app.post("/api/logout", (req, res) => {
  req.session.destroy(() => res.json({ success: true }));
});

app.post("/api/register", (req, res) => {
  const { username, password, email, role } = req.body;
  if (!username || !password || !email || !role)
    return res.status(400).json({ success: false, message: "Campos obrigatórios" });

  try {
    const stmt = db.prepare("INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)");
    const info = stmt.run(username, password, email, role);
    res.json({ success: true, id: info.lastInsertRowid });
  } catch (err) {
    if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      res.status(400).json({ success: false, message: "Usuário já existe" });
    } else {
      res.status(500).json({ success: false, message: "Erro ao registrar usuário" });
    }
  }
});

// Endpoint para listar todos os usuários (apenas admin)
app.get("/api/users", requireAuth, requireRole("admin"), (req, res) => {
  try {
    const users = db.prepare("SELECT id, username, email, role FROM users").all();
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Erro ao buscar usuários" });
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


const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos das pastas corretas
app.use(express.static(path.join(__dirname, '..'))); // Para arquivos na raiz
app.use('/css', express.static(path.join(__dirname, '../css'))); // Para CSS
app.use('/js', express.static(path.join(__dirname, '../js'))); // Para JS
app.use('/public', express.static(path.join(__dirname, '../public'))); // Para public

// Session middleware
app.use(session({
    store: new SQLiteStore({
        db: 'sessions.sqlite',
        dir: path.join(__dirname, '..')
    }),
    secret: 'seu-segredo-aqui',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 horas
}));

// Inicialização do Banco de Dados
const dbPath = path.join(__dirname, '../data.sqlite');
const db = new sqlite3.Database(dbPath);

// Função para inicializar o banco
function initializeDatabase() {
    // Dropar a tabela se existir e recriar com a estrutura correta
    db.run(`DROP TABLE IF EXISTS users`, (err) => {
        if (err) {
            console.error('Erro ao dropar tabela:', err);
        }

        // Criar tabela com estrutura correta
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => {
            if (err) {
                console.error('Erro ao criar tabela:', err);
                return;
            }
            console.log('✅ Tabela users criada com sucesso');

            // Inserir usuários de demonstração
            insertDemoUsers();
        });
    });
}

// Função para inserir usuários de demonstração
function insertDemoUsers() {
    const users = [
        { username: 'admin', password: 'admin123', role: 'admin' },
        { username: 'professor', password: 'prof123', role: 'professor' },
        { username: 'aluno', password: 'aluno123', role: 'aluno' }
    ];

    const insertUser = db.prepare(`INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)`);
    
    users.forEach(user => {
        insertUser.run(user.username, user.password, user.role, (err) => {
            if (err) {
                console.error(`❌ Erro ao inserir ${user.username}:`, err);
            } else {
                console.log(`✅ Usuário ${user.username} inserido com sucesso`);
            }
        });
    });
    
    insertUser.finalize();
}

// Middleware para verificar autenticação
function requireAuth(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
}

// Verificar e inicializar o banco
db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='users'", (err, row) => {
    if (err) {
        console.error('Erro ao verificar tabela:', err);
        return;
    }

    if (!row) {
        console.log('📋 Tabela users não existe. Inicializando banco...');
        initializeDatabase();
    } else {
        console.log('✅ Tabela users já existe');
        // Verificar se a estrutura está correta
        db.all("PRAGMA table_info(users)", (err, columns) => {
            if (err) {
                console.error('Erro ao verificar estrutura da tabela:', err);
                return;
            }
            
            const hasPassword = columns.some(col => col.name === 'password');
            if (!hasPassword) {
                console.log('🔄 Estrutura incorreta detectada. Recriando tabela...');
                initializeDatabase();
            } else {
                console.log('✅ Estrutura da tabela está correta');
            }
        });
    }
});

// Rotas para páginas HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './../public/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, './../public/login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, './../public/register.html'));
});

app.get('/sobre', (req, res) => {
    res.sendFile(path.join(__dirname, './../public/sobre.html'));
});

app.get('/sistema', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, './../public/sistema.html'));
});

// Rota de Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Usuário e senha são obrigatórios' 
        });
    }

    // Buscar usuário no banco
    db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
        if (err) {
            console.error('Erro ao buscar usuário:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro no servidor' 
            });
        }

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'Usuário ou senha incorretos' 
            });
        }

        // Verificar senha
        if (user.password === password) {
            // Criar sessão
            req.session.user = {
                id: user.id,
                username: user.username,
                role: user.role
            };

            res.json({ 
                success: true, 
                message: 'Login realizado com sucesso!',
                user: {
                    id: user.id,
                    username: user.username,
                    role: user.role
                }
            });
        } else {
            res.status(401).json({ 
                success: false, 
                message: 'Usuário ou senha incorretos' 
            });
        }
    });
});

// Rota de Logout
app.post('/api/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro ao fazer logout' });
        }
        res.json({ success: true, message: 'Logout realizado com sucesso' });
    });
});

// Rota de Registro
app.post('/api/register', (req, res) => {
    const { username, password, classe } = req.body;

    if (!username || !password || !classe) {
        return res.status(400).json({ 
            success: false, 
            message: 'Todos os campos são obrigatórios' 
        });
    }

    if (username.length < 3) {
        return res.status(400).json({ 
            success: false, 
            message: 'Usuário deve ter pelo menos 3 caracteres' 
        });
    }

    if (password.length < 6) {
        return res.status(400).json({ 
            success: false, 
            message: 'Senha deve ter pelo menos 6 caracteres' 
        });
    }

    // Verificar se usuário já existe
    db.get('SELECT id FROM users WHERE username = ?', [username], (err, row) => {
        if (err) {
            console.error('Erro ao verificar usuário:', err);
            return res.status(500).json({ 
                success: false, 
                message: 'Erro no servidor' 
            });
        }

        if (row) {
            return res.status(400).json({ 
                success: false, 
                message: 'Usuário já existe' 
            });
        }

        // Inserir novo usuário
        db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', 
            [username, password, classe], 
            function(err) {
                if (err) {
                    console.error('Erro ao criar usuário:', err);
                    return res.status(500).json({ 
                        success: false, 
                        message: 'Erro ao criar usuário' 
                    });
                }

                res.json({ 
                    success: true, 
                    message: 'Usuário criado com sucesso!',
                    userId: this.lastID
                });
            }
        );
    });
});

// Rota para verificar sessão
app.get('/api/user', (req, res) => {
    if (req.session.user) {
        res.json({ 
            success: true, 
            user: req.session.user 
        });
    } else {
        res.json({ 
            success: false, 
            message: 'Não autenticado' 
        });
    }
});

// Rota para verificar usuários (debug)
app.get('/api/users', (req, res) => {
    db.all('SELECT id, username, role FROM users', (err, rows) => {
        if (err) {
            console.error('Erro ao buscar usuários:', err);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Rota de saúde do servidor
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Servidor funcionando',
        timestamp: new Date().toISOString()
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📝 Acesse: http://localhost:${PORT}`);
    console.log(`👥 Páginas disponíveis:`);
    console.log(`   📄 Página inicial: http://localhost:${PORT}/`);
    console.log(`   🔐 Login: http://localhost:${PORT}/login`);
    console.log(`   📝 Registrar: http://localhost:${PORT}/register`);
    console.log(`   🖥️  Sistema: http://localhost:${PORT}/sistema`);
    console.log(`   ℹ️  Sobre: http://localhost:${PORT}/sobre`);
    console.log(`🔑 Credenciais de teste:`);
    console.log(`   👨‍💼 Admin: admin / admin123`);
    console.log(`   👨‍🏫 Professor: professor / prof123`);
    console.log(`   👨‍🎓 Aluno: aluno / aluno123`);
});

// Fechar conexão com BD ao encerrar
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error(err.message);
        }
        console.log('Conexão com o banco de dados fechada.');
        process.exit(0);
    });
});
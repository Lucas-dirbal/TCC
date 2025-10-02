const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const db = require('./db');
const bcrypt = require('bcryptjs');

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Rotas básicas
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Rota de login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ ok: false, error: 'Usuário e senha obrigatórios.' });
    }
    try {
        const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (!user) {
            return res.status(401).json({ ok: false, error: 'Usuário ou senha inválidos.' });
        }
        // Verifica senha
        const match = await bcrypt.compare(password, user.password_hash);
        if (!match) {
            return res.status(401).json({ ok: false, error: 'Usuário ou senha inválidos.' });
        }
        // Login bem-sucedido
        res.json({ ok: true, user: { id: user.id, username: user.username, classe: user.classe } });
    } catch (err) {
        res.status(500).json({ ok: false, error: 'Erro interno do servidor.' });
    }
});

// API para reservas (simulada)
app.post('/api/reservas', (req, res) => {
    const { equipamento, usuario, data } = req.body;
    
    // Simulação de salvar reserva
    const reserva = {
        id: Date.now(),
        equipamento,
        usuario,
        data,
        status: 'pendente'
    };
    
    console.log('Nova reserva:', reserva);
    res.json({ success: true, reserva });
});

// API para equipamentos
app.get('/api/equipamentos', (req, res) => {
    const equipamentos = [
        { id: 1, nome: 'Notebook Dell', categoria: 'Informática', status: 'disponivel' },
        { id: 2, nome: 'Projetor Epson', categoria: 'Áudio/Vídeo', status: 'disponivel' },
        { id: 3, nome: 'Microscópio', categoria: 'Laboratório', status: 'manutencao' }
    ];
    res.json(equipamentos);
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`📧 Acesse: http://localhost:${PORT}`);
});
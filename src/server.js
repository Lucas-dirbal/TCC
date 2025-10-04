const bcrypt = require('bcryptjs');

app.post('/api/register', async (req, res) => {
    const { username, password, classe } = req.body;
    if (!username || !password || !classe) {
        return res.status(400).json({ ok: false, error: 'Todos os campos são obrigatórios.' });
    }

    try {
        const exists = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
        if (exists) {
            return res.status(400).json({ ok: false, error: 'Usuário já existe.' });
        }

        const hash = await bcrypt.hash(password, 10);
        db.prepare('INSERT INTO users (username, password_hash, classe) VALUES (?, ?, ?)').run(username, hash, classe);

        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ ok: false, error: 'Erro interno do servidor.' });
    }
});

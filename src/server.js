const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

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
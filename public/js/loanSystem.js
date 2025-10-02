// ===== SISTEMA DE CONTROLE DE EMPRÉSTIMOS =====

// Base de dados de empréstimos
let emprestimos = JSON.parse(localStorage.getItem('emprestimos')) || [
    {
        id: 1,
        equipamentoId: 1,
        equipamentoNome: 'Notebook Dell Inspiron',
        usuario: 'Professor Silva',
        usuarioId: 'professor',
        dataEmprestimo: '2024-01-20',
        dataDevolucao: '2024-01-25',
        dataDevolvido: null,
        status: 'concluido',
        observacoes: 'Empréstimo para aula de programação'
    },
    {
        id: 2,
        equipamentoId: 2,
        equipamentoNome: 'Projetor Epson',
        usuario: 'João Aluno',
        usuarioId: 'aluno',
        dataEmprestimo: '2024-01-22',
        dataDevolucao: '2024-01-24',
        dataDevolvido: null,
        status: 'ativo',
        observacoes: 'Apresentação de trabalho'
    }
];

// Inicializar sistema de empréstimos
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('sistema.html')) {
        initLoanSystem();
    }
});

function initLoanSystem() {
    // Verificar permissões
    if (!AuthSystem.protectRoute('aluno')) return;
    
    loadEmprestimosTable();
    setupLoanEvents();
    updateDashboardStats();
}

// Carregar tabela de empréstimos
function loadEmprestimosTable() {
    const tbody = document.getElementById('emprestimosTable');
    if (!tbody) return;
    
    const currentUser = AuthSystem.getCurrentUser();
    const filterStatus = document.getElementById('filterStatus')?.value || '';
    
    let emprestimosFiltrados = emprestimos;
    
    // Filtrar por status se selecionado
    if (filterStatus) {
        emprestimosFiltrados = emprestimos.filter(emp => emp.status === filterStatus);
    }
    
    // Filtrar por usuário se não for admin
    if (currentUser.role !== 'admin') {
        emprestimosFiltrados = emprestimosFiltrados.filter(emp => 
            emp.usuarioId === currentUser.username
        );
    }
    
    tbody.innerHTML = '';
    
    emprestimosFiltrados.forEach(emprestimo => {
        const tr = document.createElement('tr');
        
        // Definir ações baseado na role e status
        let acoes = '';
        
        if (currentUser.role === 'admin' || currentUser.role === 'professor') {
            if (emprestimo.status === 'ativo') {
                acoes = `
                    <button class="btn-action btn-success" onclick="registrarDevolucao(${emprestimo.id})">
                        ✅ Devolver
                    </button>
                    <button class="btn-action btn-warning" onclick="editarEmprestimo(${emprestimo.id})">
                        ✏️ Editar
                    </button>
                `;
            } else if (emprestimo.status === 'pendente') {
                acoes = `
                    <button class="btn-action btn-success" onclick="aprovarEmprestimo(${emprestimo.id})">
                        👍 Aprovar
                    </button>
                    <button class="btn-action btn-danger" onclick="rejeitarEmprestimo(${emprestimo.id})">
                        👎 Rejeitar
                    </button>
                `;
            }
        }
        
        // Alunos só podem ver seus próprios empréstimos
        if (currentUser.role === 'aluno' && emprestimo.usuarioId === currentUser.username) {
            if (emprestimo.status === 'ativo') {
                acoes = `
                    <button class="btn-action btn-info" onclick="solicitarRenovacao(${emprestimo.id})">
                        🔄 Renovar
                    </button>
                `;
            }
        }
        
        tr.innerHTML = `
            <td>${emprestimo.id}</td>
            <td>${emprestimo.equipamentoNome}</td>
            <td>${emprestimo.usuario}</td>
            <td>${formatarData(emprestimo.dataEmprestimo)}</td>
            <td>${formatarData(emprestimo.dataDevolucao)}</td>
            <td><span class="status-badge status-${emprestimo.status}">${getStatusEmprestimoText(emprestimo.status)}</span></td>
            <td>${acoes}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Configurar eventos dos empréstimos
function setupLoanEvents() {
    const btnNovoEmprestimo = document.getElementById('btnNovoEmprestimo');
    const filterStatus = document.getElementById('filterStatus');
    
    if (btnNovoEmprestimo) {
        // Mostrar/ocultar botão baseado na role
        const currentUser = AuthSystem.getCurrentUser();
        if (currentUser.role === 'aluno') {
            btnNovoEmprestimo.style.display = 'none';
        } else {
            btnNovoEmprestimo.addEventListener('click', mostrarModalNovoEmprestimo);
        }
    }
    
    if (filterStatus) {
        filterStatus.addEventListener('change', loadEmprestimosTable);
    }
}

// Modal de novo empréstimo
function mostrarModalNovoEmprestimo() {
    if (!AuthSystem.hasPermission('professor')) {
        showNotification('Acesso não autorizado!', 'error');
        return;
    }
    
    const equipamentosDisponiveis = equipamentos.filter(e => e.status === 'disponivel');
    
    const modalHTML = `
        <div class="modal-overlay" id="modalEmprestimo">
            <div class="modal">
                <div class="modal-header">
                    <h3>📅 Novo Empréstimo</h3>
                    <button class="modal-close" onclick="fecharModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="formEmprestimo">
                        <div class="form-group">
                            <label for="emprestimoEquipamento">Equipamento:</label>
                            <select id="emprestimoEquipamento" required>
                                <option value="">Selecione o equipamento...</option>
                                ${equipamentosDisponiveis.map(equip => 
                                    `<option value="${equip.id}">${equip.nome} - ${equip.numeroSerie}</option>`
                                ).join('')}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="emprestimoUsuario">Usuário:</label>
                            <input type="text" id="emprestimoUsuario" placeholder="Nome do aluno/professor" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="emprestimoUsuarioId">ID do Usuário:</label>
                            <input type="text" id="emprestimoUsuarioId" placeholder="ID ou matrícula" required>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="emprestimoData">Data do Empréstimo:</label>
                                <input type="date" id="emprestimoData" value="${new Date().toISOString().split('T')[0]}" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="emprestimoDevolucao">Data de Devolução:</label>
                                <input type="date" id="emprestimoDevolucao" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="emprestimoObservacoes">Observações:</label>
                            <textarea id="emprestimoObservacoes" rows="3" placeholder="Finalidade do empréstimo..."></textarea>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="fecharModal()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="salvarEmprestimo()">Salvar Empréstimo</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Configurar data de devolução padrão (7 dias)
    const dataDevolucao = new Date();
    dataDevolucao.setDate(dataDevolucao.getDate() + 7);
    document.getElementById('emprestimoDevolucao').value = dataDevolucao.toISOString().split('T')[0];
    
    // Fechar modal ao clicar fora
    document.getElementById('modalEmprestimo').addEventListener('click', function(e) {
        if (e.target === this) fecharModal();
    });
}

// Salvar empréstimo
function salvarEmprestimo() {
    const form = document.getElementById('formEmprestimo');
    if (!form.checkValidity()) {
        showNotification('Preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    const equipamentoId = parseInt(document.getElementById('emprestimoEquipamento').value);
    const equipamento = equipamentos.find(e => e.id === equipamentoId);
    
    if (!equipamento) {
        showNotification('Equipamento não encontrado!', 'error');
        return;
    }
    
    const novoEmprestimo = {
        id: Math.max(...emprestimos.map(e => e.id), 0) + 1,
        equipamentoId: equipamentoId,
        equipamentoNome: equipamento.nome,
        usuario: document.getElementById('emprestimoUsuario').value,
        usuarioId: document.getElementById('emprestimoUsuarioId').value,
        dataEmprestimo: document.getElementById('emprestimoData').value,
        dataDevolucao: document.getElementById('emprestimoDevolucao').value,
        dataDevolvido: null,
        status: 'ativo',
        observacoes: document.getElementById('emprestimoObservacoes').value
    };
    
    // Atualizar status do equipamento
    equipamento.status = 'emprestado';
    
    emprestimos.push(novoEmprestimo);
    salvarDadosNoStorage();
    
    showNotification('Empréstimo registrado com sucesso!', 'success');
    fecharModal();
    loadEmprestimosTable();
    loadEquipamentosTable();
    updateDashboardStats();
}

// Registrar devolução
function registrarDevolucao(id) {
    if (!AuthSystem.hasPermission('professor')) {
        showNotification('Acesso não autorizado!', 'error');
        return;
    }
    
    const emprestimo = emprestimos.find(e => e.id === id);
    if (!emprestimo) return;
    
    const equipamento = equipamentos.find(e => e.id === emprestimo.equipamentoId);
    if (equipamento) {
        equipamento.status = 'disponivel';
    }
    
    emprestimo.status = 'concluido';
    emprestimo.dataDevolvido = new Date().toISOString().split('T')[0];
    
    salvarDadosNoStorage();
    showNotification('Devolução registrada com sucesso!', 'success');
    loadEmprestimosTable();
    loadEquipamentosTable();
    updateDashboardStats();
}

// Aprovar empréstimo
function aprovarEmprestimo(id) {
    const emprestimo = emprestimos.find(e => e.id === id);
    if (emprestimo) {
        emprestimo.status = 'ativo';
        salvarDadosNoStorage();
        showNotification('Empréstimo aprovado!', 'success');
        loadEmprestimosTable();
    }
}

// Texto do status do empréstimo
function getStatusEmprestimoText(status) {
    const statusMap = {
        'pendente': 'Pendente',
        'ativo': 'Ativo',
        'concluido': 'Concluído',
        'atrasado': 'Atrasado',
        'rejeitado': 'Rejeitado'
    };
    return statusMap[status] || status;
}

// Formatador de data
function formatarData(dataString) {
    return new Date(dataString).toLocaleDateString('pt-BR');
}

// Salvar dados no localStorage
function salvarDadosNoStorage() {
    localStorage.setItem('emprestimos', JSON.stringify(emprestimos));
    localStorage.setItem('equipamentos', JSON.stringify(equipamentos));
}

// Atualizar estatísticas do dashboard
function updateDashboardStats() {
    const totalEmprestimos = document.getElementById('totalEmprestimos');
    
    if (totalEmprestimos) {
        const emprestimosAtivos = emprestimos.filter(e => e.status === 'ativo').length;
        totalEmprestimos.textContent = emprestimosAtivos;
    }
}

// Funções para alunos
function solicitarRenovacao(id) {
    showNotification('Solicitação de renovação enviada!', 'info');
}

// Funções administrativas
function editarEmprestimo(id) {
    showNotification('Funcionalidade de edição em desenvolvimento!', 'info');
}

function rejeitarEmprestimo(id) {
    if (confirm('Tem certeza que deseja rejeitar este empréstimo?')) {
        const emprestimo = emprestimos.find(e => e.id === id);
        if (emprestimo) {
            emprestimo.status = 'rejeitado';
            salvarDadosNoStorage();
            showNotification('Empréstimo rejeitado!', 'success');
            loadEmprestimosTable();
        }
    }
}

// Exportar funções para uso global
window.emprestimos = emprestimos;
window.loadEmprestimosTable = loadEmprestimosTable;
window.mostrarModalNovoEmprestimo = mostrarModalNovoEmprestimo;
window.registrarDevolucao = registrarDevolucao;
window.aprovarEmprestimo = aprovarEmprestimo;
window.solicitarRenovacao = solicitarRenovacao;
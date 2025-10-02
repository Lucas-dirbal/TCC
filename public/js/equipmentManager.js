// ===== SISTEMA DE GESTÃO DE EQUIPAMENTOS =====

// Base de dados de equipamentos
let equipamentos = JSON.parse(localStorage.getItem('equipamentos')) || [
    {
        id: 1,
        nome: 'Notebook Dell Inspiron',
        categoria: 'Informática',
        numeroSerie: 'DELL2024001',
        status: 'disponivel',
        localizacao: 'Laboratório 01',
        descricao: 'Notebook Dell i5, 8GB RAM, 256GB SSD',
        dataAquisicao: '2024-01-15',
        valor: 2500.00
    },
    {
        id: 2,
        nome: 'Projetor Epson',
        categoria: 'Áudio/Vídeo',
        numeroSerie: 'EPS2024002',
        status: 'disponivel', 
        localizacao: 'Sala de Reuniões',
        descricao: 'Projetor Epson XGA, 3000 lumens',
        dataAquisicao: '2024-01-20',
        valor: 1800.00
    },
    {
        id: 3,
        nome: 'Microscópio Biológico',
        categoria: 'Laboratório',
        numeroSerie: 'MIC2024003',
        status: 'manutencao',
        localizacao: 'Laboratório de Ciências',
        descricao: 'Microscópio biológico profissional',
        dataAquisicao: '2024-02-01',
        valor: 3200.00
    }
];

// Inicializar sistema de equipamentos
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('sistema.html')) {
        initEquipmentSystem();
    }
});

function initEquipmentSystem() {
    // Verificar permissões
    if (!AuthSystem.protectRoute('aluno')) return;
    
    loadEquipamentosTable();
    setupEquipmentEvents();
    updateDashboardStats();
}

// Carregar tabela de equipamentos
function loadEquipamentosTable() {
    const tbody = document.getElementById('equipamentosTable');
    if (!tbody) return;
    
    const currentUser = AuthSystem.getCurrentUser();
    const searchTerm = document.getElementById('searchEquipamentos')?.value.toLowerCase() || '';
    
    const equipamentosFiltrados = equipamentos.filter(equip => 
        equip.nome.toLowerCase().includes(searchTerm) ||
        equip.categoria.toLowerCase().includes(searchTerm) ||
        equip.numeroSerie.toLowerCase().includes(searchTerm)
    );
    
    tbody.innerHTML = '';
    
    equipamentosFiltrados.forEach(equipamento => {
        const tr = document.createElement('tr');
        
        // Definir ações baseado na role do usuário
        let acoes = '';
        if (currentUser.role === 'aluno') {
            acoes = `
                <button class="btn-action btn-view" onclick="verEquipamento(${equipamento.id})" 
                        ${equipamento.status !== 'disponivel' ? 'disabled' : ''}>
                    👁️ Ver
                </button>
            `;
        } else if (currentUser.role === 'professor') {
            acoes = `
                <button class="btn-action btn-view" onclick="verEquipamento(${equipamento.id})">
                    👁️ Ver
                </button>
                <button class="btn-action btn-edit" onclick="editarEquipamento(${equipamento.id})">
                    ✏️ Editar
                </button>
            `;
        } else if (currentUser.role === 'admin') {
            acoes = `
                <button class="btn-action btn-view" onclick="verEquipamento(${equipamento.id})">
                    👁️ Ver
                </button>
                <button class="btn-action btn-edit" onclick="editarEquipamento(${equipamento.id})">
                    ✏️ Editar
                </button>
                <button class="btn-action btn-delete" onclick="excluirEquipamento(${equipamento.id})">
                    🗑️ Excluir
                </button>
            `;
        }
        
        tr.innerHTML = `
            <td>${equipamento.id}</td>
            <td>${equipamento.nome}</td>
            <td>${equipamento.categoria}</td>
            <td>${equipamento.numeroSerie}</td>
            <td><span class="status-badge status-${equipamento.status}">${getStatusText(equipamento.status)}</span></td>
            <td>${equipamento.localizacao}</td>
            <td>${acoes}</td>
        `;
        
        tbody.appendChild(tr);
    });
}

// Configurar eventos dos equipamentos
function setupEquipmentEvents() {
    const btnNovoEquipamento = document.getElementById('btnNovoEquipamento');
    const searchInput = document.getElementById('searchEquipamentos');
    
    if (btnNovoEquipamento) {
        // Mostrar/ocultar botão baseado na role
        const currentUser = AuthSystem.getCurrentUser();
        if (currentUser.role === 'aluno') {
            btnNovoEquipamento.style.display = 'none';
        } else {
            btnNovoEquipamento.addEventListener('click', mostrarModalNovoEquipamento);
        }
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', loadEquipamentosTable);
    }
}

// Texto do status
function getStatusText(status) {
    const statusMap = {
        'disponivel': 'Disponível',
        'emprestado': 'Emprestado', 
        'manutencao': 'Manutenção',
        'indisponivel': 'Indisponível'
    };
    return statusMap[status] || status;
}

// Modal de novo equipamento
function mostrarModalNovoEquipamento() {
    if (!AuthSystem.hasPermission('professor')) {
        showNotification('Acesso não autorizado!', 'error');
        return;
    }
    
    const modalHTML = `
        <div class="modal-overlay" id="modalEquipamento">
            <div class="modal">
                <div class="modal-header">
                    <h3>➕ Novo Equipamento</h3>
                    <button class="modal-close" onclick="fecharModal()">×</button>
                </div>
                <div class="modal-body">
                    <form id="formEquipamento">
                        <div class="form-group">
                            <label for="equipamentoNome">Nome do Equipamento:</label>
                            <input type="text" id="equipamentoNome" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="equipamentoCategoria">Categoria:</label>
                            <select id="equipamentoCategoria" required>
                                <option value="">Selecione...</option>
                                <option value="Informática">Informática</option>
                                <option value="Áudio/Vídeo">Áudio/Vídeo</option>
                                <option value="Laboratório">Laboratório</option>
                                <option value="Escritório">Escritório</option>
                                <option value="Outros">Outros</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="equipamentoNumeroSerie">Número de Série:</label>
                            <input type="text" id="equipamentoNumeroSerie" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="equipamentoLocalizacao">Localização:</label>
                            <input type="text" id="equipamentoLocalizacao" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="equipamentoDescricao">Descrição:</label>
                            <textarea id="equipamentoDescricao" rows="3"></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="equipamentoValor">Valor (R$):</label>
                                <input type="number" id="equipamentoValor" step="0.01">
                            </div>
                            
                            <div class="form-group">
                                <label for="equipamentoStatus">Status:</label>
                                <select id="equipamentoStatus">
                                    <option value="disponivel">Disponível</option>
                                    <option value="indisponivel">Indisponível</option>
                                    <option value="manutencao">Manutenção</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="fecharModal()">Cancelar</button>
                    <button type="button" class="btn btn-primary" onclick="salvarEquipamento()">Salvar Equipamento</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Fechar modal ao clicar fora
    document.getElementById('modalEquipamento').addEventListener('click', function(e) {
        if (e.target === this) fecharModal();
    });
}

// Salvar equipamento
function salvarEquipamento() {
    const form = document.getElementById('formEquipamento');
    if (!form.checkValidity()) {
        showNotification('Preencha todos os campos obrigatórios!', 'error');
        return;
    }
    
    const novoEquipamento = {
        id: Math.max(...equipamentos.map(e => e.id), 0) + 1,
        nome: document.getElementById('equipamentoNome').value,
        categoria: document.getElementById('equipamentoCategoria').value,
        numeroSerie: document.getElementById('equipamentoNumeroSerie').value,
        localizacao: document.getElementById('equipamentoLocalizacao').value,
        descricao: document.getElementById('equipamentoDescricao').value,
        valor: parseFloat(document.getElementById('equipamentoValor').value) || 0,
        status: document.getElementById('equipamentoStatus').value,
        dataAquisicao: new Date().toISOString().split('T')[0]
    };
    
    equipamentos.push(novoEquipamento);
    salvarEquipamentosNoStorage();
    
    showNotification('Equipamento cadastrado com sucesso!', 'success');
    fecharModal();
    loadEquipamentosTable();
    updateDashboardStats();
}

// Ver equipamento
function verEquipamento(id) {
    const equipamento = equipamentos.find(e => e.id === id);
    if (!equipamento) return;
    
    const modalHTML = `
        <div class="modal-overlay" id="modalVerEquipamento">
            <div class="modal">
                <div class="modal-header">
                    <h3>👁️ Detalhes do Equipamento</h3>
                    <button class="modal-close" onclick="fecharModal()">×</button>
                </div>
                <div class="modal-body">
                    <div class="equipamento-detalhes">
                        <div class="detalhe-item">
                            <strong>Nome:</strong> ${equipamento.nome}
                        </div>
                        <div class="detalhe-item">
                            <strong>Categoria:</strong> ${equipamento.categoria}
                        </div>
                        <div class="detalhe-item">
                            <strong>Nº Série:</strong> ${equipamento.numeroSerie}
                        </div>
                        <div class="detalhe-item">
                            <strong>Status:</strong> <span class="status-badge status-${equipamento.status}">${getStatusText(equipamento.status)}</span>
                        </div>
                        <div class="detalhe-item">
                            <strong>Localização:</strong> ${equipamento.localizacao}
                        </div>
                        <div class="detalhe-item">
                            <strong>Descrição:</strong> ${equipamento.descricao || 'Nenhuma descrição'}
                        </div>
                        <div class="detalhe-item">
                            <strong>Valor:</strong> R$ ${equipamento.valor.toFixed(2)}
                        </div>
                        <div class="detalhe-item">
                            <strong>Data de Aquisição:</strong> ${new Date(equipamento.dataAquisicao).toLocaleDateString('pt-BR')}
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-primary" onclick="fecharModal()">Fechar</button>
                    ${AuthSystem.hasPermission('professor') && equipamento.status === 'disponivel' ? 
                        `<button type="button" class="btn btn-success" onclick="solicitarEmprestimo(${equipamento.id})">📅 Solicitar Empréstimo</button>` : ''}
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
}

// Editar equipamento
function editarEquipamento(id) {
    if (!AuthSystem.hasPermission('professor')) {
        showNotification('Acesso não autorizado!', 'error');
        return;
    }
    
    // Implementar edição similar ao cadastro
    showNotification('Funcionalidade de edição em desenvolvimento!', 'info');
}

// Excluir equipamento
function excluirEquipamento(id) {
    if (!AuthSystem.hasPermission('admin')) {
        showNotification('Acesso não autorizado!', 'error');
        return;
    }
    
    if (confirm('Tem certeza que deseja excluir este equipamento?')) {
        equipamentos = equipamentos.filter(e => e.id !== id);
        salvarEquipamentosNoStorage();
        showNotification('Equipamento excluído com sucesso!', 'success');
        loadEquipamentosTable();
        updateDashboardStats();
    }
}

// Salvar no localStorage
function salvarEquipamentosNoStorage() {
    localStorage.setItem('equipamentos', JSON.stringify(equipamentos));
}

// Atualizar estatísticas do dashboard
function updateDashboardStats() {
    const totalEquipamentos = document.getElementById('totalEquipamentos');
    const totalEmprestimos = document.getElementById('totalEmprestimos');
    const equipamentosDisponiveis = document.getElementById('equipamentosDisponiveis');
    const equipamentosManutencao = document.getElementById('equipamentosManutencao');
    
    if (totalEquipamentos) {
        totalEquipamentos.textContent = equipamentos.length;
    }
    
    if (equipamentosDisponiveis) {
        const disponiveis = equipamentos.filter(e => e.status === 'disponivel').length;
        equipamentosDisponiveis.textContent = disponiveis;
    }
    
    if (equipamentosManutencao) {
        const manutencao = equipamentos.filter(e => e.status === 'manutencao').length;
        equipamentosManutencao.textContent = manutencao;
    }
    
    // Empréstimos serão atualizados pelo loanSystem.js
}

// Fechar modal
function fecharModal() {
    const modals = document.querySelectorAll('.modal-overlay');
    modals.forEach(modal => modal.remove());
}

// Solicitar empréstimo
function solicitarEmprestimo(equipamentoId) {
    if (!AuthSystem.hasPermission('professor')) {
        showNotification('Apenas professores podem solicitar empréstimos!', 'error');
        return;
    }
    
    fecharModal();
    
    // Redirecionar para seção de empréstimos
    const menuItem = document.querySelector('[data-section="emprestimos"]');
    if (menuItem) menuItem.click();
    
    showNotification('Redirecionando para empréstimos...', 'info');
}

// Exportar funções para uso global
window.equipamentos = equipamentos;
window.loadEquipamentosTable = loadEquipamentosTable;
window.mostrarModalNovoEquipamento = mostrarModalNovoEquipamento;
window.verEquipamento = verEquipamento;
window.editarEquipamento = editarEquipamento;
window.excluirEquipamento = excluirEquipamento;
window.solicitarEmprestimo = solicitarEmprestimo;
window.fecharModal = fecharModal;
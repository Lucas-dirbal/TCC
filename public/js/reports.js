// ===== SISTEMA DE RELATÓRIOS =====

// Inicializar sistema de relatórios
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('sistema.html')) {
        initReportsSystem();
    }
});

function initReportsSystem() {
    // Verificar permissões
    if (!AuthSystem.hasPermission('professor')) return;
    
    setupReportsEvents();
}

// Configurar eventos dos relatórios
function setupReportsEvents() {
    // Eventos serão adicionados quando implementarmos os relatórios
    console.log('Sistema de relatórios inicializado');
}

// Gerar relatório de equipamentos
function gerarRelatorioEquipamentos() {
    if (!AuthSystem.hasPermission('professor')) {
        showNotification('Acesso não autorizado!', 'error');
        return;
    }
    
    const relatorio = `
        RELATÓRIO DE EQUIPAMENTOS - Colégio Reni Correia Gamper
        Data: ${new Date().toLocaleDateString('pt-BR')}
        
        TOTAL DE EQUIPAMENTOS: ${equipamentos.length}
        
        EQUIPAMENTOS CADASTRADOS:
        ${equipamentos.map(equip => `
        - ${equip.nome}
          Categoria: ${equip.categoria}
          Nº Série: ${equip.numeroSerie}
          Status: ${equip.status}
          Localização: ${equip.localizacao}
          Valor: R$ ${equip.valor.toFixed(2)}
        `).join('')}
        
        RESUMO POR STATUS:
        - Disponível: ${equipamentos.filter(e => e.status === 'disponivel').length}
        - Emprestado: ${equipamentos.filter(e => e.status === 'emprestado').length}
        - Manutenção: ${equipamentos.filter(e => e.status === 'manutencao').length}
        - Indisponível: ${equipamentos.filter(e => e.status === 'indisponivel').length}
    `;
    
    // Simular download do relatório
    const blob = new Blob([relatorio], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-equipamentos-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Relatório gerado com sucesso!', 'success');
}
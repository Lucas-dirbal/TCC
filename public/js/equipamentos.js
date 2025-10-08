function openTab(tabName) {
    // Esconde todas as abas
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }

    // Remove a classe active de todas as tabs
    const tabButtons = document.getElementsByClassName('nav-tab');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }

    // Mostra a aba selecionada
    document.getElementById(tabName).classList.add('active');
    
    // Ativa o botão da aba selecionada
    event.currentTarget.classList.add('active');
}

function logout() {
    if (confirm('Tem certeza que deseja sair do sistema?')) {
        alert('Saindo do sistema...');
        // Redirecionar para página de login
        // window.location.href = 'login.html';
    }
}

// Funções para Clientes
function novoCliente() {
    alert('Abrindo formulário para novo cliente...');
    // window.location.href = 'form-cliente.html';
}

function editarCliente() {
    alert('Editando cliente...');
    // Implementar lógica de edição
}

function excluirCliente() {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        alert('Cliente excluído com sucesso!');
        // Implementar lógica de exclusão
    }
}

function exportarClientes() {
    alert('Exportando dados dos clientes...');
    // Implementar lógica de exportação
}

// Funções para Produtos
function novoProduto() {
    alert('Abrindo formulário para novo produto...');
    // window.location.href = 'form-produto.html';
}

function editarProduto() {
    alert('Editando produto...');
    // Implementar lógica de edição
}

function ajustarEstoque() {
    alert('Abrindo ajuste de estoque...');
    // Implementar lógica de ajuste de estoque
}

function importarProdutos() {
    alert('Importando produtos...');
    // Implementar lógica de importação
}

// Funções para Vendas
function novaVenda() {
    alert('Iniciando nova venda...');
    // window.location.href = 'nova-venda.html';
}

function consultarVendas() {
    alert('Consultando vendas...');
    // Implementar lógica de consulta
}

function cancelarVenda() {
    if (confirm('Tem certeza que deseja cancelar esta venda?')) {
        alert('Venda cancelada com sucesso!');
        // Implementar lógica de cancelamento
    }
}

function relatorioVendas() {
    alert('Gerando relatório de vendas...');
    // Implementar geração de relatório
}

// Funções para Relatórios
function gerarRelatorioVendas() {
    alert('Gerando relatório de vendas...');
    // Implementar geração de relatório
}

function gerarRelatorioClientes() {
    alert('Gerando relatório de clientes...');
    // Implementar geração de relatório
}

function gerarRelatorioEstoque() {
    alert('Gerando relatório de estoque...');
    // Implementar geração de relatório
}

function gerarRelatorioFinanceiro() {
    alert('Gerando relatório financeiro...');
    // Implementar geração de relatório
}

// Event Listeners para melhor experiência
document.addEventListener('DOMContentLoaded', function() {
    // Adiciona eventos de hover nos botões
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Busca em tempo real na tabela de clientes
    const searchInput = document.querySelector('.search-box input');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('.table tbody tr');
            
            tableRows.forEach(row => {
                const text = row.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    }
});

// Função para carregar dados iniciais
function carregarDadosIniciais() {
    console.log('Sistema carregado com sucesso!');
    // Aqui você pode carregar dados iniciais da API ou localStorage
}

// Inicializar sistema quando a página carregar
window.onload = carregarDadosIniciais;
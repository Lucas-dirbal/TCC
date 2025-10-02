// ===== SISTEMA DE AUTENTICAÇÃO =====

// Base de usuários
const users = {
    'admin': {
        password: 'admin123',
        role: 'admin',
        name: 'Administrador Sistema',
        email: 'admin@colegio.com'
    },
    'professor': {
        password: 'prof123', 
        role: 'professor',
        name: 'Professor Silva',
        email: 'prof.silva@colegio.com'
    },
    'aluno': {
        password: 'aluno123',
        role: 'aluno', 
        name: 'João Aluno',
        email: 'joao.aluno@colegio.com'
    }
};

// Inicializar sistema de auth
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔐 Sistema de auth carregado');
    initLoginSystem();
    checkExistingLogin();
});

// Sistema de login - VERSÃO CORRIGIDA
function initLoginSystem() {
    console.log('🎯 Inicializando sistema de login...');
    
    const loginForm = document.getElementById('loginForm');
    const credentialCards = document.querySelectorAll('.credential-card');
    
    console.log('📋 Formulário de login:', loginForm ? '✅ Encontrado' : '❌ Não encontrado');
    console.log('🎴 Cards de credenciais:', credentialCards.length);
    
    // Evento do formulário
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📝 Formulário submetido');
            handleLogin();
        });
    } else {
        console.log('⚠️ Formulário de login não encontrado!');
    }
    
    // ✅ CORREÇÃO: Login automático ao clicar nas credenciais
    if (credentialCards.length > 0) {
        credentialCards.forEach((card, index) => {
            card.addEventListener('click', function() {
                const username = this.getAttribute('data-user');
                const password = this.getAttribute('data-pass');
                
                console.log(`🎴 Card ${index + 1} clicado:`, username);
                
                // Preencher campos
                const usernameField = document.getElementById('username');
                const passwordField = document.getElementById('password');
                
                if (usernameField && passwordField) {
                    usernameField.value = username;
                    passwordField.value = password;
                    
                    // Destacar card selecionado
                    credentialCards.forEach(c => c.classList.remove('selected'));
                    this.classList.add('selected');
                    
                    console.log('✅ Campos preenchidos, fazendo login em 500ms...');
                    
                    // Fazer login automaticamente
                    setTimeout(() => {
                        handleLogin();
                    }, 500);
                    
                } else {
                    console.log('❌ Campos de login não encontrados!');
                }
            });
        });
    } else {
        console.log('⚠️ Nenhum card de credencial encontrado!');
    }
    
    // Login ao pressionar Enter
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('⌨️ Enter pressionado');
                handleLogin();
            }
        });
    }
}

// Processar login
function handleLogin() {
    console.log('🔄 Processando login...');
    
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value;
    const remember = document.getElementById('remember')?.checked;
    
    console.log('📧 Usuário:', username);
    console.log('🔑 Senha:', password ? '***' : 'vazia');
    console.log('💾 Lembrar:', remember);
    
    if (!username || !password) {
        console.log('❌ Campos vazios');
        showNotification('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Verificar credenciais
    if (users[username] && users[username].password === password) {
        console.log('✅ Credenciais válidas');
        
        const userData = {
            username: username,
            role: users[username].role,
            name: users[username].name,
            email: users[username].email,
            loginTime: new Date().toISOString()
        };
        
        // Salvar sessão
        saveUserSession(userData, remember);
        
        // Redirecionar
        showNotification(`Bem-vindo, ${userData.name}!`, 'success');
        setTimeout(() => {
            console.log('🚀 Redirecionando para sistema...');
            window.location.href = 'sistema.html';
        }, 1000);
        
    } else {
        console.log('❌ Credenciais inválidas');
        showNotification('Usuário ou senha incorretos!', 'error');
        document.getElementById('password').value = '';
    }
}

// Salvar sessão do usuário
function saveUserSession(userData, remember) {
    const sessionData = {
        ...userData,
        expires: remember ? Date.now() + (30 * 24 * 60 * 60 * 1000) : Date.now() + (2 * 60 * 60 * 1000)
    };
    
    localStorage.setItem('currentUser', JSON.stringify(sessionData));
    console.log('💾 Sessão salva:', sessionData);
}

// Verificar se já está logado
function checkExistingLogin() {
    const currentUser = getCurrentUser();
    console.log('🔍 Verificando login existente:', currentUser);
    
    if (currentUser && !isSessionExpired(currentUser)) {
        console.log('✅ Usuário já logado, redirecionando...');
        window.location.href = 'sistema.html';
    } else if (currentUser && isSessionExpired(currentUser)) {
        console.log('🕒 Sessão expirada');
        logout();
        showNotification('Sessão expirada. Faça login novamente.', 'warning');
    }
}

// Obter usuário atual
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser'));
    } catch (error) {
        console.error('❌ Erro ao ler usuário:', error);
        return null;
    }
}

// Verificar se sessão expirou
function isSessionExpired(userData) {
    return Date.now() > userData.expires;
}

// Logout
function logout() {
    console.log('🚪 Fazendo logout...');
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Verificar permissões
function hasPermission(requiredRole) {
    const currentUser = getCurrentUser();
    
    if (!currentUser) return false;
    if (isSessionExpired(currentUser)) {
        logout();
        return false;
    }
    
    const roleHierarchy = {
        'aluno': 1,
        'professor': 2, 
        'admin': 3
    };
    
    return roleHierarchy[currentUser.role] >= roleHierarchy[requiredRole];
}

// Proteger rotas
function protectRoute(requiredRole) {
    const currentUser = getCurrentUser();
    
    if (!currentUser || isSessionExpired(currentUser)) {
        window.location.href = 'login.html';
        return false;
    }
    
    if (!hasPermission(requiredRole)) {
        showNotification('Acesso não autorizado!', 'error');
        setTimeout(() => {
            window.location.href = 'sistema.html';
        }, 2000);
        return false;
    }
    
    return true;
}

// Atualizar interface baseada no usuário
function updateUIForUser() {
    const currentUser = getCurrentUser();
    console.log('🎨 Atualizando UI para:', currentUser);
    
    // Atualizar navbar
    const userDisplay = document.getElementById('userDisplay');
    const userRole = document.getElementById('userRole');
    
    if (userDisplay && currentUser) {
        userDisplay.textContent = currentUser.name;
    }
    
    if (userRole && currentUser) {
        userRole.textContent = currentUser.role;
        userRole.style.background = 
            currentUser.role === 'admin' ? '#e74c3c' :
            currentUser.role === 'professor' ? '#f39c12' : '#27ae60';
    }
    
    // Mostrar/ocultar elementos baseado na role
    const adminElements = document.querySelectorAll('.admin-only');
    const professorElements = document.querySelectorAll('.professor-only');
    
    adminElements.forEach(el => {
        el.style.display = currentUser?.role === 'admin' ? '' : 'none';
    });
    
    professorElements.forEach(el => {
        el.style.display = ['admin', 'professor'].includes(currentUser?.role) ? '' : 'none';
    });
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Menu navigation
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const section = this.getAttribute('data-section');
            if (section) {
                if (section === 'usuarios' && !hasPermission('admin')) {
                    showNotification('Acesso não autorizado!', 'error');
                    return;
                }
                
                if (section === 'relatorios' && !hasPermission('professor')) {
                    showNotification('Acesso não autorizado!', 'error');
                    return;
                }
                
                showSection(section);
            }
        });
    });
}

// Mostrar seção específica
function showSection(sectionId) {
    console.log('📂 Mostrando seção:', sectionId);
    
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const targetSection = document.getElementById(sectionId);
    const targetMenu = document.querySelector(`[data-section="${sectionId}"]`);
    
    if (targetSection) targetSection.classList.add('active');
    if (targetMenu) targetMenu.classList.add('active');
}

// Exportar funções para uso global
window.AuthSystem = {
    getCurrentUser,
    hasPermission,
    protectRoute,
    logout,
    updateUIForUser
};

console.log('🔐 Auth system carregado e pronto!');
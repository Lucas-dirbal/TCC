// ===== SISTEMA DE AUTENTICAÇÃO =====

// Base de usuários (em produção, isso viria de um backend)
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
    initLoginSystem();
    checkExistingLogin();
});

// Sistema de login
function initLoginSystem() {
    const loginForm = document.getElementById('loginForm');
    const credentialCards = document.querySelectorAll('.credential-card');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleLogin();
        });
    }
    
    // Preencher credenciais ao clicar nos cards de demo
    credentialCards.forEach(card => {
        card.addEventListener('click', function() {
            const username = this.getAttribute('data-user');
            const password = this.getAttribute('data-pass');
            
            document.getElementById('username').value = username;
            document.getElementById('password').value = password;
            
            // Destacar card selecionado
            credentialCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
        });
    });
}

// Processar login
function handleLogin() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Validações básicas
    if (!username || !password) {
        showNotification('Por favor, preencha todos os campos!', 'error');
        return;
    }
    
    // Verificar credenciais
    if (users[username] && users[username].password === password) {
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
            window.location.href = 'sistema.html';
        }, 1500);
        
    } else {
        showNotification('Usuário ou senha incorretos!', 'error');
        // Limpar senha
        document.getElementById('password').value = '';
    }
}

// Salvar sessão do usuário
function saveUserSession(userData, remember) {
    const sessionData = {
        ...userData,
        expires: remember ? Date.now() + (30 * 24 * 60 * 60 * 1000) : Date.now() + (2 * 60 * 60 * 1000) // 30 dias ou 2 horas
    };
    
    localStorage.setItem('currentUser', JSON.stringify(sessionData));
}

// Verificar se já está logado
function checkExistingLogin() {
    const currentUser = getCurrentUser();
    
    if (currentUser && !isSessionExpired(currentUser)) {
        // Se já está logado e a sessão não expirou, redirecionar
        window.location.href = 'sistema.html';
    } else if (currentUser && isSessionExpired(currentUser)) {
        // Sessão expirada
        logout();
        showNotification('Sessão expirada. Faça login novamente.', 'warning');
    }
}

// Obter usuário atual
function getCurrentUser() {
    try {
        return JSON.parse(localStorage.getItem('currentUser'));
    } catch (error) {
        return null;
    }
}

// Verificar se sessão expirou
function isSessionExpired(userData) {
    return Date.now() > userData.expires;
}

// Logout
function logout() {
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
    const userDisplay = document.getElementById('userDisplay');
    const adminElements = document.querySelectorAll('.admin-only');
    const professorElements = document.querySelectorAll('.professor-only');
    const alunoElements = document.querySelectorAll('.aluno-only');
    
    if (userDisplay && currentUser) {
        userDisplay.textContent = currentUser.name;
    }
    
    // Mostrar/ocultar elementos baseado na role
    if (currentUser) {
        adminElements.forEach(el => {
            el.style.display = currentUser.role === 'admin' ? '' : 'none';
        });
        
        professorElements.forEach(el => {
            el.style.display = ['admin', 'professor'].includes(currentUser.role) ? '' : 'none';
        });
        
        alunoElements.forEach(el => {
            el.style.display = ['admin', 'professor', 'aluno'].includes(currentUser.role) ? '' : 'none';
        });
    }
}

// Exportar funções para uso global
window.AuthSystem = {
    getCurrentUser,
    hasPermission,
    protectRoute,
    logout,
    updateUIForUser
};
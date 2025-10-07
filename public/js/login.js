// Sistema de Login com API
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorDiv = document.getElementById('loginError');

    // Verificar se já está logado
    checkExistingLogin();

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value;

        if (validateLogin(username, password)) {
            await attemptLogin(username, password);
        }
    });

    function validateLogin(username, password) {
        // Reset errors
        hideError();
        
        if (!username) {
            showError('Por favor, digite o usuário');
            usernameInput.focus();
            return false;
        }

        if (!password) {
            showError('Por favor, digite a senha');
            passwordInput.focus();
            return false;
        }

        return true;
    }

    async function attemptLogin(username, password) {
        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (data.success) {
                // Login bem-sucedido - redirecionar para o sistema
                window.location.href = '/sistema';
            } else {
                // Login falhou
                showError(data.message || 'Erro ao fazer login');
                passwordInput.value = '';
                passwordInput.focus();
            }
        } catch (error) {
            console.error('Erro:', error);
            showError('Erro de conexão com o servidor');
        }
    }

    function showError(message) {
        if (!errorDiv) {
            // Criar elemento de erro se não existir
            const errorElement = document.createElement('div');
            errorElement.className = 'alert alert-error';
            errorElement.id = 'loginError';
            errorElement.textContent = message;
            loginForm.insertBefore(errorElement, loginForm.firstChild);
            return;
        }
        
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    function hideError() {
        if (errorDiv) {
            errorDiv.style.display = 'none';
        }
    }

    async function checkExistingLogin() {
        try {
            const response = await fetch('/api/user');
            const data = await response.json();
            
            if (data.success) {
                // Já está logado, redirecionar para o sistema
                window.location.href = '/sistema';
            }
        } catch (error) {
            console.log('Usuário não autenticado');
        }
    }
});
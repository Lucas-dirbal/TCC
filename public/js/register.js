// Validação do formulário de registro
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirm-password');
    
    // Validação em tempo real
    password.addEventListener('input', validatePassword);
    confirmPassword.addEventListener('input', validatePasswordConfirmation);
    
    // Submissão do formulário
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            // Simular envio (substituir por API real)
            simulateRegistration();
        }
    });
    
    function validatePassword() {
        const errorElement = document.getElementById('password-error');
        const value = password.value;
        
        if (value.length < 6) {
            errorElement.textContent = 'A senha deve ter pelo menos 6 caracteres';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }
    
    function validatePasswordConfirmation() {
        const errorElement = document.getElementById('confirm-password-error');
        
        if (confirmPassword.value !== password.value) {
            errorElement.textContent = 'As senhas não coincidem';
            return false;
        } else {
            errorElement.textContent = '';
            return true;
        }
    }
    
    function validateForm() {
        let isValid = true;
        
        // Validar todos os campos
        isValid = validatePassword() && isValid;
        isValid = validatePasswordConfirmation() && isValid;
        
        // Validar se todos os campos obrigatórios estão preenchidos
        const requiredFields = registerForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                isValid = false;
                const errorElement = document.getElementById(field.name + '-error');
                if (errorElement) {
                    errorElement.textContent = 'Este campo é obrigatório';
                }
            }
        });
        
        return isValid;
    }
    
    function simulateRegistration() {
        const submitButton = registerForm.querySelector('.btn-register');
        const btnText = submitButton.querySelector('.btn-text');
        const btnLoading = submitButton.querySelector('.btn-loading');
        
        // Mostrar estado de carregamento
        submitButton.classList.add('loading');
        btnText.style.display = 'none';
        btnLoading.style.display = 'inline-block';
        
        // Simular requisição AJAX
        setTimeout(() => {
            // Aqui você faria a requisição real para sua API
            alert('Conta criada com sucesso! Redirecionando para login...');
            window.location.href = 'login.html';
        }, 2000);
    }
});
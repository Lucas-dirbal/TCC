// Sistema de login
function initLoginSystem() {
    const loginForm = document.getElementById('loginForm');
    const credentialCards = document.querySelectorAll('.credential-card');
    
    console.log('🔐 Iniciando sistema de login...');
    console.log('Formulário encontrado:', loginForm ? '✅ Sim' : '❌ Não');
    console.log('Cards de demo encontrados:', credentialCards.length);
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('📝 Formulário submetido, processando login...');
            handleLogin();
        });
    }
    
    // ✅ CORREÇÃO: Login automático ao clicar nas credenciais
    credentialCards.forEach(card => {
        card.addEventListener('click', function() {
            const username = this.getAttribute('data-user');
            const password = this.getAttribute('data-pass');
            
            console.log('🎯 Clicou na credencial:', username);
            
            // Preencher campos
            document.getElementById('username').value = username;
            document.getElementById('password').value = password;
            
            // Destacar card selecionado
            credentialCards.forEach(c => c.classList.remove('selected'));
            this.classList.add('selected');
            
            // ✅ FAZER LOGIN AUTOMATICAMENTE
            console.log('🚀 Iniciando login automático...');
            setTimeout(() => {
                handleLogin();
            }, 300);
        });
    });
    
    // ✅ CORREÇÃO EXTRA: Login ao pressionar Enter
    const passwordField = document.getElementById('password');
    if (passwordField) {
        passwordField.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('⌨️ Enter pressionado, fazendo login...');
                handleLogin();
            }
        });
    }
}
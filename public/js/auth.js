class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.authChecked = false;
        this.init();
    }

    init() {
        this.loadUserFromStorage();
    }

    loadUserFromStorage() {
        try {
            const userData = localStorage.getItem('currentUser');
            if (userData) {
                this.currentUser = JSON.parse(userData);
            }
        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            this.clearAuth();
        }
    }

    async login(email, password) {
        try {
            // Simulação de API call - substitua pela sua API real
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            const user = users.find(u => u.email === email && u.password === password);
            
            if (user) {
                this.currentUser = {
                    id: user.id,
                    name: user.name,
                    email: user.email
                };
                
                localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
                this.authChecked = true;
                
                return {
                    success: true,
                    user: this.currentUser
                };
            } else {
                return {
                    success: false,
                    message: 'Email ou senha incorretos'
                };
            }
        } catch (error) {
            console.error('Erro no login:', error);
            return {
                success: false,
                message: 'Erro interno do sistema'
            };
        }
    }

    async register(name, email, password) {
        try {
            const users = JSON.parse(localStorage.getItem('users') || '[]');
            
            // Verifica se usuário já existe
            if (users.find(u => u.email === email)) {
                return {
                    success: false,
                    message: 'Email já cadastrado'
                };
            }

            const newUser = {
                id: Date.now().toString(),
                name,
                email,
                password,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('users', JSON.stringify(users));

            return {
                success: true,
                message: 'Usuário criado com sucesso'
            };
        } catch (error) {
            console.error('Erro no registro:', error);
            return {
                success: false,
                message: 'Erro interno do sistema'
            };
        }
    }

    logout() {
        this.currentUser = null;
        this.authChecked = false;
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    }

    isAuthenticated() {
        return this.currentUser !== null;
    }

    requireAuth() {
        if (!this.isAuthenticated() && !this.authChecked) {
            this.authChecked = true;
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    requireGuest() {
        if (this.isAuthenticated()) {
            window.location.href = 'sistema.html';
            return false;
        }
        return true;
    }

    clearAuth() {
        this.currentUser = null;
        this.authChecked = false;
        localStorage.removeItem('currentUser');
    }

    getUser() {
        return this.currentUser;
    }
}

// Instância global do sistema de autenticação
const authSystem = new AuthSystem();
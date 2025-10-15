class UserManager {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('users') || '[]');
        this.currentUser = authSystem.getUser();
    }

    // Verificar se usuário atual é admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Obter todos os usuários (com filtro para não-admins)
    getUsers() {
        // Buscar usuários da API
        return this.fetchUsersFromAPI();
    }

    async fetchUsersFromAPI() {
        try {
            const response = await fetch('/api/users');
            const result = await response.json();
            if (result.success && Array.isArray(result.users)) {
                return result.users;
            } else {
                return [];
            }
        } catch (error) {
            return [];
        }
    }

    // Criar novo usuário
    createUser(userData) {
        return new Promise(async (resolve, reject) => {
            try {
                // Verificar se é admin para criar usuários
                if (!this.isAdmin() && userData.role === 'admin') {
                    reject(new Error('Sem permissão para criar usuários admin'));
                    return;
                }

                // Chamada para API
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: userData.name,
                        password: userData.password,
                        email: userData.email,
                        role: userData.role
                    })
                });
                const result = await response.json();
                if (result.success) {
                    resolve({ success: true, user: { id: result.id, ...userData }, message: 'Usuário criado com sucesso!' });
                } else {
                    reject(new Error(result.message || 'Erro ao criar usuário'));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // Atualizar usuário
    updateUser(userId, updates) {
        return new Promise(async (resolve, reject) => {
            try {
                // Apenas admin pode editar qualquer usuário
                if (!this.isAdmin()) {
                    reject(new Error('Sem permissão para editar este usuário'));
                    return;
                }
                const response = await fetch(`/api/user/${userId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: updates.name,
                        email: updates.email,
                        role: updates.role,
                        password: updates.password
                    })
                });
                const result = await response.json();
                if (result.success) {
                    resolve({ success: true, message: result.message });
                } else {
                    reject(new Error(result.message || 'Erro ao atualizar usuário'));
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    // Excluir usuário
    deleteUser(userId) {
        return new Promise((resolve, reject) => {
            try {
                if (!this.isAdmin()) {
                    reject(new Error('Apenas administradores podem excluir usuários'));
                    return;
                }

                // Não permitir excluir a si mesmo
                if (userId === this.currentUser.id) {
                    reject(new Error('Não é possível excluir seu próprio usuário'));
                    return;
                }

                const userIndex = this.users.findIndex(u => u.id === userId);
                
                if (userIndex === -1) {
                    reject(new Error('Usuário não encontrado'));
                    return;
                }

                this.users.splice(userIndex, 1);
                this.saveToStorage();

                resolve({
                    success: true,
                    message: 'Usuário excluído com sucesso!'
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    // Salvar no localStorage
    saveToStorage() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    // Gerar HTML da tabela de usuários
    renderUsersTable() {
        return this.fetchUsersFromAPI().then(users => {
            if (!users || users.length === 0) {
                return `
                    <div class="no-data">
                        <p>Nenhum usuário cadastrado</p>
                    </div>
                `;
            }
            function cargoLabel(role) {
                if (role === 'admin') return 'Admin';
                if (role === 'equipe') return 'Equipe pedagógica';
                if (role === 'aluno') return 'Aluno';
                return role;
            }
            return `
                <div class="table-container">
                    <table class="users-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Email</th>
                                <th>Cargo</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(user => `
                                <tr>
                                    <td>${user.username}</td>
                                    <td>-</td>
                                    <td>${cargoLabel(user.role)}</td>
                                    <td>
                                        <button class="btn-edit" onclick="userManager.openEditModal('${user.id}')">Editar</button>
                                        <button class="btn-delete" onclick="userManager.confirmDelete('${user.id}')">Excluir</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
        });
    }

    // Modal para criar/editar usuários
    openCreateModal() {
        if (!this.isAdmin()) {
            alert('Apenas administradores podem criar usuários');
            return;
        }

        const modalHTML = `
            <div id="userModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Criar Novo Usuário</h3>
                        <span class="close" onclick="userManager.closeModal()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="userForm">
                            <div class="form-group">
                                <label for="userName">Nome:</label>
                                <input type="text" id="userName" name="name" required>
                            </div>
                            <div class="form-group">
                                <label for="userEmail">Email:</label>
                                <input type="email" id="userEmail" name="email" required>
                            </div>
                            <div class="form-group">
                                <label for="userPassword">Senha:</label>
                                <input type="password" id="userPassword" name="password" required>
                            </div>
                            <div class="form-group">
                                <label for="userRole">Tipo de Usuário:</label>
                                <select id="userRole" name="role">
                                    <option value="user">Usuário</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="userStatus">Status:</label>
                                <select id="userStatus" name="status">
                                    <option value="active">Ativo</option>
                                    <option value="inactive">Inativo</option>
                                </select>
                            </div>
                            <div class="form-actions">
                                <button type="button" class="btn-cancel" onclick="userManager.closeModal()">Cancelar</button>
                                <button type="submit" class="btn-submit">Criar Usuário</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupUserForm();
    }

    openEditModal(userId) {
        const user = this.users.find(u => u.id === userId);
        if (!user) return;

        const modalHTML = `
            <div id="userModal" class="modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Editar Usuário</h3>
                        <span class="close" onclick="userManager.closeModal()">&times;</span>
                    </div>
                    <div class="modal-body">
                        <form id="userForm" data-user-id="${userId}">
                            <div class="form-group">
                                <label for="userName">Nome:</label>
                                <input type="text" id="userName" name="name" value="${user.name}" required>
                            </div>
                            <div class="form-group">
                                <label for="userEmail">Email:</label>
                                <input type="email" id="userEmail" name="email" value="${user.email}" required>
                            </div>
                            <div class="form-group">
                                <label for="userPassword">Nova Senha (deixe em branco para manter atual):</label>
                                <input type="password" id="userPassword" name="password">
                            </div>
                            ${this.isAdmin() ? `
                                <div class="form-group">
                                    <label for="userRole">Tipo de Usuário:</label>
                                    <select id="userRole" name="role">
                                        <option value="user" ${user.role === 'user' ? 'selected' : ''}>Usuário</option>
                                        <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Administrador</option>
                                    </select>
                                </div>
                                <div class="form-group">
                                    <label for="userStatus">Status:</label>
                                    <select id="userStatus" name="status">
                                        <option value="active" ${user.status === 'active' ? 'selected' : ''}>Ativo</option>
                                        <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>Inativo</option>
                                    </select>
                                </div>
                            ` : ''}
                            <div class="form-actions">
                                <button type="button" class="btn-cancel" onclick="userManager.closeModal()">Cancelar</button>
                                <button type="submit" class="btn-submit">Atualizar Usuário</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        this.setupUserForm();
    }

    setupUserForm() {
        const form = document.getElementById('userForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleUserFormSubmit(form);
            });
        }
    }

    async handleUserFormSubmit(form) {
        const formData = new FormData(form);
        const userData = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            role: formData.get('role'),
            status: formData.get('status')
        };

        const userId = form.getAttribute('data-user-id');

        try {
            let result;
            if (userId) {
                // Editar usuário existente
                if (!userData.password) {
                    delete userData.password; // Manter senha atual se não foi informada nova
                }
                result = await this.updateUser(userId, userData);
            } else {
                // Criar novo usuário
                result = await this.createUser(userData);
            }

            if (result.success) {
                alert(result.message);
                this.closeModal();
                this.refreshUsersView();
            }
        } catch (error) {
            alert('Erro: ' + error.message);
        }
    }

    confirmDelete(userId) {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            this.deleteUser(userId)
                .then(result => {
                    if (result.success) {
                        alert(result.message);
                        this.refreshUsersView();
                    }
                })
                .catch(error => {
                    alert('Erro: ' + error.message);
                });
        }
    }

    closeModal() {
        const modal = document.getElementById('userModal');
        if (modal) {
            modal.remove();
        }
    }

    refreshUsersView() {
        // Recarregar a visualização de usuários
        const contentArea = document.getElementById('mainContent');
        if (contentArea && contentArea.getAttribute('data-current-page') === 'usuarios') {
            this.showUsersManagement();
        }
    }

    // Mostrar gerenciamento de usuários
    showUsersManagement() {
        const contentArea = document.getElementById('mainContent');
        if (!contentArea) return;

        contentArea.setAttribute('data-current-page', 'usuarios');
        
        contentArea.innerHTML = `
            <div class="page-header">
                <h2>Gerenciar Usuários</h2>
                ${this.isAdmin() ? `
                    <button class="btn-primary" onclick="userManager.openCreateModal()">
                        + Novo Usuário
                    </button>
                ` : ''}
            </div>
            <div class="users-container">
                ${this.renderUsersTable()}
            </div>
        `;
    }
}

// Instância global do gerenciador de usuários
const userManager = new UserManager();
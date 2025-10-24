// LOGOUT
document.getElementById("logoutBtn").addEventListener("click", e => {
    e.preventDefault();
    fetch("/api/logout", { method: "POST" })
        .then(res => res.json())
        .then(data => {
            if (data.success) window.location.href = "/login";
            else alert("Erro ao sair");
        })
        .catch(() => alert("Erro de conexão ao sair."));
});

// PEGAR DADOS DO USUÁRIO
fetch("/api/user")
    .then(res => res.json())
    .then(data => {
        if (!data.success) return window.location.href = "/login";

        const role = data.user.role; // admin, professor, aluno
        document.getElementById("userDisplay").textContent = `👤 ${data.user.username}`;
        document.getElementById("userRole").textContent = role.charAt(0).toUpperCase() + role.slice(1);

        // ESCONDER MENU/SEÇÕES POR CARGO
        if (role !== "admin") document.querySelectorAll(".admin-only").forEach(el => el.style.display = "none");
        if (role !== "professor") document.querySelectorAll(".professor-only").forEach(el => el.style.display = "none");
        if (role !== "equipe") document.querySelectorAll(".equipe-only").forEach(el => el.style.display = "none");
        if (role !== "aluno") document.querySelectorAll(".aluno-only").forEach(el => el.style.display = "none");
    })
    .catch(() => window.location.href = "/login");

// NAVEGAÇÃO ENTRE SEÇÕES
document.querySelectorAll(".menu-item").forEach(item => {
    item.addEventListener("click", e => {
        e.preventDefault();
        const sectionId = item.dataset.section;

        document.querySelectorAll(".content-section").forEach(sec => sec.classList.remove("active"));
        const section = document.getElementById(sectionId);
        if (section) section.classList.add("active");

        document.querySelectorAll(".menu-item").forEach(mi => mi.classList.remove("active"));
        item.classList.add("active");

        // Se for a seção de usuários, renderizar tabela e ativar botões
        if (sectionId === "usuarios") {
            renderUsuariosSection();
        }
    });
});

// Função para renderizar a tabela de usuários e ativar botões
function renderUsuariosSection() {
    // Renderizar tabela de usuários usando método do UserManager
    const usuariosTable = document.getElementById("usuariosTable");
    if (usuariosTable) {
        userManager.renderUsersTable().then(html => {
            usuariosTable.parentElement.innerHTML = html;
        });
    }

    // Botão de novo usuário
    // O botão pode ser recriado após renderização da tabela, então é preciso garantir o evento sempre
        setTimeout(() => {
                const btnNovoUsuario = document.getElementById("btnNovoUsuario");
                if (btnNovoUsuario) {
                        btnNovoUsuario.onclick = () => {
                                // Modal customizado centralizado
                                if (document.getElementById('userModal')) return;
                                const modalHTML = `
                                <div id="userModal" class="modal" style="display:flex;align-items:center;justify-content:center;position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.5);z-index:9999;">
                                    <div class="modal-content" style="background:#fff;padding:2rem;border-radius:8px;min-width:320px;max-width:90vw;box-shadow:0 2px 16px rgba(0,0,0,0.2);">
                                        <div class="modal-header" style="display:flex;justify-content:space-between;align-items:center;">
                                            <h3 style="margin:0;">Criar Novo Usuário</h3>
                                            <span class="close" style="cursor:pointer;font-size:1.5rem;" onclick="document.getElementById('userModal').remove()">&times;</span>
                                        </div>
                                        <div class="modal-body">
                                            <form id="userForm">
                                                <div class="form-group" style="margin-bottom:1rem;">
                                                    <label for="userName">Nome:</label>
                                                    <input type="text" id="userName" name="name" required style="width:100%;padding:0.5rem;">
                                                </div>
                                                <div class="form-group" style="margin-bottom:1rem;">
                                                    <label for="userEmail">Email:</label>
                                                    <input type="email" id="userEmail" name="email" required style="width:100%;padding:0.5rem;">
                                                </div>
                                                <div class="form-group" style="margin-bottom:1rem;">
                                                    <label for="userPassword">Senha:</label>
                                                    <input type="password" id="userPassword" name="password" required style="width:100%;padding:0.5rem;">
                                                </div>
                                                <div class="form-group" style="margin-bottom:1rem;">
                                                    <label for="userRole">Cargo:</label>
                                                                                <select id="userRole" name="role" style="width:100%;padding:0.5rem;">
                                                                                    <option value="admin">Admin</option>
                                                                                    <option value="professor">Professor</option>
                                                                                    <option value="equipe">Equipe pedagógica</option>
                                                                                    <option value="aluno">Aluno</option>
                                                                                </select>
                                                </div>
                                                <div class="form-actions" style="display:flex;justify-content:flex-end;gap:1rem;">
                                                    <button type="button" class="btn-cancel" onclick="document.getElementById('userModal').remove()">Cancelar</button>
                                                    <button type="submit" class="btn-submit btn btn-primary">Criar Usuário</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>`;
                                document.body.insertAdjacentHTML('beforeend', modalHTML);
                                // Adiciona evento ao formulário
                                setTimeout(() => {
                                    const form = document.getElementById('userForm');
                                    if (form) {
                                        form.addEventListener('submit', async (e) => {
                                            e.preventDefault();
                                            const formData = new FormData(form);
                                            const userData = {
                                                name: formData.get('name'),
                                                email: formData.get('email'),
                                                password: formData.get('password'),
                                                role: formData.get('role')
                                            };
                                            try {
                                                const result = await userManager.createUser(userData);
                                                if (result.success) {
                                                    alert(result.message);
                                                    document.getElementById('userModal').remove();
                                                    renderUsuariosSection();
                                                }
                                            } catch (error) {
                                                alert('Erro: ' + error.message);
                                            }
                                        });
                                    }
                                }, 50);
                        };
                }
        }, 100);
}

// Atualizar tabela após criar/editar/excluir usuário
userManager.refreshUsersView = function() {
    renderUsuariosSection();
};

// Renderizar usuários ao carregar a página se a seção estiver ativa
window.addEventListener('DOMContentLoaded', () => {
    const usuariosSection = document.getElementById('usuarios');
    if (usuariosSection && usuariosSection.classList.contains('active')) {
        renderUsuariosSection();
    }
});
// Renderizar usuários ao carregar a página se a seção estiver ativa
window.addEventListener('DOMContentLoaded', () => {
    const usuariosSection = document.getElementById('usuarios');
    if (usuariosSection && usuariosSection.classList.contains('active')) {
        renderUsuariosSection();
    }
});

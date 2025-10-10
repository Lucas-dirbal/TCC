// Usuários mockados para teste
const mockUsers = [
    { username: "admin", password: "admin123", role: "admin" },
    { username: "professor", password: "prof123", role: "professor" },
    { username: "aluno", password: "aluno123", role: "aluno" }
];

// LOGIN
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    if (!loginForm) return;

    loginForm.addEventListener("submit", e => {
        e.preventDefault();
        const username = loginForm.username.value.trim();
        const password = loginForm.password.value.trim();

        const user = mockUsers.find(u => u.username === username && u.password === password);

        if (!user) {
            alert("Usuário ou senha incorretos");
            return;
        }

        // Salva no sessionStorage para simular sessão
        sessionStorage.setItem("user", JSON.stringify(user));
        window.location.href = "/sistema";
    });
});

// FUNÇÃO PARA PEGAR USUÁRIO LOGADO
function getCurrentUser() {
    const userData = sessionStorage.getItem("user");
    return userData ? JSON.parse(userData) : null;
}

// API SIMULADA /api/user
async function fetchUserMock() {
    return new Promise(resolve => {
        const user = getCurrentUser();
        if (user) resolve({ success: true, user });
        else resolve({ success: false });
    });
}

// MOCK PARA FETCH /api/user
window.fetch = new Proxy(window.fetch, {
    apply: async (target, thisArg, args) => {
        const [url, options] = args;
        if (url === "/api/user") return { json: async () => await fetchUserMock() };
        if (url === "/api/logout") {
            sessionStorage.removeItem("user");
            return { json: async () => ({ success: true }) };
        }
        return target(url, options);
    }
});

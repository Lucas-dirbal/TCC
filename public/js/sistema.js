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
    });
});


// Função para verificar perfil (index.html)
function checkProfile() {
  const out = document.getElementById('profile-output');
  if (!out) return;
  out.textContent = 'Carregando...';
  fetch('/api/profile')
    .then(res => res.json())
    .then(j => {
      out.textContent = JSON.stringify(j, null, 2);
    })
    .catch(() => {
      out.textContent = 'Erro ao buscar perfil.';
    });
}

// Função para logout (index.html)
function logout() {
  fetch('/api/logout', { method: 'POST' })
    .then(() => {
      location.href = '/';
    });
}

// Adiciona listeners se os botões existirem
document.addEventListener('DOMContentLoaded', () => {
  const btnCheck = document.getElementById('btn-check');
  if (btnCheck) {
    btnCheck.addEventListener('click', checkProfile);
  }
  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', logout);
  }
});


// Login handler para login.html
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      username: form.username.value,
      password: form.password.value
    };
    const msg = document.getElementById('login-message');
    msg.textContent = '';
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data)
      });
      const j = await res.json();
      if (j.ok) {
        msg.style.color = '#388e3c';
        msg.textContent = 'Login realizado com sucesso!';
        setTimeout(() => { location.href = '/'; }, 800);
      } else {
        msg.style.color = '#d32f2f';
        msg.textContent = j.error || 'Usuário ou senha inválidos.';
      }
    } catch (err) {
      msg.style.color = '#d32f2f';
      msg.textContent = 'Erro de conexão com o servidor.';
    }
  });

  // Lógica para mostrar tela de registro escondida
  const logoImg = document.querySelector('.login-logo img');
  let adminStep = 0;
  if (logoImg) {
    logoImg.addEventListener('click', () => {
      // Mostra prompt para login admin
      if (adminStep === 0) {
        const user = prompt('Login de administrador:');
        if (user === 'Admin') {
          adminStep = 1;
          const pass = prompt('Senha de administrador:');
          if (pass === 'Lucas') {
            // Libera acesso ao link de registro
            const regLink = document.getElementById('hidden-register-link');
            if (regLink) {
              regLink.innerHTML = '<a href="register.html">Criar conta</a>';
              regLink.style.display = 'block';
              regLink.style.color = '#2575fc';
            }
            alert('Acesso liberado para criar conta!');
          } else {
            alert('Senha incorreta!');
          }
        } else {
          alert('Login incorreto!');
        }
      }
    });
  }
}
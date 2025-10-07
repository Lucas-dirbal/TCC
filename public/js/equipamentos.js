document.addEventListener("DOMContentLoaded", () => {
  const tableBody = document.getElementById("equipTableBody");
  const btnAdd = document.getElementById("btnAdd");
  const modal = document.getElementById("modal");
  const closeModal = document.getElementById("closeModal");
  const form = document.getElementById("formEquip");
  const searchInput = document.getElementById("searchInput");

  let equipamentos = [
    { id: 1, nome: "Notebook Dell", categoria: "Informática", status: "Disponível" },
    { id: 2, nome: "Projetor Epson", categoria: "Audiovisual", status: "Em uso" },
    { id: 3, nome: "Multímetro", categoria: "Laboratório", status: "Manutenção" }
  ];

  const renderTable = (data) => {
    tableBody.innerHTML = "";
    data.forEach(eq => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${eq.id}</td>
        <td>${eq.nome}</td>
        <td>${eq.categoria}</td>
        <td>${eq.status}</td>
        <td>
          <button class="btn-small edit">✏️</button>
          <button class="btn-small delete">🗑️</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  };

  renderTable(equipamentos);

  btnAdd.onclick = () => modal.style.display = "block";
  closeModal.onclick = () => modal.style.display = "none";

  form.onsubmit = (e) => {
    e.preventDefault();
    const novoEquip = {
      id: equipamentos.length + 1,
      nome: form.nomeEquip.value,
      categoria: form.categoriaEquip.value,
      status: form.statusEquip.value
    };
    equipamentos.push(novoEquip);
    renderTable(equipamentos);
    modal.style.display = "none";
    form.reset();
  };

  searchInput.addEventListener("input", () => {
    const filtro = searchInput.value.toLowerCase();
    const filtrados = equipamentos.filter(eq =>
      eq.nome.toLowerCase().includes(filtro) ||
      eq.categoria.toLowerCase().includes(filtro)
    );
    renderTable(filtrados);
  });
});

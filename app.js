let projects = [];
let filteredProjects = [];
let currentPage = 1;
const pageSize = 25;

async function loadProjects() {
  try {
    const res = await fetch("data/projects.json?cb=" + Date.now());
    const data = await res.json();

    projects = data.projects || [];
    filteredProjects = [...projects];

    if (data.source && data.source.min_stars) {
      document.getElementById("min-stars-input").value = data.source.min_stars;
    }

    updateMeta(data);
    renderPage();

  } catch (err) {
    console.error(err);
  }
}

function updateMeta(data) {
  const lastUpdatedEl = document.getElementById("last-updated");
  const totalCountEl = document.getElementById("total-count");

  if (data.last_updated) {
    const d = new Date(data.last_updated);
    lastUpdatedEl.textContent = "Última actualización: " + d.toLocaleString();
  } else {
    lastUpdatedEl.textContent = "Aún no hay datos actualizados.";
  }

  let countText = `Repositorios listados: ${data.count ?? projects.length}`;
  if (data.new_in_this_run !== undefined) {
    countText += ` (${data.new_in_this_run} nuevos en última ejecución)`;
  }
  totalCountEl.textContent = countText;
}

function renderPage() {
  const listEl = document.getElementById("projects-list");
  listEl.innerHTML = "";

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filteredProjects.slice(start, end);

  if (pageItems.length === 0) {
    listEl.innerHTML = "<li>No hay resultados.</li>";
  } else {
    for (const repo of pageItems) {
      const li = document.createElement("li");
      li.className = "project-item";

      const updated = repo.updated_at
        ? new Date(repo.updated_at).toLocaleString()
        : "Desconocido";

      const ownerInfo = repo.owner
        ? `<a href="${repo.owner.html_url}" target="_blank" rel="noopener noreferrer" class="owner-link">${repo.owner.login}</a> /`
        : '';

      li.innerHTML = `
        <div class="repo-header">
          ${repo.owner && repo.owner.avatar_url ? `<img src="${repo.owner.avatar_url}" alt="${repo.owner.login}" class="owner-avatar">` : ''}
          <h2>${ownerInfo} <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h2>
        </div>
        <p>${repo.description ? repo.description : "<em>Sin descripción</em>"}</p>
        <div class="meta-row">
          <span>⭐ ${repo.stargazers_count}</span>
          <span>${repo.language ?? "—"}</span>
          <span>Actualizado: ${updated}</span>
        </div>
      `;
      listEl.appendChild(li);
    }
  }

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  document.getElementById("page-info").textContent =
    `Página ${currentPage} de ${totalPages}`;

  document.getElementById("prev-page").disabled = currentPage <= 1;
  document.getElementById("next-page").disabled = currentPage >= totalPages;
}

function setupPagination() {
  document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage();
    }
  });

  document.getElementById("next-page").addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
    if (currentPage < totalPages) {
      currentPage++;
      renderPage();
    }
  });
}

function applyFilters() {
  const searchTerm = document.getElementById("search-input").value.toLowerCase().trim();
  const minStars = parseInt(document.getElementById("min-stars-input").value || "0", 10);

  filteredProjects = projects.filter((p) => {
    // Filtro de estrellas
    const meetsStarRequirement = (p.stargazers_count || 0) >= minStars;

    // Filtro de búsqueda
    const meetsSearchRequirement = !searchTerm || (() => {
      const name = (p.full_name || p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      return name.includes(searchTerm) || desc.includes(searchTerm);
    })();

    return meetsStarRequirement && meetsSearchRequirement;
  });

  currentPage = 1;
  renderPage();
}

function setupSearch() {
  const input = document.getElementById("search-input");
  input.addEventListener("input", applyFilters);
}

function setupMinStarsFilter() {
  const input = document.getElementById("min-stars-input");
  input.addEventListener("input", applyFilters);
}

document.addEventListener("DOMContentLoaded", () => {
  setupPagination();
  setupSearch();
  setupMinStarsFilter();
  loadProjects();
});

let projects = [];
let filteredProjects = [];
let currentPage = 1;
const pageSize = 25;
let lastUpdated = null;
let pollInterval = null;
const POLL_INTERVAL_MS = 60000; // Verificar cada 60 segundos

async function loadProjects(isAutoRefresh = false) {
  try {
    const res = await fetch("data/projects.json?cb=" + Date.now());
    const data = await res.json();

    // Detectar si hay cambios
    const newLastUpdated = data.last_updated;
    const hasChanges = lastUpdated && newLastUpdated !== lastUpdated;

    if (hasChanges && isAutoRefresh) {
      showUpdateNotification();
    }

    lastUpdated = newLastUpdated;
    projects = data.projects || [];
    filteredProjects = [...projects];

    if (data.source && data.source.min_stars) {
      document.getElementById("min-stars-input").value = data.source.min_stars;
    }

    updateMeta(data);
    applyFilters();

    if (isAutoRefresh) {
      updateRefreshIndicator('updated');
    }

  } catch (err) {
    console.error(err);
    if (isAutoRefresh) {
      updateRefreshIndicator('error');
    }
  }
}

function showUpdateNotification() {
  const notification = document.createElement('div');
  notification.className = 'update-notification';
  notification.innerHTML = `
    ✨ <strong>Nuevos repositorios disponibles!</strong> La lista ha sido actualizada.
    <button onclick="this.parentElement.remove()">✕</button>
  `;
  document.body.appendChild(notification);

  // Auto-remover después de 8 segundos
  setTimeout(() => {
    if (notification.parentElement) {
      notification.classList.add('fade-out');
      setTimeout(() => notification.remove(), 300);
    }
  }, 8000);
}

function updateRefreshIndicator(status) {
  const indicator = document.getElementById('refresh-indicator');
  if (!indicator) return;

  const now = new Date().toLocaleTimeString();

  switch(status) {
    case 'checking':
      indicator.textContent = `🔄 Verificando actualizaciones...`;
      indicator.className = 'refresh-indicator checking';
      break;
    case 'updated':
      indicator.textContent = `✓ Última verificación: ${now}`;
      indicator.className = 'refresh-indicator updated';
      break;
    case 'error':
      indicator.textContent = `⚠️ Error al verificar (${now})`;
      indicator.className = 'refresh-indicator error';
      break;
  }
}

function startAutoRefresh() {
  // Limpiar intervalo anterior si existe
  if (pollInterval) {
    clearInterval(pollInterval);
  }

  // Configurar polling automático
  pollInterval = setInterval(async () => {
    updateRefreshIndicator('checking');
    await loadProjects(true);
  }, POLL_INTERVAL_MS);

  console.log(`Auto-refresh activado: verificando cada ${POLL_INTERVAL_MS/1000}s`);
}

function stopAutoRefresh() {
  if (pollInterval) {
    clearInterval(pollInterval);
    pollInterval = null;
    console.log('Auto-refresh desactivado');
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

  const countText = `Repositorios listados: ${data.count ?? projects.length}`;
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
  startAutoRefresh();
});

// Detener auto-refresh cuando el usuario sale de la página
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAutoRefresh();
  } else {
    startAutoRefresh();
    loadProjects(true); // Verificar inmediatamente al volver
  }
});

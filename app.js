let projects = [];
let filteredProjects = [];
let currentPage = 1;
const pageSize = 25;
let lastUpdated = null;
let pollInterval = null;
const POLL_INTERVAL_MS = 300000; // Verificar cada 5 minutos (300 segundos)
let currentLang = 'en'; // Default language

// Language translations
const translations = {
  en: {
    lastUpdated: "Last updated: ",
    noData: "No updated data yet.",
    reposListed: "Repositories listed: ",
    noResults: "No results.",
    noDescription: "No description",
    updated: "Updated: ",
    pageOf: "Page {current} of {total}",
    checking: "🔄 Checking for updates...",
    lastCheck: "✓ Last check: {time}",
    checkError: "⚠️ Check error ({time})",
    newRepos: "✨ <strong>New repositories available!</strong> The list has been updated.",
    unknown: "Unknown"
  },
  es: {
    lastUpdated: "Última actualización: ",
    noData: "Aún no hay datos actualizados.",
    reposListed: "Repositorios listados: ",
    noResults: "No hay resultados.",
    noDescription: "Sin descripción",
    updated: "Actualizado: ",
    pageOf: "Página {current} de {total}",
    checking: "🔄 Verificando actualizaciones...",
    lastCheck: "✓ Última verificación: {time}",
    checkError: "⚠️ Error al verificar ({time})",
    newRepos: "✨ <strong>Nuevos repositorios disponibles!</strong> La lista ha sido actualizada.",
    unknown: "Desconocido"
  }
};

async function loadProjects(isAutoRefresh = false) {
  try {
    // Cargar desde GitHub raw para obtener siempre la última versión
    const res = await fetch("https://raw.githubusercontent.com/alcastelo/github-tail/refs/heads/master/data/projects.json?cb=" + Date.now());
    const data = await res.json();

    // Detectar si hay cambios
    const newLastUpdated = data.last_updated;
    const hasChanges = lastUpdated && newLastUpdated !== lastUpdated;

    lastUpdated = newLastUpdated;
    projects = data.projects || [];
    filteredProjects = [...projects];

    // Solo establecer el valor por defecto en la carga inicial, no en auto-refresh
    if (!isAutoRefresh && data.source && data.source.min_stars) {
      const minStarsInput = document.getElementById("min-stars-input");
      // Solo establecer si el usuario no ha cambiado el valor
      if (minStarsInput.value === "20" || minStarsInput.value === "") {
        minStarsInput.value = data.source.min_stars;
      }
    }

    updateMeta(data);

    // Lógica de navegación según contexto
    if (!isAutoRefresh) {
      // Carga inicial: siempre ir a página 1
      applyFilters();
    } else if (hasChanges) {
      // Auto-refresh CON cambios: volver a página 1 y notificar
      showUpdateNotification();
      applyFilters(); // Resetea a página 1
      updateRefreshIndicator('updated');
    } else {
      // Auto-refresh SIN cambios: mantener página actual
      applyFiltersKeepPage();
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
    ${translations[currentLang].newRepos}
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
      indicator.textContent = translations[currentLang].checking;
      indicator.className = 'refresh-indicator checking';
      break;
    case 'updated':
      indicator.textContent = translations[currentLang].lastCheck.replace('{time}', now);
      indicator.className = 'refresh-indicator updated';
      break;
    case 'error':
      indicator.textContent = translations[currentLang].checkError.replace('{time}', now);
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
    lastUpdatedEl.textContent = translations[currentLang].lastUpdated + d.toLocaleString();
  } else {
    lastUpdatedEl.textContent = translations[currentLang].noData;
  }

  totalCountEl.textContent = translations[currentLang].reposListed + (data.count ?? projects.length);
}

function renderPage() {
  const listEl = document.getElementById("projects-list");
  listEl.innerHTML = "";

  const start = (currentPage - 1) * pageSize;
  const end = start + pageSize;
  const pageItems = filteredProjects.slice(start, end);

  if (pageItems.length === 0) {
    listEl.innerHTML = `<li>${translations[currentLang].noResults}</li>`;
  } else {
    for (const repo of pageItems) {
      const li = document.createElement("li");
      li.className = "project-item";

      const updated = repo.updated_at
        ? new Date(repo.updated_at).toLocaleString()
        : translations[currentLang].unknown;

      const ownerInfo = repo.owner
        ? `<a href="${repo.owner.html_url}" target="_blank" rel="noopener noreferrer" class="owner-link">${repo.owner.login}</a> /`
        : '';

      li.innerHTML = `
        <div class="repo-header">
          ${repo.owner && repo.owner.avatar_url ? `<img src="${repo.owner.avatar_url}" alt="${repo.owner.login}" class="owner-avatar">` : ''}
          <h2>${ownerInfo} <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h2>
        </div>
        <p>${repo.description ? repo.description : `<em>${translations[currentLang].noDescription}</em>`}</p>
        <div class="meta-row">
          <span>⭐ ${repo.stargazers_count}</span>
          <span>${repo.language ?? "—"}</span>
          <span>${translations[currentLang].updated}${updated}</span>
        </div>
      `;
      listEl.appendChild(li);
    }
  }

  const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
  document.getElementById("page-info").textContent =
    translations[currentLang].pageOf.replace('{current}', currentPage).replace('{total}', totalPages);

  document.getElementById("first-page").disabled = currentPage <= 1;
  document.getElementById("prev-page").disabled = currentPage <= 1;
  document.getElementById("next-page").disabled = currentPage >= totalPages;
  document.getElementById("last-page").disabled = currentPage >= totalPages;
}

function scrollToContent() {
  // Scroll al inicio del contenedor de proyectos
  const container = document.getElementById("projects-container");
  if (container) {
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function setupPagination() {
  // Botón: Primera página
  document.getElementById("first-page").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage = 1;
      renderPage();
      scrollToContent();
    }
  });

  // Botón: Página anterior
  document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderPage();
      scrollToContent();
    }
  });

  // Botón: Página siguiente
  document.getElementById("next-page").addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
    if (currentPage < totalPages) {
      currentPage++;
      renderPage();
      scrollToContent();
    }
  });

  // Botón: Última página
  document.getElementById("last-page").addEventListener("click", () => {
    const totalPages = Math.max(1, Math.ceil(filteredProjects.length / pageSize));
    if (currentPage < totalPages) {
      currentPage = totalPages;
      renderPage();
      scrollToContent();
    }
  });
}

function applyFiltersKeepPage() {
  // Aplica filtros sin resetear la página actual
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

  // No cambiar currentPage, solo re-renderizar
  renderPage();
}

function applyFilters() {
  // Aplica filtros y resetea a página 1
  applyFiltersKeepPage();
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

// Language switching functionality
function switchLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('preferred-language', lang);

  // Update HTML lang attribute
  document.documentElement.lang = lang;

  // Update all elements with data-en and data-es attributes
  document.querySelectorAll('[data-en][data-es]').forEach(el => {
    if (el.tagName === 'INPUT' && el.type === 'text') {
      // Handle input placeholders
      el.placeholder = el.getAttribute(`data-placeholder-${lang}`);
    } else if (el.tagName === 'TITLE') {
      // Handle document title
      document.title = el.getAttribute(`data-${lang}`);
    } else if (el.hasAttribute(`data-title-${lang}`)) {
      // Handle title attributes
      el.title = el.getAttribute(`data-title-${lang}`);
      el.textContent = el.getAttribute(`data-${lang}`);
    } else {
      // Handle regular text content
      el.textContent = el.getAttribute(`data-${lang}`);
    }
  });

  // Update language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });

  // Reload current view with new language
  if (projects.length > 0) {
    updateMeta({ last_updated: lastUpdated, count: projects.length });
    renderPage();
  }
}

function initLanguage() {
  // Check for URL parameter first, then saved preference, then browser language
  const urlParams = new URLSearchParams(window.location.search);
  const urlLang = urlParams.get('lang');
  const savedLang = localStorage.getItem('preferred-language');
  const browserLang = navigator.language.split('-')[0];

  if (urlLang && (urlLang === 'en' || urlLang === 'es')) {
    currentLang = urlLang;
  } else if (savedLang) {
    currentLang = savedLang;
  } else if (browserLang === 'es') {
    currentLang = 'es';
  }

  switchLanguage(currentLang);

  // Setup language button listeners
  document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));
  document.getElementById('lang-es').addEventListener('click', () => switchLanguage('es'));
}

document.addEventListener("DOMContentLoaded", () => {
  initLanguage();
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

# 🔥 GitHub Tail - Real-Time Updated Repositories

[![GitHub Actions Status](https://github.com/alcastelo/github-tail/workflows/Actualizar%20proyectos%20GitHub/badge.svg)](https://github.com/alcastelo/github-tail/actions)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live-success?logo=github)](https://alcastelo.github.io/github-tail/)
[![Auto Update](https://img.shields.io/badge/Auto%20Update-Every%205%20min-blue?logo=clockify)](https://github.com/alcastelo/github-tail/actions)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![GitHub Stars](https://img.shields.io/github/stars/alcastelo/github-tail?style=social)](https://github.com/alcastelo/github-tail/stargazers)

> 📡 A live dashboard tracking up to 500 of the most recently updated public repositories on GitHub with 20+ stars, automatically refreshed every ~5 minutes via GitHub Actions.

[🌐 **View Live Dashboard**](https://alcastelo.github.io/github-tail/) | [🇪🇸 Ver en Español](#-github-tail---repositorios-actualizados-en-tiempo-real)

---

## ✨ Features

- 🔄 **Auto-refresh every ~5 minutes** - GitHub Actions automatically fetches latest repos
- 📊 **Up to 500 repositories** tracked in real-time with 20+ stars minimum (shows fewer if less are available)
- 🎯 **Smart client-side updates** - Page auto-refreshes without losing your position
- 🔍 **Advanced filtering** - Search by name/description and filter by star count
- 📱 **Responsive design** - Works perfectly on desktop and mobile devices
- 🚀 **Zero backend** - Fully static, hosted on GitHub Pages
- 📈 **Visit counter** - Track dashboard popularity
- 🎨 **Clean UI** - Modern, intuitive interface with dark theme

## 🚀 How It Works

```
┌─────────────────┐      Every ~5 min      ┌──────────────────┐
│  GitHub Actions │ ────────────────────► │  GitHub API      │
│  Workflow       │                        │  Search Repos    │
└────────┬────────┘                        └──────────────────┘
         │
         │ Updates JSON
         ▼
┌─────────────────┐      Auto-refresh      ┌──────────────────┐
│  data/          │ ◄──────────────────── │  Web Browser     │
│  projects.json  │                        │  (Client-side)   │
└─────────────────┘                        └──────────────────┘
```

1. **GitHub Actions** runs every 5 minutes (`*/5 * * * *` cron)
2. **Python script** queries GitHub Search API for recently updated repos
3. **JSON data** is committed and pushed to the repository
4. **Static webpage** auto-refreshes and displays the latest repos
5. **Smart notifications** alert users when new repos are available

## 📋 Requirements

- GitHub account (for GitHub Actions and Pages)
- No server or backend required!
- All free tier limits are sufficient for this project

## 🛠️ Setup Instructions

### 1. Fork or Clone Repository

```bash
git clone https://github.com/alcastelo/github-tail.git
cd github-tail
```

### 2. Enable GitHub Actions

- Go to **Settings** → **Actions** → **General**
- Enable "Allow all actions and reusable workflows"
- Under **Workflow permissions**, select "Read and write permissions"

### 3. Enable GitHub Pages

- Go to **Settings** → **Pages**
- Source: **Deploy from a branch**
- Branch: `master` (or `main`), folder: `/ (root)`
- Wait ~2 minutes for deployment

### 4. Configure Environment Variables (Optional)

Edit `.github/workflows/update-projects.yml` to customize:

```yaml
env:
  MAX_RESULTS: "500"           # Maximum number of repos to fetch (may return fewer)
  MIN_STARS: "20"              # Minimum stars filter
  GH_API_TOKEN: ${{ secrets.GITHUB_TOKEN }}  # Auto-provided
```

### 5. Manual First Run (Optional)

Trigger the workflow manually:
- Go to **Actions** → **Actualizar proyectos GitHub**
- Click **Run workflow** → **Run workflow**

Your dashboard will be live at: `https://YOUR_USERNAME.github.io/github-tail/`

## ⚙️ Configuration

### Update Frequency

Current setting: **Every 5 minutes** (`*/5 * * * *`)

> **Note:** GitHub Actions doesn't guarantee exact timing. Actual intervals may vary between 5-10 minutes depending on GitHub's system load.

To modify the frequency, edit `.github/workflows/update-projects.yml`:

```yaml
schedule:
  - cron: "*/10 * * * *"  # Change to every 10 minutes
```

Available options:
- `*/5 * * * *` - Every 5 minutes (~288 runs/day)
- `*/10 * * * *` - Every 10 minutes (~144 runs/day)
- `0 * * * *` - Every hour (~24 runs/day)

### Client-Side Refresh

The webpage auto-checks for updates every 5 minutes. To change this, edit `app.js`:

```javascript
const POLL_INTERVAL_MS = 300000; // 5 minutes in milliseconds
```

### Repository Filters

Modify search parameters in `.github/workflows/update-projects.yml`:

```yaml
env:
  MAX_RESULTS: "500"    # Maximum number of repos (up to 1000, may return fewer)
  MIN_STARS: "20"       # Minimum stars (0 = no limit)
```

## 📊 GitHub Actions Limits

| Account Type | Minutes/month | Cost |
|-------------|---------------|------|
| Public repo | **Unlimited** | Free ✅ |
| Private repo | 2,000 min | Free |
| Private (extra) | Per minute | $0.008/min |

**Your repository is public → No limits!** 🎉

## 🎨 Customization

### Add Visit Counter

The project includes **hits.seeyoufarm.com** counter. To customize:

1. Visit [https://hits.seeyoufarm.com/](https://hits.seeyoufarm.com/)
2. Enter your GitHub Pages URL
3. Customize colors and style
4. Replace the badge URL in `index.html` line 70

### Styling

Edit `style.css` to customize colors, fonts, and layout. The current theme uses:
- Dark background (`#020617`)
- Blue accents (`#3b82f6`)
- Modern card-based layout

## 📁 Project Structure

```
github-tail/
├── .github/
│   └── workflows/
│       └── update-projects.yml    # GitHub Actions workflow (runs every 5 min)
├── data/
│   └── projects.json              # Auto-generated repo data
├── scripts/
│   └── update_projects.py         # Python script to fetch repos
├── app.js                         # Client-side JavaScript (auto-refresh)
├── index.html                     # Main webpage
├── style.css                      # Styling
└── README.md                      # This file
```

## 🔧 Troubleshooting

### Workflow Not Running

- Check **Actions** tab for error messages
- Verify workflow permissions in **Settings** → **Actions**
- Ensure `GITHUB_TOKEN` has write permissions

### API Rate Limit

GitHub provides 5,000 API requests/hour with authentication (automatically used).
- Current setup: ~288 requests/day (well within limits)
- If you hit limits, increase cron interval

### Page Not Updating

- Clear browser cache
- Check if `data/projects.json` was updated in the repository
- Verify GitHub Pages is enabled and deployed from correct branch

## 🤝 Contributing

Contributions are welcome! Feel free to:

- Report bugs via [Issues](https://github.com/alcastelo/github-tail/issues)
- Submit feature requests
- Open Pull Requests with improvements

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ using GitHub Actions and GitHub Pages
- Powered by [GitHub Search API](https://docs.github.com/en/rest/search)
- Visit counter by [hits.seeyoufarm.com](https://hits.seeyoufarm.com/)

---

# 🇪🇸 GitHub Tail - Repositorios Actualizados en Tiempo Real

[![Estado de GitHub Actions](https://github.com/alcastelo/github-tail/workflows/Actualizar%20proyectos%20GitHub/badge.svg)](https://github.com/alcastelo/github-tail/actions)
[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-En%20Vivo-success?logo=github)](https://alcastelo.github.io/github-tail/)
[![Actualización Automática](https://img.shields.io/badge/Actualización%20Automática-Cada%205%20min-blue?logo=clockify)](https://github.com/alcastelo/github-tail/actions)
[![Licencia](https://img.shields.io/badge/Licencia-MIT-yellow.svg)](LICENSE)
[![Estrellas en GitHub](https://img.shields.io/github/stars/alcastelo/github-tail?style=social)](https://github.com/alcastelo/github-tail/stargazers)

> 📡 Un dashboard en vivo que rastrea hasta 500 de los repositorios públicos más recientemente actualizados en GitHub con 20+ estrellas, actualizado automáticamente cada ~5 minutos mediante GitHub Actions.

[🌐 **Ver Dashboard en Vivo**](https://alcastelo.github.io/github-tail/)

---

## ✨ Características

- 🔄 **Actualización automática cada ~5 minutos** - GitHub Actions obtiene los últimos repos automáticamente
- 📊 **Hasta 500 repositorios** rastreados en tiempo real con mínimo 20 estrellas (muestra menos si hay menos disponibles)
- 🎯 **Actualizaciones inteligentes del cliente** - La página se actualiza automáticamente sin perder tu posición
- 🔍 **Filtrado avanzado** - Buscar por nombre/descripción y filtrar por cantidad de estrellas
- 📱 **Diseño responsivo** - Funciona perfectamente en escritorio y dispositivos móviles
- 🚀 **Sin backend** - Completamente estático, alojado en GitHub Pages
- 📈 **Contador de visitas** - Rastrea la popularidad del dashboard
- 🎨 **Interfaz limpia** - Interfaz moderna e intuitiva con tema oscuro

## 🚀 Cómo Funciona

```
┌─────────────────┐    Cada ~5 min        ┌──────────────────┐
│  GitHub Actions │ ────────────────────► │  GitHub API      │
│  Workflow       │                        │  Search Repos    │
└────────┬────────┘                        └──────────────────┘
         │
         │ Actualiza JSON
         ▼
┌─────────────────┐   Auto-actualización   ┌──────────────────┐
│  data/          │ ◄──────────────────── │  Navegador Web   │
│  projects.json  │                        │  (Cliente)       │
└─────────────────┘                        └──────────────────┘
```

1. **GitHub Actions** se ejecuta cada 5 minutos (cron `*/5 * * * *`)
2. **Script Python** consulta la API de GitHub Search para repos actualizados recientemente
3. **Datos JSON** se confirman y envían al repositorio
4. **Página web estática** se actualiza automáticamente y muestra los últimos repos
5. **Notificaciones inteligentes** alertan a los usuarios cuando hay nuevos repos disponibles

## 📋 Requisitos

- Cuenta de GitHub (para GitHub Actions y Pages)
- ¡No se requiere servidor ni backend!
- Todos los límites gratuitos son suficientes para este proyecto

## 🛠️ Instrucciones de Configuración

### 1. Hacer Fork o Clonar el Repositorio

```bash
git clone https://github.com/alcastelo/github-tail.git
cd github-tail
```

### 2. Habilitar GitHub Actions

- Ve a **Settings** → **Actions** → **General**
- Habilita "Allow all actions and reusable workflows"
- En **Workflow permissions**, selecciona "Read and write permissions"

### 3. Habilitar GitHub Pages

- Ve a **Settings** → **Pages**
- Source: **Deploy from a branch**
- Branch: `master` (o `main`), carpeta: `/ (root)`
- Espera ~2 minutos para el despliegue

### 4. Configurar Variables de Entorno (Opcional)

Edita `.github/workflows/update-projects.yml` para personalizar:

```yaml
env:
  MAX_RESULTS: "500"           # Número máximo de repos a obtener (puede devolver menos)
  MIN_STARS: "20"              # Filtro de estrellas mínimas
  GH_API_TOKEN: ${{ secrets.GITHUB_TOKEN }}  # Proporcionado automáticamente
```

### 5. Primera Ejecución Manual (Opcional)

Activa el workflow manualmente:
- Ve a **Actions** → **Actualizar proyectos GitHub**
- Haz clic en **Run workflow** → **Run workflow**

Tu dashboard estará en vivo en: `https://TU_USUARIO.github.io/github-tail/`

## ⚙️ Configuración

### Frecuencia de Actualización

Configuración actual: **Cada 5 minutos** (`*/5 * * * *`)

> **Nota:** GitHub Actions no garantiza tiempos exactos. Los intervalos reales pueden variar entre 5-10 minutos dependiendo de la carga del sistema de GitHub.

Para modificar la frecuencia, edita `.github/workflows/update-projects.yml`:

```yaml
schedule:
  - cron: "*/10 * * * *"  # Cambiar a cada 10 minutos
```

Opciones disponibles:
- `*/5 * * * *` - Cada 5 minutos (~288 ejecuciones/día)
- `*/10 * * * *` - Cada 10 minutos (~144 ejecuciones/día)
- `0 * * * *` - Cada hora (~24 ejecuciones/día)

### Actualización del Cliente

La página web verifica actualizaciones automáticamente cada 5 minutos. Para cambiar esto, edita `app.js`:

```javascript
const POLL_INTERVAL_MS = 300000; // 5 minutos en milisegundos
```

### Filtros de Repositorio

Modifica los parámetros de búsqueda en `.github/workflows/update-projects.yml`:

```yaml
env:
  MAX_RESULTS: "500"    # Número máximo de repos (hasta 1000, puede devolver menos)
  MIN_STARS: "20"       # Estrellas mínimas (0 = sin límite)
```

## 📊 Límites de GitHub Actions

| Tipo de Cuenta | Minutos/mes | Costo |
|----------------|-------------|-------|
| Repo público | **Ilimitado** | Gratis ✅ |
| Repo privado | 2,000 min | Gratis |
| Privado (extra) | Por minuto | $0.008/min |

**Tu repositorio es público → ¡Sin límites!** 🎉

## 🎨 Personalización

### Agregar Contador de Visitas

El proyecto incluye contador de **hits.seeyoufarm.com**. Para personalizar:

1. Visita [https://hits.seeyoufarm.com/](https://hits.seeyoufarm.com/)
2. Ingresa la URL de tu GitHub Pages
3. Personaliza colores y estilo
4. Reemplaza la URL del badge en `index.html` línea 70

### Estilos

Edita `style.css` para personalizar colores, fuentes y diseño. El tema actual usa:
- Fondo oscuro (`#020617`)
- Acentos azules (`#3b82f6`)
- Diseño moderno basado en tarjetas

## 📁 Estructura del Proyecto

```
github-tail/
├── .github/
│   └── workflows/
│       └── update-projects.yml    # Workflow de GitHub Actions (se ejecuta cada 5 min)
├── data/
│   └── projects.json              # Datos de repos generados automáticamente
├── scripts/
│   └── update_projects.py         # Script Python para obtener repos
├── app.js                         # JavaScript del cliente (auto-actualización)
├── index.html                     # Página web principal
├── style.css                      # Estilos
└── README.md                      # Este archivo
```

## 🔧 Solución de Problemas

### El Workflow No se Ejecuta

- Verifica la pestaña **Actions** para mensajes de error
- Verifica los permisos del workflow en **Settings** → **Actions**
- Asegúrate de que `GITHUB_TOKEN` tenga permisos de escritura

### Límite de API

GitHub proporciona 5,000 solicitudes de API/hora con autenticación (usada automáticamente).
- Configuración actual: ~288 solicitudes/día (muy dentro de los límites)
- Si alcanzas los límites, aumenta el intervalo del cron

### La Página No se Actualiza

- Limpia la caché del navegador
- Verifica si `data/projects.json` fue actualizado en el repositorio
- Verifica que GitHub Pages esté habilitado y desplegado desde la rama correcta

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Siéntete libre de:

- Reportar bugs vía [Issues](https://github.com/alcastelo/github-tail/issues)
- Enviar solicitudes de características
- Abrir Pull Requests con mejoras

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 🙏 Agradecimientos

- Construido con ❤️ usando GitHub Actions y GitHub Pages
- Impulsado por [GitHub Search API](https://docs.github.com/en/rest/search)
- Contador de visitas por [hits.seeyoufarm.com](https://hits.seeyoufarm.com/)

---

**Made with ❤️ by [alcastelo](https://github.com/alcastelo)**

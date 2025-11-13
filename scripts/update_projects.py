#!/usr/bin/env python3
"""
update_projects.py

Obtiene los repositorios públicos más recientemente actualizados en GitHub
usando la API de búsqueda. Busca solo repos actualizados desde la última
ejecución (búsqueda incremental tipo "tail -f").
"""
import os
import json
import sys
from datetime import datetime, timezone

import requests


def load_existing_data(out_path):
    """Carga datos existentes del JSON si existe"""
    if not os.path.exists(out_path):
        return None

    try:
        with open(out_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        print(f"⚠️  Error leyendo {out_path}: {e}", file=sys.stderr)
        return None


def format_datetime_for_search(dt_str):
    """Convierte ISO datetime a formato para GitHub Search (YYYY-MM-DDTHH:MM:SS)"""
    try:
        dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
        return dt.strftime("%Y-%m-%dT%H:%M:%S")
    except Exception:
        return None


def main():
    max_results = int(os.environ.get("MAX_RESULTS", "50"))
    min_stars = int(os.environ.get("MIN_STARS", "20"))
    out_path = os.environ.get("OUT_PATH", "data/projects.json")

    # Cargar datos existentes solo para obtener last_updated
    existing_data = load_existing_data(out_path)
    last_updated = None
    previous_count = 0

    if existing_data:
        last_updated = existing_data.get("last_updated")
        previous_count = existing_data.get("count", 0)
        if last_updated:
            print(f"📅 Última actualización: {last_updated}", file=sys.stderr)
            print(f"📂 Repos en consulta anterior: {previous_count}", file=sys.stderr)

    # URL de la API de búsqueda de GitHub
    url = "https://api.github.com/search/repositories"

    # Query: repos con estrellas mínimas, ordenados por actualización
    stars_query = f"stars:>={min_stars}" if min_stars > 0 else "stars:>=0"

    # Si tenemos última fecha, buscar solo repos actualizados después
    if last_updated:
        formatted_date = format_datetime_for_search(last_updated)
        if formatted_date:
            stars_query += f" pushed:>{formatted_date}"
            print(f"🔍 Buscando repos actualizados después de {formatted_date}", file=sys.stderr)

    params = {
        "q": stars_query,
        "sort": "updated",
        "order": "desc",
        "per_page": min(max_results, 100),  # API limita a 100 por página
        "page": 1
    }

    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": "github-tail-fetcher",
    }

    token = os.environ.get("GH_API_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    print(f"🌐 Llamando a GitHub Search API...", file=sys.stderr)
    resp = requests.get(url, params=params, headers=headers, timeout=20)

    # Manejo de rate limit
    if resp.status_code == 403:
        remaining = resp.headers.get("X-RateLimit-Remaining", "?")
        reset = resp.headers.get("X-RateLimit-Reset", "?")
        print(f"ERROR: Rate limit alcanzado. Remaining: {remaining}, Reset: {reset}", file=sys.stderr)
        sys.exit(1)

    resp.raise_for_status()
    data = resp.json()
    repos = data.get("items", [])

    total_fetched = len(repos)
    print(f"📊 Repos obtenidos en esta consulta: {total_fetched}", file=sys.stderr)
    print(f"📈 Total disponible en GitHub: {data.get('total_count', '?')}", file=sys.stderr)

    # Procesar repos de la consulta actual (sin acumular histórico)
    current_projects = []

    for repo in repos:
        current_projects.append({
            "id": repo.get("id"),
            "name": repo.get("name"),
            "full_name": repo.get("full_name"),
            "html_url": repo.get("html_url"),
            "description": repo.get("description"),
            "stargazers_count": repo.get("stargazers_count"),
            "language": repo.get("language"),
            "updated_at": repo.get("updated_at"),
            "pushed_at": repo.get("pushed_at"),
            "fork": repo.get("fork"),
            "owner": {
                "login": repo.get("owner", {}).get("login"),
                "avatar_url": repo.get("owner", {}).get("avatar_url"),
                "html_url": repo.get("owner", {}).get("html_url"),
            },
        })

    # Ordenar por fecha de actualización (más reciente primero)
    current_projects.sort(key=lambda x: x.get("updated_at") or "", reverse=True)

    # Limitar a max_results
    current_projects = current_projects[:max_results]

    os.makedirs(os.path.dirname(out_path) or ".", exist_ok=True)

    output_data = {
        "source": {
            "type": "github_search_repos",
            "query": stars_query,
            "min_stars": min_stars,
        },
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "count": len(current_projects),
        "total_available": data.get("total_count", 0),
        "projects": current_projects,
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output_data, f, ensure_ascii=False, indent=2)

    print(f"💾 Guardados {len(current_projects)} repos de esta consulta", file=sys.stderr)


if __name__ == "__main__":
    main()

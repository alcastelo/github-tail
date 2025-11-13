#!/usr/bin/env python3
import os
import json
import sys
from datetime import datetime, timezone

import requests


def main():
    username = os.environ.get("GITHUB_USERNAME")
    if not username:
        print("ERROR: Falta la variable de entorno GITHUB_USERNAME", file=sys.stderr)
        sys.exit(1)

    max_results = int(os.environ.get("MAX_RESULTS", "50"))
    min_stars = int(os.environ.get("MIN_STARS", "10"))
    out_path = os.environ.get("OUT_PATH", "data/projects.json")

    url = f"https://api.github.com/users/{username}/repos"
    params = {
        "sort": "updated",
        "direction": "desc",
        "per_page": 100,
    }

    headers = {
        "Accept": "application/vnd.github+json",
        "User-Agent": f"github-projects-fetcher ({username})",
    }

    token = os.environ.get("GH_API_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"

    print(f"Llamando a GitHub API para {username}...", file=sys.stderr)
    resp = requests.get(url, params=params, headers=headers, timeout=15)
    resp.raise_for_status()
    repos = resp.json()

    # Filtramos primero por estrellas
    repos = [r for r in repos if (r.get("stargazers_count") or 0) >= min_stars]

    # Ordenamos y recortamos
    repos_sorted = sorted(
        repos,
        key=lambda r: r.get("updated_at") or "",
        reverse=True,
    )[:max_results]

    processed = []
    for repo in repos_sorted:
        processed.append(
            {
                "name": repo.get("name"),
                "full_name": repo.get("full_name"),
                "html_url": repo.get("html_url"),
                "description": repo.get("description"),
                "stargazers_count": repo.get("stargazers_count"),
                "language": repo.get("language"),
                "updated_at": repo.get("updated_at"),
                "pushed_at": repo.get("pushed_at"),
                "fork": repo.get("fork"),
                "visibility": repo.get("visibility"),
            }
        )

    os.makedirs(os.path.dirname(out_path), exist_ok=True)

    data = {
        "source": {
            "type": "github_user_repos",
            "user": username,
            "min_stars": min_stars,
        },
        "last_updated": datetime.now(timezone.utc).isoformat(),
        "count": len(processed),
        "projects": processed,
    }

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)

    print(f"Escritos {len(processed)} repos con >= {min_stars} estrellas", file=sys.stderr)


if __name__ == "__main__":
    main()

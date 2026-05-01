# Sigida Sugu Backend Bootstrap

Backend Django modulaire pour une marketplace généraliste.

## Stack

- Django 5
- Django REST Framework
- PostgreSQL
- Redis
- Celery
- Gunicorn
- Docker / Docker Compose
- GitHub Actions
- Logging JSON structuré

## Démarrage rapide

```bash
cp .env.example .env
docker compose up --build
```

## Services

- `web`: API Django
- `db`: PostgreSQL
- `redis`: Redis
- `worker`: Celery worker
- `beat`: Celery beat
- `nginx`: reverse proxy

## Endpoints initiaux

- `GET /health/`
- `GET /ready/`
- `GET /api/v1/health/`

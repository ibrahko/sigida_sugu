FROM python:3.12-slim

# Env Python
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# Dépendances système (libpq pour psycopg, gcc pour compiler certains paquets)
RUN apt-get update && apt-get install -y --no-install-recommends \
        libpq-dev \
        gcc \
    && rm -rf /var/lib/apt/lists/*

# Requirements en premier pour bénéficier du cache Docker
COPY requirements/prod.txt requirements/prod.txt
RUN pip install -r requirements/prod.txt

# Code source
COPY . .

# Collecte des fichiers statiques (whitenoise les sert en prod)
# SECRET_KEY factice uniquement pour cette étape de build
RUN SECRET_KEY=build-only \
    DJANGO_SETTINGS_MODULE=config.settings.prod \
    python manage.py collectstatic --noinput

# Entrypoint : lance les migrations puis le process principal
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 8000

ENTRYPOINT ["/entrypoint.sh"]

# Commande par défaut : API Django via gunicorn
# Railway remplace PORT automatiquement
CMD ["gunicorn", "config.wsgi:application", \
     "--bind", "0.0.0.0:8000", \
     "--workers", "2", \
     "--threads", "2", \
     "--timeout", "60", \
     "--access-logfile", "-", \
     "--error-logfile", "-"]

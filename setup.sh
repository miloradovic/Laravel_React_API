#!/bin/bash

set -euo pipefail

echo "Setting up Travel Insurance API..."

if ! command -v docker >/dev/null 2>&1; then
    echo "Docker is not installed. Please install Docker first."
    exit 1
fi

if docker compose version >/dev/null 2>&1; then
    COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE="docker-compose"
else
    echo "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "Using compose command: ${COMPOSE}"

# Keep named volumes for dependencies to speed up rebuilds.
${COMPOSE} down --remove-orphans >/dev/null 2>&1 || true
${COMPOSE} up -d --build

echo "Waiting for backend health endpoint..."
for i in $(seq 1 30); do
    if curl -fsS http://localhost:8000/api/health >/dev/null 2>&1; then
        break
    fi
    sleep 2
done

${COMPOSE} exec -T backend php artisan key:generate --force
${COMPOSE} exec -T backend php artisan jwt:secret --force
${COMPOSE} exec -T backend php artisan migrate --force
${COMPOSE} exec -T backend php artisan db:seed --force || true
${COMPOSE} exec -T backend php artisan tinker --execute="App\\Models\\User::firstOrCreate(['email' => 'test@example.com'], ['name' => 'Test User', 'email' => 'test@example.com', 'password' => bcrypt('password')]);"
${COMPOSE} exec -T backend php artisan optimize:clear

echo ""
echo "Setup completed successfully."
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "API:      http://localhost:8000/api"
echo ""
echo "Useful commands:"
echo "  ${COMPOSE} logs -f"
echo "  ${COMPOSE} down"
echo "  ${COMPOSE} exec backend php artisan test"
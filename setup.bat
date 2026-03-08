@echo off
setlocal enabledelayedexpansion

echo Setting up Travel Insurance API...

docker --version >nul 2>&1
if errorlevel 1 (
    echo Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

docker compose version >nul 2>&1
if errorlevel 1 (
    docker-compose --version >nul 2>&1
    if errorlevel 1 (
        echo Docker Compose is not installed.
        pause
        exit /b 1
    )
    set "COMPOSE=docker-compose"
) else (
    set "COMPOSE=docker compose"
)

echo Using compose command: !COMPOSE!

!COMPOSE! down --remove-orphans >nul 2>&1
!COMPOSE! up -d --build
if errorlevel 1 (
    echo Failed to build/start containers.
    pause
    exit /b 1
)

echo Waiting for backend health endpoint...
set /a RETRIES=0
:wait_backend
set /a RETRIES+=1
curl -fsS http://localhost:8000/api/health >nul 2>&1
if not errorlevel 1 goto backend_ready
if !RETRIES! geq 30 goto backend_ready
timeout /t 2 /nobreak >nul
goto wait_backend

:backend_ready
!COMPOSE! exec -T backend php artisan key:generate --force
!COMPOSE! exec -T backend php artisan jwt:secret --force
!COMPOSE! exec -T backend php artisan migrate --force
!COMPOSE! exec -T backend php artisan db:seed --force
!COMPOSE! exec -T backend php artisan tinker --execute="App\Models\User::firstOrCreate(['email' => 'test@example.com'], ['name' => 'Test User', 'email' => 'test@example.com', 'password' => bcrypt('password')]);"
!COMPOSE! exec -T backend php artisan optimize:clear

echo.
echo Setup completed successfully.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo API:      http://localhost:8000/api
echo.
echo Useful commands:
echo   !COMPOSE! logs -f
echo   !COMPOSE! down
echo   !COMPOSE! exec backend php artisan test
echo.
pause
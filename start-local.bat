@echo off
setlocal

REM Quick local starter for Windows (no Docker)
cd /d "%~dp0"

echo [1/6] Preparing environment files...
if not exist "backend\.env" (
  copy /Y "backend\.env.example" "backend\.env" >nul
  echo   - Created backend\.env from example
)
if not exist "frontend\.env" (
  copy /Y "frontend\.env.example" "frontend\.env" >nul
  echo   - Created frontend\.env from example
)

echo [2/6] Checking Python virtual environment...
if not exist "backend\.venv\Scripts\python.exe" (
  echo   - Creating backend virtual environment...
  py -m venv "backend\.venv"
)

echo [3/6] Installing backend dependencies...
call "backend\.venv\Scripts\python.exe" -m pip install -r "backend\requirements.txt"
if errorlevel 1 (
  echo ERROR: backend dependency install failed.
  exit /b 1
)

echo [4/6] Checking frontend dependencies...
if not exist "frontend\node_modules" (
  echo   - Installing frontend packages...
  call npm --prefix "frontend" install
  if errorlevel 1 (
    echo ERROR: frontend dependency install failed.
    exit /b 1
  )
)

echo [5/6] Starting backend in a new window...
start "CB Backend (8000)" cmd /k "cd /d ""%~dp0backend"" && .venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000"

echo [6/6] Starting frontend in a new window...
start "CB Frontend (3000)" cmd /k "cd /d ""%~dp0frontend"" && npm run dev"

echo.
echo Local services are starting:
echo   - Frontend: http://localhost:3000
echo   - Backend : http://localhost:8000/docs
echo.
echo To stop services, close opened terminal windows.

endlocal

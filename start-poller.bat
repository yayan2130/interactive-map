@echo off
REM ===========================================================================
REM  KidZania census poller launcher
REM  Double-click this file to keep public/census.json (or whatever outputPath
REM  points to in scraper\credentials.json) refreshed every 60 seconds.
REM  Leave this window open. Press Ctrl+C to stop.
REM ===========================================================================

title KidZania Census Poller

REM Always run from this .bat's own folder, no matter where it's launched from.
cd /d "%~dp0"

REM --- Sanity checks -------------------------------------------------------
where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js is not installed or not on PATH.
  echo         Install it from https://nodejs.org and try again.
  echo.
  pause
  exit /b 1
)

if not exist "scraper\credentials.json" (
  echo [ERROR] scraper\credentials.json not found.
  echo         Copy scraper\credentials.example.json to credentials.json and fill it in.
  echo.
  pause
  exit /b 1
)

if not exist "node_modules" (
  echo [setup] node_modules missing - running "npm install" first...
  call npm install
  if errorlevel 1 (
    echo [ERROR] npm install failed. See messages above.
    pause
    exit /b 1
  )
)

REM --- Start the watch poller ---------------------------------------------
echo.
echo Starting census poller ^(refreshes every 60s^). Keep this window open.
echo Press Ctrl+C to stop.
echo.
call npm run scrape:census:watch

REM If we reach here the poller stopped or crashed - keep the window so you can read why.
echo.
echo [poller stopped]
pause

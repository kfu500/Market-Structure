@echo off
setlocal DisableDelayedExpansion
title Market Structure - Private local portal
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 24 is required. Install it from https://nodejs.org/ or ask your IT team.
  pause
  exit /b 1
)
node "%~dp0Market-Structure\application\scripts\launch-local.js"
set "PORTAL_EXIT_CODE=%ERRORLEVEL%"
if not "%PORTAL_EXIT_CODE%"=="0" (
  echo.
  echo The portal could not start. Read the message above before retrying.
  pause
)
exit /b %PORTAL_EXIT_CODE%

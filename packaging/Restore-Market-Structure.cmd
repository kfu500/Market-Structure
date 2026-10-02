@echo off
setlocal DisableDelayedExpansion
title Restore private Market Structure package
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 24 is required. Install it from https://nodejs.org/ or ask your IT team.
  echo No recovery files have been changed.
  pause
  exit /b 1
)
node -e "process.exit(process.versions.node.split('.')[0] === '24' ? 0 : 1)"
if errorlevel 1 (
  echo Node.js 24 is required; the installed Node version is different.
  echo Install Node 24 or ask your IT team, then reopen this file.
  pause
  exit /b 1
)
node "%~dp0reconstruct-recovery.mjs" --input "%~dp0." --output "%~dp0Market-Structure"
set "RESTORE_EXIT_CODE=%ERRORLEVEL%"
if not "%RESTORE_EXIT_CODE%"=="0" (
  echo.
  echo Recovery did not complete. Keep every download and read the message above.
  echo If Market-Structure already exists, keep it and restore into a different empty download folder.
  pause
  exit /b %RESTORE_EXIT_CODE%
)
echo.
echo Recovery complete. Double-click Start-Portal.cmd in this download folder.
echo Keep your recovery downloads on protected private storage.
pause

@echo off
setlocal DisableDelayedExpansion
title Market Structure - Set up from your original files
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 from https://nodejs.org/ and reopen this file.
  pause
  exit /b 1
)
node -e "if(process.versions.node.split('.')[0]!=='24')process.exit(1)"
if errorlevel 1 (
  echo This setup requires Node.js 24. Ask IT to install it if necessary.
  pause
  exit /b 1
)
pushd "%~dp0"
if errorlevel 1 exit /b 1
echo Installing the two pinned code parsers. Your private source files are not uploaded.
call npm.cmd ci --ignore-scripts --no-audit --no-fund
if errorlevel 1 (
  echo Parser installation failed. Check npm registry access with your IT team.
  popd
  pause
  exit /b 1
)
node scripts\setup-from-originals.js --launch
set "PORTAL_SETUP_EXIT=%ERRORLEVEL%"
popd
if not "%PORTAL_SETUP_EXIT%"=="0" pause
exit /b %PORTAL_SETUP_EXIT%

@echo off
setlocal DisableDelayedExpansion
title Market Structure - Private local portal
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js 24 is required to open the portal.
  echo Install Node 24 from https://nodejs.org/ and reopen this file.
  echo No portal files have been changed.
  pause
  exit /b 1
)
node "%~dp0scripts\launch-local.js"
set "PORTAL_EXIT_CODE=%ERRORLEVEL%"
if not "%PORTAL_EXIT_CODE%"=="0" (
  echo.
  echo The portal did not start. Read the message above before retrying.
  pause
)
exit /b %PORTAL_EXIT_CODE%

@echo off
chcp 65001 >nul
title Form
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto :nonode
node server.mjs
goto :bitis

:nonode
echo Node.js bulunamadi. Once kur.bat dosyasini calistir.

:bitis
echo.
pause

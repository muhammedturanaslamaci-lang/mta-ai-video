@echo off
chcp 65001 >nul
cd /d "%~dp0"
call "%~dp0ortam.bat"
title Video edit - %1
where %1 >nul 2>nul
if errorlevel 1 goto :yok
set "HEDEF=materyaller/%2/brief.md"
if "%3"=="1" goto :zayif
set "ISTEK=%HEDEF% dosyasini oku ve talimat/video-edit.md dosyasindaki akisa gore videoyu edit et."
goto :calistir

:zayif
set "ISTEK=Once talimat/adim-adim.md dosyasini oku ve harfiyen uygula. Brif dosyasi: %HEDEF%"

:calistir
if "%1"=="claude" call claude "%ISTEK%"
if "%1"=="codex" call codex "%ISTEK%"
if "%1"=="gemini" call gemini -i "%ISTEK%"
goto :son

:yok
echo %1 bulunamadi. Once kur.bat dosyasini calistir, sonra tekrar dene.

:son
echo.
echo Bu pencereyi kapatabilirsin. Yeni komut girmek istersen buraya yazabilirsin.

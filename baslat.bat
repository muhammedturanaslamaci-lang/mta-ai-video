@echo off
chcp 65001 >nul
title Video edit
cd /d "%~dp0"
call "%~dp0ortam.bat"
set "GEREK=0"
if not exist "%~dp0araclar\kurulum-tamam.txt" set "GEREK=1"
where node >nul 2>nul
if errorlevel 1 set "GEREK=1"
where ffmpeg >nul 2>nul
if errorlevel 1 set "GEREK=1"
if "%GEREK%"=="0" goto :form
echo Ilk kurulum yapiliyor. Bir kez yapilir, birkac dakika surer.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0kur.ps1"
call "%~dp0ortam.bat"
where node >nul 2>nul
if errorlevel 1 goto :hata

:form
echo.
echo Form aciliyor. Bu pencereyi isin bitene kadar acik tut.
node server.mjs
goto :son

:hata
echo.
echo Kurulum tamamlanamadi. Yukaridaki hata satirina bak, sonra baslat.bat dosyasini tekrar calistir.

:son
echo.
pause

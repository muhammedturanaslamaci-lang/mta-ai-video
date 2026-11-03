@echo off
rem Kurulan araclari SADECE bu pencere icin taniyan yol ayari. Bilgisayarin PATH ayarina yazmaz.
set "VEW_ARAC=%~dp0araclar"
if exist "%VEW_ARAC%\node-v22.12.0-win-x64\node.exe" set "PATH=%VEW_ARAC%\node-v22.12.0-win-x64;%PATH%"
if exist "%APPDATA%\npm" set "PATH=%APPDATA%\npm;%PATH%"
if exist "%LOCALAPPDATA%\Programs\Python\Python312\python.exe" set "PATH=%LOCALAPPDATA%\Programs\Python\Python312;%LOCALAPPDATA%\Programs\Python\Python312\Scripts;%PATH%"
if exist "%VEW_ARAC%\ffmpeg" for /r "%VEW_ARAC%\ffmpeg" %%F in (ffmpeg.exe) do if exist "%%F" set "PATH=%%~dpF;%PATH%"
set "VEW_ARAC="

@echo off
chcp 65001 >nul
title Video edit terminali
cd /d "%~dp0"
call "%~dp0ortam.bat"
echo Bu pencerede node, ffmpeg, python ve claude/codex/gemini taninir.
echo Kullandigin araci yaz. Ornek: claude
echo.
cmd /k

@echo off
rem Paleidžia kaleduSenelioLaiskai kūrimo serverį (http://localhost:5173)
cd /d "%~dp0"
if not exist node_modules call npm install
call npm run dev

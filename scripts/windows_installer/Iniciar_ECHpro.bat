@echo off
chcp 65001 >nul
title ECHpro Hotel PMS — Servidor Local
cls
color 0A

set "INSTALL_DIR=%~dp0"
if "%INSTALL_DIR:~-1%"=="\" set "INSTALL_DIR=%INSTALL_DIR:~0,-1%"
cd /d "%INSTALL_DIR%"

echo ===============================================================================
echo            ECHpro — SISTEMA DE GESTÃO DE HÓSPEDES PROFISSIONAL
echo                             Iniciando Servidor...
echo ===============================================================================
echo.

:: Verificar se o servidor já está ativo na porta 3000
netstat -ano | findstr ":3000" | findstr "LISTENING" >nul
if %errorlevel% equ 0 (
    echo [OK] O servidor ECHpro já está ativo e escutando na porta 3000.
    echo Abrindo navegador...
    start http://localhost:3000
    timeout /t 3 >nul
    exit /b 0
)

echo [1/2] Iniciando o servidor ECHpro (Porta 3000)...
echo Pressione CTRL+C para encerrar o servidor quando desejar.
echo.

:: Abrir navegador automaticamente após 3 segundos
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

:: Iniciar servidor
npm run dev

pause

@echo off
chcp 65001 >nul
title ECHpro v2.5 — Assistente de Instalação para Windows 10 e 11
cls
color 0B

echo ===============================================================================
echo            ECHpro — SISTEMA DE GESTÃO DE HÓSPEDES PROFISSIONAL
echo              Assistente de Instalação para Windows 10 e Windows 11
echo                  Desenvolvido por: Eben Chume (+258 82 747 3434)
echo ===============================================================================
echo.

:: 1. Verificar Privilégios de Administrador
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [AVISO] O instalador não está a executar como Administrador.
    echo Recomenda-se clicar com o botão direito e escolher "Executar como Administrador"
    echo para configurar automaticamente o atalho no Iniciar e regras de Firewall.
    echo.
    choice /M "Deseja continuar a instalação em modo de utilizador padrão?"
    if errorlevel 2 exit /b
    echo.
)

:: 2. Diretório de Instalação
set "INSTALL_DIR=%~dp0"
:: Remover barra final se houver
if "%INSTALL_DIR:~-1%"=="\" set "INSTALL_DIR=%INSTALL_DIR:~0,-1%"

echo [1/5] Verificando ambiente de execução...
echo       Diretório atual: "%INSTALL_DIR%"
echo.

:: 3. Verificar se o Node.js está instalado
echo [2/5] Verificando se o Node.js está instalado...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Node.js não foi encontrado no seu computador Windows.
    echo.
    echo O ECHpro necessita do Node.js LTS (versão 18 ou superior) para executar o servidor local.
    echo.
    echo Opções para instalar o Node.js:
    echo   [1] Instalar automaticamente via Windows Package Manager (winget)
    echo   [2] Abrir o site oficial do Node.js para download manual
    echo   [3] Cancelar instalação
    echo.
    set /p NODE_OPT="Escolha uma opção (1, 2 ou 3): "
    
    if "%NODE_OPT%"=="1" (
        echo A instalar Node.js LTS via winget...
        winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
        if %errorlevel% equ 0 (
            echo Node.js instalado com sucesso! Por favor reinicie este instalador.
            pause
            exit /b
        ) else (
            echo Falha ao instalar via winget. Abrindo site oficial...
            start https://nodejs.org/
            pause
            exit /b
        )
    ) else if "%NODE_OPT%"=="2" (
        start https://nodejs.org/
        echo Após concluir a instalação do Node.js, execute este instalador novamente.
        pause
        exit /b
    ) else (
        echo Instalação cancelada pelo utilizador.
        pause
        exit /b
    )
)

for /f "tokens=*" %%v in ('node -v') do set "NODE_VERSION=%%v"
echo       [OK] Node.js detectado: %NODE_VERSION%
echo.

:: 4. Instalar ou verificar dependências
echo [3/5] Verificando dependências do sistema ECHpro...
if exist "%INSTALL_DIR%\node_modules" (
    echo       Dependências já existentes na pasta.
) else (
    echo       Instalando pacotes necessários (pode levar 1-2 minutos)...
    call npm install --omit=dev --silent
    if %errorlevel% neq 0 (
        echo       Instalando com npm install padrão...
        call npm install
    )
)
echo       [OK] Módulos verificados.
echo.

:: 5. Criar Atalhos na Área de Trabalho e Menu Iniciar
echo [4/5] Criando atalhos no Windows (Ambiente de Trabalho e Menu Iniciar)...

set "LAUNCHER_BAT=%INSTALL_DIR%\Iniciar_ECHpro.bat"
set "LAUNCHER_VBS=%INSTALL_DIR%\Iniciar_ECHpro_Silencioso.vbs"
set "ICON_PATH=%INSTALL_DIR%\public\logo_ech.png"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$wsh = New-Object -ComObject WScript.Shell; " ^
    "$desk = [System.Environment]::GetFolderPath('Desktop'); " ^
    "$s = $wsh.CreateShortcut($desk + '\ECHpro Hotel PMS.lnk'); " ^
    "$s.TargetPath = '%LAUNCHER_VBS%'; " ^
    "$s.WorkingDirectory = '%INSTALL_DIR%'; " ^
    "$s.Description = 'ECHpro — Sistema de Gestão de Hóspedes Profissional'; " ^
    "if (Test-Path '%ICON_PATH%') { $s.IconLocation = '%ICON_PATH%'; } " ^
    "$s.Save(); " ^
    "Write-Host '       [OK] Atalho criado na Área de Trabalho: ECHpro Hotel PMS.lnk'"

powershell -NoProfile -ExecutionPolicy Bypass -Command ^
    "$wsh = New-Object -ComObject WScript.Shell; " ^
    "$progs = [System.Environment]::GetFolderPath('Programs'); " ^
    "$folder = $progs + '\ECHpro'; " ^
    "if (!(Test-Path $folder)) { New-Item -ItemType Directory -Path $folder | Out-Null }; " ^
    "$s = $wsh.CreateShortcut($folder + '\ECHpro Hotel PMS.lnk'); " ^
    "$s.TargetPath = '%LAUNCHER_VBS%'; " ^
    "$s.WorkingDirectory = '%INSTALL_DIR%'; " ^
    "$s.Description = 'ECHpro — Sistema de Gestão de Hóspedes Profissional'; " ^
    "if (Test-Path '%ICON_PATH%') { $s.IconLocation = '%ICON_PATH%'; } " ^
    "$s.Save(); " ^
    "Write-Host '       [OK] Atalho criado no Menu Iniciar: Programas\\ECHpro\\ECHpro Hotel PMS.lnk'"

echo.

:: 6. Configurar Regra no Firewall do Windows (opcional para rede local de hotel)
echo [5/5] Configuração de Rede do Hotel (Multi-computadores / Rede Local)...
echo Deseja autorizar o ECHpro no Firewall do Windows para que outros computadores
echo (recepção 2, gerência, restaurante) possam acessar via IP local na porta 3000?
echo.
choice /M "Configurar exceção no Firewall do Windows agora?"
if errorlevel 2 goto skip_firewall

net session >nul 2>&1
if %errorlevel% equ 0 (
    netsh advfirewall firewall delete rule name="ECHpro Hotel Server (Port 3000)" >nul 2>&1
    netsh advfirewall firewall add rule name="ECHpro Hotel Server (Port 3000)" dir=in action=allow protocol=TCP localport=3000 profile=any >nul 2>&1
    echo       [OK] Regra criada com sucesso no Firewall do Windows (Porta 3000 liberada).
) else (
    echo       [AVISO] Requer permissões de administrador. Pode executar posteriormente o arquivo:
    echo       configurar_firewall_rede_local.bat
)

:skip_firewall
echo.
echo ===============================================================================
echo              INSTALAÇÃO DO ECHPRO CONCLUÍDA COM SUCESSO!
echo ===============================================================================
echo.
echo O ECHpro está pronto para uso no Windows 10/11.
echo Foi criado um ícone "ECHpro Hotel PMS" na sua Área de Trabalho.
echo.
echo Contato de Suporte Técnico:
echo   Eng. Eben Chume
echo   WhatsApp / Celular: +258 82 747 3434
echo   E-mail: ebenchume@sapo.mz / ebenchume@gmail.com
echo.
echo ===============================================================================
echo.
choice /M "Deseja iniciar o ECHpro agora?"
if errorlevel 2 goto end_installer

start "" "%LAUNCHER_VBS%"

:end_installer
echo.
echo Obrigado por escolher o ECHpro!
timeout /t 3 >nul
exit /b 0

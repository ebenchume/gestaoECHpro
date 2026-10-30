@echo off
chcp 65001 >nul
title ECHpro — Configurar Firewall do Windows para Rede Local
cls
color 0E

echo ===============================================================================
echo            ECHpro — CONFIGURADOR DE REDE LOCAL (HOTEL / POUSADA)
echo                     Acesso Multi-computadores / Port 3000
echo ===============================================================================
echo.

net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERRO] Este script requer privilégios de Administrador.
    echo Por favor, clique com o botão direito no arquivo e escolha:
    echo "Executar como Administrador"
    echo.
    pause
    exit /b 1
)

echo Este assistente irá configurar o Firewall do Windows Defender para permitir
echo que outros dispositivos na mesma rede Wi-Fi / LAN (outros computadores da recepção,
echo smartphones e tablets da gerência ou governança) possam aceder ao ECHpro.
echo.
choice /M "Deseja liberar a Porta 3000 TCP no Firewall do Windows?"
if errorlevel 2 exit /b

echo.
echo Adicionando regra de entrada no Firewall...
netsh advfirewall firewall delete rule name="ECHpro Hotel Server (Port 3000)" >nul 2>&1
netsh advfirewall firewall add rule name="ECHpro Hotel Server (Port 3000)" dir=in action=allow protocol=TCP localport=3000 profile=any >nul 2>&1

if %errorlevel% equ 0 (
    echo [SUCESSO] Porta 3000 liberada com sucesso no Firewall do Windows!
    echo.
    echo Para saber o IP deste computador para que outros usem, aqui está o seu IP local:
    echo -------------------------------------------------------------------------------
    ipconfig | findstr /i "IPv4"
    echo -------------------------------------------------------------------------------
    echo.
    echo Exemplo de acesso nos outros computadores:
    echo http://192.168.1.X:3000  (substitua pelo seu endereço IPv4 listado acima)
    echo.
) else (
    echo [FALHA] Não foi possível adicionar a regra no Firewall.
)

pause
exit /b 0

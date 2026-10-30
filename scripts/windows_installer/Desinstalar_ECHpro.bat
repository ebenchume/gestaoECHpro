@echo off
chcp 65001 >nul
title Desinstalar ECHpro do Windows
cls
color 0C

echo ===============================================================================
echo            ECHpro — DESINSTALADOR DO SISTEMA PARA WINDOWS 10/11
echo ===============================================================================
echo.
echo Tem a certeza de que deseja remover os atalhos e configurações do ECHpro
echo deste computador Windows?
echo.
echo NOTA: Os seus dados de hóspedes, faturas e backups NÃO serão apagados.
echo.
choice /M "Deseja continuar com a desinstalação dos atalhos?"
if errorlevel 2 exit /b

echo.
echo [1/3] Removendo atalho da Área de Trabalho...
powershell -NoProfile -Command ^
    "$desk = [System.Environment]::GetFolderPath('Desktop'); " ^
    "$link = $desk + '\ECHpro Hotel PMS.lnk'; " ^
    "if (Test-Path $link) { Remove-Item $link -Force; Write-Host '       [OK] Atalho da Área de Trabalho removido.' } else { Write-Host '       [INFO] Atalho não encontrado.' }"

echo [2/3] Removendo atalhos do Menu Iniciar...
powershell -NoProfile -Command ^
    "$progs = [System.Environment]::GetFolderPath('Programs'); " ^
    "$folder = $progs + '\ECHpro'; " ^
    "if (Test-Path $folder) { Remove-Item $folder -Recurse -Force; Write-Host '       [OK] Pasta do Menu Iniciar removida.' } else { Write-Host '       [INFO] Pasta não encontrada.' }"

echo [3/3] Removendo regra do Firewall do Windows...
net session >nul 2>&1
if %errorlevel% equ 0 (
    netsh advfirewall firewall delete rule name="ECHpro Hotel Server (Port 3000)" >nul 2>&1
    echo       [OK] Regra de Firewall removida.
) else (
    echo       [INFO] Firewall mantido (requer privilégios de Administrador).
)

echo.
echo ===============================================================================
echo                DESINSTALAÇÃO DE ATALHOS CONCLUÍDA
echo ===============================================================================
echo.
pause
exit /b 0

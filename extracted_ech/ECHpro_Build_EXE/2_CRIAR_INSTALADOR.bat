@echo off
chcp 65001 >nul
title ECHpro - Criar Instalador
color 0B

echo.
echo  ========================================================
echo   ECHpro - Criar Instalador Setup.exe
echo  ========================================================
echo.

if not exist dist\ECHpro.exe (
    echo  [ERRO] Nao foi encontrado dist\ECHpro.exe
    echo  Execute primeiro o ficheiro 1_INSTALAR_E_GERAR_EXE.bat
    pause
    exit /b 1
)

where iscc >nul 2>&1
if errorlevel 1 (
    echo  [ERRO] Inno Setup 6 nao encontrado no PATH.
    echo  Instale de: https://jrsoftware.org/isinfo.php
    echo  e tente novamente.
    pause
    exit /b 1
)

echo  A gerar instalador com Inno Setup...
iscc setup.iss

if errorlevel 1 (
    echo  [ERRO] Falha ao gerar o instalador.
    pause
    exit /b 1
)

echo.
echo  Instalador criado em: dist_installer\ECHpro_Setup.exe
echo.
if exist dist_installer\ECHpro_Setup.exe (
    explorer dist_installer
)
pause

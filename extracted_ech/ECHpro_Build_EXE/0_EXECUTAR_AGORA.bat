@echo off
chcp 65001 >nul
title ECHpro - Executar
cd /d "%~dp0"
python ECHpro_Completo.py
if errorlevel 1 (
    echo.
    echo  Se der erro de dependencias, execute primeiro:
    echo  1_INSTALAR_E_GERAR_EXE.bat
    pause
)

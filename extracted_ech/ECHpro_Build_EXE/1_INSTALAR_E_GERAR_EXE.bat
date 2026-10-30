@echo off
chcp 65001 >nul
title ECHpro - Gerador de Executavel
color 0B

echo.
echo  ========================================================
echo   ECHpro v2.2
echo   Gerador automatico do ficheiro .EXE para Windows 10/11
echo   Apoio: +258 82 747 3434 | ebenchume@sapo.mz
echo  ========================================================
echo.

:: Verificar Python
python --version >nul 2>&1
if errorlevel 1 (
    echo  [ERRO] Python nao encontrado!
    echo.
    echo  Instale o Python 3.10 ou superior de:
    echo  https://www.python.org/downloads/
    echo.
    echo  IMPORTANTE: durante a instalacao, marque a opcao
    echo  "Add Python to PATH"
    echo.
    pause
    exit /b 1
)

echo  [1/5] Python encontrado:
python --version
echo.

echo  [2/5] A actualizar o pip...
python -m pip install --upgrade pip --quiet
echo.

echo  [3/5] A instalar dependencias necessarias...
python -m pip install customtkinter bcrypt sqlalchemy pillow openpyxl pyinstaller --quiet
if errorlevel 1 (
    echo  [ERRO] Falha ao instalar dependencias.
    echo  Verifique a ligacao a Internet e tente novamente.
    pause
    exit /b 1
)
echo  Dependencias instaladas com sucesso.
echo.

echo  [4/5] A limpar builds anteriores...
if exist build rmdir /s /q build 2>nul
if exist dist rmdir /s /q dist 2>nul
if exist *.spec del /q *.spec 2>nul
echo.

echo  [5/5] A gerar o executavel ECHpro.exe ...
echo  (Isto pode demorar 1 a 3 minutos)
echo.

python -m PyInstaller ^
    --noconfirm ^
    --onefile ^
    --windowed ^
    --name "ECHpro" ^
    --hidden-import=bcrypt ^
    --hidden-import=customtkinter ^
    --hidden-import=PIL ^
    --hidden-import=sqlalchemy ^
    --hidden-import=sqlalchemy.dialects.sqlite ^
    --hidden-import=openpyxl ^
    --collect-all customtkinter ^
    --collect-all bcrypt ^
    ECHpro_Completo.py

if errorlevel 1 (
    echo.
    echo  [ERRO] Falha ao gerar o executavel.
    pause
    exit /b 1
)

echo.
echo  ========================================================
echo   SUCESSO!
echo  ========================================================
echo.
echo   O ficheiro executavel foi criado em:
echo.
echo     dist\ECHpro.exe
echo.

:: Copiar ficheiros uteis para a pasta dist
if exist CHAVES_ACTIVACAO.txt copy /y CHAVES_ACTIVACAO.txt dist\ >nul
if exist GERAR_CHAVES.py copy /y GERAR_CHAVES.py dist\ >nul
if exist LEIA-ME.txt copy /y LEIA-ME.txt dist\ >nul

echo   Tambem foram copiados para dist\:
echo     - CHAVES_ACTIVACAO.txt  (50 chaves prontas)
echo     - GERAR_CHAVES.py
echo     - LEIA-ME.txt
echo.
echo   Pode copiar ECHpro.exe para qualquer PC Windows 10/11
echo   e executa-lo directamente (nao precisa de Python).
echo.
echo   Login padrao:  admin  /  admin123
echo.
echo   Apoio: +258 82 747 3434 | ebenchume@sapo.mz
echo.
echo  ========================================================
echo.

:: Abrir a pasta dist
if exist dist\ECHpro.exe (
    explorer dist
)

pause

@echo off
echo ========================================
echo    SERGIO IMPORTS - SISTEMA DE VENDAS
echo ========================================
echo.
echo Instalando dependencias...
echo.

REM Verificar se o Node.js está instalado
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Node.js nao encontrado!
    echo Por favor, instale o Node.js em: https://nodejs.org/
    pause
    exit /b 1
)

REM Verificar se o npm está disponível
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: npm nao encontrado!
    pause
    exit /b 1
)

echo Node.js encontrado! Continuando instalacao...
echo.

REM Instalar dependências do backend
echo Instalando dependencias do backend...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do backend
    pause
    exit /b 1
)
cd ..

REM Instalar dependências do frontend
echo.
echo Instalando dependencias do frontend...
cd frontend
call npm install
if %errorlevel% neq 0 (
    echo ERRO: Falha ao instalar dependencias do frontend
    pause
    exit /b 1
)
cd ..

echo.
echo ========================================
echo    INSTALACAO CONCLUIDA COM SUCESSO!
echo ========================================
echo.
echo Para iniciar o sistema:
echo 1. Execute: npm run dev
echo 2. Acesse: http://localhost:3000
echo.
echo Pressione qualquer tecla para continuar...
pause >nul

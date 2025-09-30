@echo off
title Deploy para GitHub
color 0A

echo ======================================================
echo        Script de Deploy para GitHub
echo ======================================================
echo.

echo Verificando status do Git...
git status >nul 2>&1
if %errorlevel% neq 0 (
    echo Git nao encontrado. Por favor, instale o Git primeiro.
    pause
    exit /b 1
)

echo Verificando se ja existe remote origin...
git remote get-url origin >nul 2>&1
if %errorlevel% equ 0 (
    echo Remote origin ja existe.
) else (
    echo Configurando remote origin...
    git remote add origin https://github.com/Se198361/sergio-imports--para-loja.git
)

echo.
echo ======================================================
echo Instrucoes para criar repositorio no GitHub:
echo ======================================================
echo 1. Acesse https://github.com/new
echo 2. Preencha as informacoes:
echo    - Repository name: sergio-imports--para-loja
echo    - Description: (opcional)
echo    - Public or Private: Sua escolha
echo    - IMPORTANTE: Nao marque nenhuma opcao de inicializacao (README, .gitignore, license)
echo 3. Clique em 'Create repository'
echo.
echo 4. Apos criar o repositorio, execute o comando:
echo    git push -u origin main
echo ======================================================
echo.

echo Abrindo navegador para criar o repositorio...
start "" "https://github.com/new"

echo.
echo Pressione qualquer tecla para continuar...
pause >nul
# Script para configurar repositório no GitHub
# Este script fornece instruções detalhadas para configurar seu repositório

# Verificar se o git está instalado
try {
    $gitVersion = git --version
    Write-Host "Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git não encontrado. Por favor, instale o Git primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se já estamos em um repositório git
if (Test-Path .git) {
    Write-Host "Já estamos em um repositório Git." -ForegroundColor Green
} else {
    Write-Host "Inicializando repositório Git..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
}

Write-Host ""
Write-Host "Instruções para criar repositório no GitHub:" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "1. Acesse https://github.com/new" -ForegroundColor Yellow
Write-Host "2. Preencha as informações:" -ForegroundColor Yellow
Write-Host "   - Repository name: sergio-imports--para-loja" -ForegroundColor Yellow
Write-Host "   - Description: (opcional)" -ForegroundColor Yellow
Write-Host "   - Public or Private: Sua escolha" -ForegroundColor Yellow
Write-Host "   - IMPORTANTE: Não marque nenhuma opção de inicialização (README, .gitignore, license)" -ForegroundColor Red
Write-Host "3. Clique em 'Create repository'" -ForegroundColor Yellow
Write-Host ""
Write-Host "4. Após criar o repositório, execute os comandos abaixo:" -ForegroundColor Cyan
Write-Host "   git remote add origin https://github.com/SEU_USUARIO/sergio-imports--para-loja.git" -ForegroundColor Yellow
Write-Host "   git push -u origin main" -ForegroundColor Yellow
Write-Host ""
Write-Host "Substitua SEU_USUARIO pelo seu nome de usuário do GitHub." -ForegroundColor Red
Write-Host ""
Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
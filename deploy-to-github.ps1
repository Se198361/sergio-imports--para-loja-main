# Script para automatizar a criação do repositório no GitHub e deploy do código
param(
    [Parameter(Mandatory=$true)]
    [string]$GitHubUsername,
    
    [Parameter(Mandatory=$true)]
    [string]$RepoName = "sergio-imports--para-loja"
)

Write-Host "Iniciando processo de deploy para GitHub..." -ForegroundColor Green
Write-Host "Usuário GitHub: $GitHubUsername" -ForegroundColor Yellow
Write-Host "Nome do repositório: $RepoName" -ForegroundColor Yellow

# Verificar se o git está instalado
try {
    $gitVersion = git --version
    Write-Host "Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "Git não encontrado. Por favor, instale o Git primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se já estamos em um repositório git
if (-not (Test-Path .git)) {
    Write-Host "Inicializando repositório Git..." -ForegroundColor Yellow
    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
} else {
    Write-Host "Já estamos em um repositório Git." -ForegroundColor Green
}

# Configurar o repositório remoto
$remoteUrl = "https://github.com/$GitHubUsername/$RepoName.git"
Write-Host "Configurando repositório remoto: $remoteUrl" -ForegroundColor Yellow

# Verificar se o remote origin já existe
$remoteExists = git remote get-url origin 2>$null
if ($remoteExists) {
    Write-Host "Remote origin já existe. Atualizando URL..." -ForegroundColor Yellow
    git remote set-url origin $remoteUrl
} else {
    Write-Host "Adicionando remote origin..." -ForegroundColor Yellow
    git remote add origin $remoteUrl
}

# Tentar push para o repositório
Write-Host "Enviando código para o GitHub..." -ForegroundColor Yellow
try {
    git push -u origin main
    Write-Host "Código enviado com sucesso para o GitHub!" -ForegroundColor Green
    Write-Host "Acesse seu repositório em: https://github.com/$GitHubUsername/$RepoName" -ForegroundColor Cyan
} catch {
    Write-Host "Erro ao enviar código. O repositório pode não existir no GitHub ainda." -ForegroundColor Red
    Write-Host "Por favor, crie o repositório em https://github.com/new" -ForegroundColor Yellow
    Write-Host "Nome do repositório: $RepoName" -ForegroundColor Yellow
    Write-Host "IMPORTANTE: Não inicialize o repositório com README, .gitignore ou licença." -ForegroundColor Red
    Write-Host "Após criar o repositório, execute novamente este script." -ForegroundColor Yellow
}

Write-Host "Processo concluído!" -ForegroundColor Green
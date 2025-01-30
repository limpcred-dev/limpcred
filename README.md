# LimpCred - Sistema de Gestão de Processos de Crédito

## 📋 Sobre o Projeto

LimpCred é um sistema web completo para gestão de processos de crédito, desenvolvido com React, TypeScript e Firebase. O sistema permite o gerenciamento de múltiplas empresas (multi-tenant), com foco em processos de limpeza de nome, análise de crédito e contestações.

### 🌟 Principais Funcionalidades

- **Multi-tenant**: Gestão de múltiplas empresas com isolamento completo de dados
- **Gestão de Usuários**: Diferentes níveis de acesso (admin, vendedor, etc.)
- **Gestão de Clientes**: Cadastro e acompanhamento de clientes
- **Gestão de Processos**: Fluxo completo de processos de crédito
- **Gestão Financeira**: 
  - Controle de faturas
  - Fluxo de caixa
  - Centros de custo
  - Contas bancárias
  - Cartões de crédito
- **Relatórios**: Análises e insights detalhados

## 🛠️ Tecnologias Utilizadas

- **Frontend**:
  - React 18
  - TypeScript
  - Tailwind CSS
  - Lucide Icons
  - Chart.js
  - React Router DOM

- **Backend/Infraestrutura**:
  - Firebase Authentication
  - Firebase Firestore
  - Firebase Storage
  - Firebase Security Rules

## 🏗️ Arquitetura

### Estrutura Multi-tenant

O sistema utiliza uma arquitetura multi-tenant que permite:
- Isolamento completo de dados entre empresas
- Compartilhamento seguro de recursos
- Escalabilidade horizontal

### Modelo de Dados

#### Coleções do Firestore

1. `empresas`
   - Armazena os dados das empresas
   - Cada documento representa uma empresa única
   - Campos principais:
     - razaoSocial
     - nomeFantasia
     - cnpj
     - etc.

2. `admin_empresas`
   - Relacionamento entre admins e empresas
   - ID do documento: `{adminId}_{empresaId}`
   - Campos:
     - adminId
     - empresaId
     - role
     - dataCriacao

### Contextos

1. `AuthContext`
   - Gerenciamento de autenticação
   - Login/Logout
   - Estado do usuário

2. `EmpresaContext`
   - Gerenciamento de empresas
   - Seleção de empresa ativa
   - Lista de empresas do admin

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- NPM ou Yarn
- Projeto Firebase configurado

### Configuração do Firebase

1. Crie um projeto no [Firebase Console](https://console.firebase.google.com)
2. Ative o Authentication com email/senha e Google
3. Ative o Firestore Database
4. Ative o Storage
5. Configure as regras de segurança conforme o arquivo `firestore.rules`
6. Configure os índices conforme o arquivo `firestore.indexes.json`

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_FIREBASE_API_KEY=seu_api_key
VITE_FIREBASE_AUTH_DOMAIN=seu_auth_domain
VITE_FIREBASE_PROJECT_ID=seu_project_id
VITE_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
VITE_FIREBASE_APP_ID=seu_app_id
```

### Instalação

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

## 📱 Funcionalidades por Perfil

### Admin
- Gestão completa de empresas
- Gestão de usuários
- Acesso a todos os relatórios
- Configurações do sistema

### Vendedor
- Gestão de clientes próprios
- Criação e acompanhamento de processos
- Gestão de faturas
- Relatórios específicos

### Cliente
- Visualização de processos
- Acompanhamento de faturas
- Suporte

## 🔒 Segurança

### Regras de Acesso
- Cada usuário só acessa dados das suas empresas
- Validação de permissões por role
- Tokens de autenticação Firebase

### Row Level Security
- Implementado no nível do Firestore
- Políticas de acesso granulares
- Isolamento de dados por empresa

## 📊 Relatórios Disponíveis

- Desempenho mensal
- Faturamento por consultor
- Fluxo de caixa
- Análise de processos
- Centro de custos

## 🤝 Contribuindo

1. Faça o fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Autores

**Edson Ferreira de Paula Junior** - *Trabalho Inicial* - [GitHub](https://github.com/edsonpaulinojr)

## 🙏 Agradecimentos

- Firebase Team
- React Team
- Todos os contribuidores
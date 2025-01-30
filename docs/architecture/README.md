# Arquitetura do Sistema

## Estrutura Multi-tenant

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

### Segurança

1. Regras de Acesso
   - Cada usuário só acessa dados das suas empresas
   - Validação de permissões por role
   - Tokens de autenticação Firebase
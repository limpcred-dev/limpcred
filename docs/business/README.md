# Processos de Negócio

## Gestão de Empresas

### Cadastro de Empresa

1. Processo
   - Sistema verifica se admin tem empresa cadastrada
   - Se não tiver, bloqueia acesso ao dashboard
   - Apresenta tela de boas-vindas com formulário
   - Após cadastro, libera acesso ao sistema

2. Fluxo Alternativo
   - Admin acessa a área de empresas
   - Clica em "Nova Empresa"
   - Preenche dados cadastrais
   - Sistema cria empresa e vincula ao admin

3. Regras de Negócio
   - CNPJ deve ser único
   - Admin pode ter múltiplas empresas
   - Empresa inicia com status "ativa"
   - Sistema exige pelo menos uma empresa cadastrada

### Seleção de Empresa Ativa

1. Processo
   - Admin visualiza lista de empresas
   - Seleciona empresa desejada
   - Sistema filtra todos os dados pela empresa selecionada

2. Persistência
   - Seleção salva no localStorage
   - Recuperada ao recarregar página
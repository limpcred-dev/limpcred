# Documentação Técnica

## Stack Tecnológica

- React
- TypeScript
- Firebase (Auth + Firestore)
- TailwindCSS
- Lucide Icons

## Estrutura de Arquivos

```
src/
├── components/     # Componentes reutilizáveis
├── contexts/      # Contextos React
├── hooks/         # Hooks personalizados
├── pages/         # Páginas da aplicação
├── services/      # Serviços e APIs
└── types/         # Tipos TypeScript
```

## Padrões de Código

1. Componentes
   - Functional Components
   - Props tipadas com TypeScript
   - Hooks para lógica reutilizável

2. Contextos
   - Providers para estado global
   - Hooks personalizados para acesso
   - Componentes de proteção (EmpresaRequired)

3. Serviços
   - Módulos por funcionalidade
   - Interfaces bem definidas
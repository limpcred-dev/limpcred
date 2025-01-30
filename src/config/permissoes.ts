import { TipoUsuario, Permissao } from '../types/usuario';

export const permissoesPadrao: Record<TipoUsuario, Permissao[]> = {
  gestor: [
    { recurso: '*', acoes: ['ler', 'criar', 'editar', 'excluir'] }
  ],
  gerente: [
    { recurso: 'usuarios', acoes: ['ler', 'criar', 'editar'] },
    { recurso: 'clientes', acoes: ['ler', 'criar', 'editar', 'excluir'] },
    { recurso: 'vendas', acoes: ['ler', 'criar', 'editar', 'excluir'] },
    { recurso: 'relatorios', acoes: ['ler'] }
  ],
  financeiro: [
    { recurso: 'financeiro', acoes: ['ler', 'criar', 'editar', 'excluir'] },
    { recurso: 'relatorios', acoes: ['ler'] }
  ],
  vendedor: [
    { recurso: 'clientes', acoes: ['ler', 'criar'] },
    { recurso: 'vendas', acoes: ['ler', 'criar'] }
  ],
  colaborador: [
    { recurso: 'clientes', acoes: ['ler'] },
    { recurso: 'vendas', acoes: ['ler'] }
  ],
  cliente: [
    { recurso: 'pedidos', acoes: ['ler'] },
    { recurso: 'perfil', acoes: ['ler', 'editar'] }
  ]
};
import { useCallback } from 'react';
import { useAuth } from './useAuth';
import { Permissao } from '../types/usuario';

export function usePermissoes() {
  const { user } = useAuth();

  const temPermissao = useCallback((
    recurso: string,
    acao: 'ler' | 'criar' | 'editar' | 'excluir'
  ): boolean => {
    if (!user?.permissoes) return false;

    // Verifica permissão global
    const permissaoGlobal = user.permissoes.find(p => p.recurso === '*');
    if (permissaoGlobal?.acoes.includes(acao)) return true;

    // Verifica permissão específica
    const permissao = user.permissoes.find(p => p.recurso === recurso);
    return permissao?.acoes.includes(acao) || false;
  }, [user]);

  const getPermissoes = useCallback((): Permissao[] => {
    return user?.permissoes || [];
  }, [user]);

  return {
    temPermissao,
    getPermissoes
  };
}
import React from 'react';
import { usePermissoes } from '../../hooks/usePermissoes';

interface PermissaoGateProps {
  recurso: string;
  acao: 'ler' | 'criar' | 'editar' | 'excluir';
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function PermissaoGate({ 
  recurso, 
  acao, 
  children, 
  fallback = null 
}: PermissaoGateProps) {
  const { temPermissao } = usePermissoes();

  if (!temPermissao(recurso, acao)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
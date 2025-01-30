import { useContext } from 'react';
import { EmpresaContext } from '../contexts/EmpresaContext';

export function useEmpresa() {
  const context = useContext(EmpresaContext);
  if (!context) {
    throw new Error('useEmpresa deve ser usado dentro de um EmpresaProvider');
  }
  return context;
}
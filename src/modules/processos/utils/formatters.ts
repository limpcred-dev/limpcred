import { StatusProcesso, TipoProcesso } from '../types';

export const formatarStatus = (status: StatusProcesso): string => {
  const statusMap: Record<StatusProcesso, string> = {
    aberto: 'Aberto',
    em_andamento: 'Em Andamento',
    concluido: 'Concluído',
    cancelado: 'Cancelado'
  };
  return statusMap[status] || status;
};

export const formatarTipo = (tipo: TipoProcesso): string => {
  const tipoMap: Record<TipoProcesso, string> = {
    limpeza: 'Limpeza de Nome',
    analise: 'Análise de Crédito',
    contestacao: 'Contestação'
  };
  return tipoMap[tipo] || tipo;
};
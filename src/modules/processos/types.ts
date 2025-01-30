export type StatusProcesso = 'aberto' | 'em_andamento' | 'concluido' | 'cancelado';
export type TipoProcesso = 'limpeza' | 'analise' | 'contestacao';

export interface Processo {
  id: string;
  numero: string;
  tipo: TipoProcesso;
  clienteId: string;
  cliente: string;
  descricao: string;
  valor: number;
  responsavelId: string;
  responsavel: string;
  status: StatusProcesso;
  dataAbertura: Date;
  dataVencimento: Date;
  dataCriacao: Date;
  dataAtualizacao: Date;
  observacoes?: string;
  empresaId: string;
}

export interface ProcessoCreate extends Omit<Processo, 'id' | 'numero' | 'status' | 'dataAbertura' | 'dataCriacao' | 'dataAtualizacao'> {}
export type MetodoPagamento = 'pix' | 'cartao' | 'boleto' | 'transferencia';
export type StatusProcesso = 
  | 'Pendentes de envio'
  | 'Pendentes de entrega'
  | 'Enviado'
  | 'Entregue'
  | 'Garantia'
  | 'Aguardando conclusão';

export interface Processo {
  id: string;
  nome: string;
  clienteId: string;
  clienteNome: string;
  clienteDocumento: string;
  vendedorId: string;
  empresaId: string;
  status: StatusProcesso;
  metodoPagamento: MetodoPagamento;
  valor: number;
  valorEntrada: number;
  numeroParcelas: number;
  dataGarantia?: Date;
  contratoUrl?: string;
  comprovanteUrl?: string;
  observacoes?: string;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export interface ProcessoCreate extends Omit<Processo, 'id' | 'dataCriacao' | 'dataAtualizacao' | 'status'> {}
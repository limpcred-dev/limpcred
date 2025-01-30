export type TipoCentroCusto = 'receita' | 'despesa';
export type TipoContaBancaria = 'corrente' | 'poupanca' | 'investimento';
export type StatusRegistro = 'ativo' | 'inativo';
export type BandeiraCartao = 'visa' | 'mastercard' | 'elo' | 'amex';

export interface CentroCusto {
  id: string;
  nome: string;
  tipo: TipoCentroCusto;
  descricao?: string;
  centroPaiId?: string;
  empresaId: string;
  orcamento: number;
  userId: string;
  status: StatusRegistro;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export interface ContaBancaria {
  id: string;
  banco: string;
  agencia: string;
  conta: string;
  tipo: TipoContaBancaria;
  saldoInicial: number;
  saldoAtual: number;
  userId: string;
  status: StatusRegistro;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export interface CartaoCredito {
  id: string;
  nome: string;
  bandeira: BandeiraCartao;
  limite: number;
  diaFechamento: number;
  diaVencimento: number;
  cor: string;
  userId: string;
  status: StatusRegistro;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export interface Receita {
  id: string;
  descricao: string;
  valor: number;
  data: Date;
  centroCustoId: string;
  contaBancariaId?: string;
  cartaoCreditoId?: string;
  userId: string;
  status: StatusRegistro;
  observacoes?: string;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export interface Despesa {
  id: string;
  descricao: string;
  valor: number;
  data: Date;
  centroCustoId: string;
  contaBancariaId?: string;
  cartaoCreditoId?: string;
  userId: string;
  status: StatusRegistro;
  observacoes?: string;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

// Types for creating new records
export type CentroCustoCreate = Omit<CentroCusto, 'id' | 'dataCriacao' | 'dataAtualizacao'>;
export type ContaBancariaCreate = Omit<ContaBancaria, 'id' | 'dataCriacao' | 'dataAtualizacao'>;
export type CartaoCreditoCreate = Omit<CartaoCredito, 'id' | 'dataCriacao' | 'dataAtualizacao'>;
export type ReceitaCreate = Omit<Receita, 'id' | 'dataCriacao' | 'dataAtualizacao'>;
export type DespesaCreate = Omit<Despesa, 'id' | 'dataCriacao' | 'dataAtualizacao'>;

export interface Fatura {
  id: string;
  processoId: string;
  clienteId: string;
  clienteNome: string;
  empresaId: string;
  valor: number;
  numeroParcela: number;
  totalParcelas: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  metodoPagamento: string;
  observacoes?: string;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export type FaturaCreate = Omit<Fatura, 'id' | 'dataCriacao' | 'dataAtualizacao'>;
export interface Fatura {
  id: string;
  processoId: string;
  clienteId: string;
  clienteNome: string;
  empresaId: string;
  valor: number;
  numeroParcela: number;
  totalParcelas: number;
  dataVencimento: Date;
  dataPagamento?: Date;
  status: 'pendente' | 'pago' | 'atrasado' | 'cancelado';
  metodoPagamento: string;
  observacoes?: string;
  dataCriacao: Date;
  dataAtualizacao: Date;
}

export type FaturaCreate = Omit<Fatura, 'id' | 'dataCriacao' | 'dataAtualizacao'>;
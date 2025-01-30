export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  dataCriacao: Date;
}

export interface Cliente {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  status: 'Em Análise' | 'Aprovado' | 'Reprovado';
  consultor: string;
  dataCadastro: Date;
}

export interface Consultor {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  comissao: number;
  clientesAtendidos: number;
  ativo: boolean;
}
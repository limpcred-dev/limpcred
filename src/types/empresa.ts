export interface Empresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  email: string;
  telefone: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  logo?: string;
  dataCadastro: Date;
  status: 'ativa' | 'inativa';
}

export interface EmpresaCreate extends Omit<Empresa, 'id' | 'dataCadastro'> {}
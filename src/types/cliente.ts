export interface Cliente {
  id: string;
  nome: string;
  email: string;
  documento: string;
  whatsapp: string;
  endereco: {
    cep: string;
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
  };
  vendedorId: string;
  empresaId: string;
  status: 'ativo' | 'inativo';
  dataCadastro: Date;
  documentos?: string[];
}

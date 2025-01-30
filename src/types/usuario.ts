export type TipoUsuario = 'vendedor' | 'cliente' | 'gerente' | 'financeiro' | 'gestor' | 'colaborador';

export interface Permissao {
  recurso: string;
  acoes: ('ler' | 'criar' | 'editar' | 'excluir')[];
}

export interface Usuario {
  id: string;
  nome: string;
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
  email: string;
  tipo: TipoUsuario;
  empresaId: string;
  status: 'ativo' | 'inativo';
  dataCriacao: Date;
  permissoes: Permissao[];
  foto?: string;
}

export interface UsuarioCreate extends Omit<Usuario, 'id' | 'dataCriacao' | 'permissoes'> {
  senha: string;
}
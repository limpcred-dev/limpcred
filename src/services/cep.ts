interface EnderecoResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export const buscarCEP = async (cep: string): Promise<EnderecoResponse> => {
  const cepLimpo = cep.replace(/\D/g, '');
  
  if (cepLimpo.length !== 8) {
    throw new Error('CEP inválido');
  }

  const response = await fetch(`https://brasilapi.com.br/api/cep/v1/${cepLimpo}`);
  
  if (!response.ok) {
    throw new Error('CEP não encontrado');
  }

  const data = await response.json();
  
  return {
    cep: data.cep,
    logradouro: data.street || '',
    complemento: '',
    bairro: data.neighborhood || '',
    localidade: data.city || '',
    uf: data.state || ''
  };
};
export const formataMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
};

export const formataCPFCNPJ = (valor: string): string => {
  // Remove tudo que não é número
  const numeros = valor.replace(/\D/g, '');
  
  // CPF
  if (numeros.length <= 11) {
    return numeros.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4'
    );
  }
  
  // CNPJ
  return numeros.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  );
};

export const formataData = (data: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(data);
};
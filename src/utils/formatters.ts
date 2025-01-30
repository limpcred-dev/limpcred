export const formatCPFCNPJ = (value: string) => {
  // Remove tudo que não é número
  const numbers = value.replace(/\D/g, '');
  
  // CPF
  if (numbers.length <= 11) {
    return numbers.replace(
      /(\d{3})(\d{3})(\d{3})(\d{2})/,
      '$1.$2.$3-$4'
    );
  }
  
  // CNPJ
  return numbers.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    '$1.$2.$3/$4-$5'
  );
};

export const formatCnpjCpf = (value: string): string => {
  // Remove todos os caracteres não numéricos
  const cleanValue = value.replace(/\D/g, '');
  
  // Aplica máscara baseada no tamanho
  if (cleanValue.length <= 11) {
    // CPF: XXX.XXX.XXX-XX
    return cleanValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  } else {
    // CNPJ: XX.XXX.XXX/XXXX-XX
    return cleanValue
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2');
  }
};

export const validateCnpjCpf = (value: string): boolean => {
  const cleanValue = value.replace(/\D/g, '');
  return cleanValue.length === 11 || cleanValue.length === 14;
};

export const getCnpjCpfPlaceholder = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '');
  if (cleanValue.length === 0) return "Digite seu CPF ou CNPJ da empresa";
  if (cleanValue.length <= 6) return "XXX.XXX.XXX-XX (CPF) ou XX.XXX.XXX/XXXX-XX (CNPJ)";
  if (cleanValue.length <= 11) return "XXX.XXX.XXX-XX (CPF)";
  return "XX.XXX.XXX/XXXX-XX (CNPJ)";
};

// Suporta CNPJ Alfanumérico (Receita Federal):
// 14 caracteres totais — 12 primeiros podem ser letras (A-Z) ou números,
// os 2 últimos (dígitos verificadores) continuam exclusivamente numéricos.
// CPF permanece apenas numérico (11 dígitos).

const sanitize = (value: string): string =>
  value.toUpperCase().replace(/[^0-9A-Z]/g, '');

const isLikelyCnpj = (clean: string): boolean =>
  /[A-Z]/.test(clean) || clean.length > 11;

const formatCpf = (digits: string): string =>
  digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2');

const formatCnpjAlfa = (clean: string): string => {
  // 12 alfanuméricos + 2 numéricos
  const body = clean.slice(0, 12);
  const digits = clean.slice(12, 14).replace(/[^0-9]/g, '');
  let out = body;
  if (body.length > 2) out = `${body.slice(0, 2)}.${body.slice(2)}`;
  if (body.length > 5) out = `${out.slice(0, 6)}.${out.slice(6)}`;
  if (body.length > 8) out = `${out.slice(0, 10)}/${out.slice(10)}`;
  if (digits.length > 0) out = `${out}-${digits}`;
  return out;
};

export const formatCnpjCpf = (value: string): string => {
  const clean = sanitize(value).slice(0, 14);
  if (!clean) return '';
  if (isLikelyCnpj(clean)) return formatCnpjAlfa(clean);
  return formatCpf(clean);
};

export const validateCnpjCpf = (value: string): boolean => {
  const clean = sanitize(value);
  if (/^[0-9]{11}$/.test(clean)) return true; // CPF
  if (/^[0-9A-Z]{12}[0-9]{2}$/.test(clean)) return true; // CNPJ alfanumérico (ou numérico)
  return false;
};

export const getCnpjCpfPlaceholder = (value: string): string => {
  const clean = sanitize(value);
  if (clean.length === 0) return 'Digite seu CPF ou CNPJ da empresa';
  if (/[A-Z]/.test(clean)) return 'XX.XXX.XXX/XXXX-XX (CNPJ alfanumérico)';
  if (clean.length <= 11) return 'XXX.XXX.XXX-XX (CPF)';
  return 'XX.XXX.XXX/XXXX-XX (CNPJ)';
};

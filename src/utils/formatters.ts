
/**
 * Utility functions for formatting data
 */

// Format date to local Brazilian format
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('pt-BR');
};

// Format boolean fields for display
export const formatBooleanField = (value: boolean | null | undefined) => {
  if (value === undefined || value === null) return 'Não informado';
  return value ? 'Sim' : 'Não';
};

// Format arrays for display
export const formatArrayField = (arr: any[] | null | undefined) => {
  if (!arr || arr.length === 0) return 'Nenhum';
  return `${arr.length} item(ns)`;
};

// Format text fields for display
export const formatTextField = (text: string | null | undefined) => {
  if (text === undefined || text === null || text.trim() === '') return 'Não informado';
  return text;
};

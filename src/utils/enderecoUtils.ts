export const UF_LIST = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB",
  "PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

export function formatCep(value: string): string {
  const digits = (value || "").replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export interface EnderecoParts {
  cep?: string | null;
  logradouro?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;
  cidade?: string | null;
  estado?: string | null;
}

export function buildEnderecoCompleto(p: EnderecoParts): string {
  if (!p) return "";
  const street = [p.logradouro, p.numero].filter(Boolean).join(", ");
  const parts = [
    [street, p.complemento].filter(Boolean).join(" - "),
    p.bairro,
    [p.cidade, p.estado].filter(Boolean).join("/"),
    p.cep,
  ].filter(Boolean);
  return parts.join(" - ");
}

export async function fetchViaCep(cep: string): Promise<Partial<EnderecoParts> | null> {
  const digits = (cep || "").replace(/\D/g, "");
  if (digits.length !== 8) return null;
  try {
    const resp = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data?.erro) return null;
    return {
      logradouro: data.logradouro || "",
      bairro: data.bairro || "",
      cidade: data.localidade || "",
      estado: data.uf || "",
      complemento: data.complemento || "",
    };
  } catch {
    return null;
  }
}

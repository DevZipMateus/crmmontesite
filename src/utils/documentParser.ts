
/**
 * Interface for extracted project data with index signature
 */
export interface ExtractedProjectData {
  client_name?: string;
  template?: string;
  responsible_name?: string;
  status?: string;
  domain?: string;
  provider_credentials?: string;
  blaster_link?: string;
  client_type?: string;
  [key: string]: string | undefined; // Add index signature to make it assignable to Record<string, string>
}

/**
 * Extracts project data from document text content
 * @param text The document text content
 * @returns Object with extracted project data
 */
export function extractProjectDataFromText(text: string): ExtractedProjectData {
  const data: ExtractedProjectData = {};
  
  // Extract client name - look for common patterns
  const clientPatterns = [
    /cliente:\s*([^\n]+)/i,
    /nome do cliente:\s*([^\n]+)/i,
    /client name:\s*([^\n]+)/i,
    /empresa:\s*([^\n]+)/i,
    /nome da empresa:\s*([^\n]+)/i
  ];
  
  for (const pattern of clientPatterns) {
    const match = text.match(pattern);
    if (match && match[1]?.trim()) {
      data.client_name = match[1].trim();
      break;
    }
  }
  
  // Extract template information
  const templatePatterns = [
    /template:\s*([^\n]+)/i,
    /modelo:\s*([^\n]+)/i,
    /modelo escolhido:\s*([^\n]+)/i,
    /tema:\s*([^\n]+)/i
  ];
  
  for (const pattern of templatePatterns) {
    const match = text.match(pattern);
    if (match && match[1]?.trim()) {
      data.template = match[1].trim();
      break;
    }
  }
  
  // Extract responsible name
  const responsiblePatterns = [
    /responsável:\s*([^\n]+)/i,
    /responsavel:\s*([^\n]+)/i,
    /responsável pelo projeto:\s*([^\n]+)/i,
    /gerente:\s*([^\n]+)/i
  ];
  
  for (const pattern of responsiblePatterns) {
    const match = text.match(pattern);
    if (match && match[1]?.trim()) {
      data.responsible_name = match[1].trim();
      break;
    }
  }

  // Extract domain information
  const domainPatterns = [
    /domínio:\s*([^\n]+)/i,
    /dominio:\s*([^\n]+)/i,
    /domain:\s*([^\n]+)/i,
    /url:\s*([^\n]+)/i
  ];
  
  for (const pattern of domainPatterns) {
    const match = text.match(pattern);
    if (match && match[1]?.trim()) {
      data.domain = match[1].trim();
      break;
    }
  }

  // Extract provider credentials
  const credentialsPatterns = [
    /credenciais[\s\S]*?login[^\n]*?:\s*([^\n]+)[\s\S]*?senha[^\n]*?:\s*([^\n]+)/i,
    /provedor[\s\S]*?login[^\n]*?:\s*([^\n]+)[\s\S]*?senha[^\n]*?:\s*([^\n]+)/i,
    /login[^\n]*?:\s*([^\n]+)[\s\S]*?senha[^\n]*?:\s*([^\n]+)/i
  ];
  
  for (const pattern of credentialsPatterns) {
    const match = text.match(pattern);
    if (match && match[1]?.trim() && match[2]?.trim()) {
      data.provider_credentials = `Login: ${match[1].trim()}, Senha: ${match[2].trim()}`;
      break;
    }
  }
  
  // Default status for new projects
  data.status = "Em andamento";
  
  return data;
}

/**
 * Validates if the extracted data has the minimum required fields
 * @param data The extracted project data
 * @returns boolean indicating if data has minimum required fields
 */
export function isValidProjectData(data: ExtractedProjectData): boolean {
  // At minimum we need the client name to create a project
  return !!data.client_name;
}


export interface SubmissionProps {
  logoFile: File | null;
  depoimentoFiles: File[];
  midiaFiles: File[];
  midiaCaptions?: string[];
  modeloSelecionado?: string;
  projectHash?: string;
  hashFromUrl?: string;
  onSuccess?: () => void;
  leadFormHash?: string;
}

export interface UploadProgress {
  [key: string]: number;
}

export const MAX_FILE_SIZE_MB = 10;

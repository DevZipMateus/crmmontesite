import { useEffect, useRef, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useDebounce } from './useDebounce';

interface AutoSaveOptions {
  storageKey: string;
  excludeFields?: string[];
  debounceMs?: number;
  expirationDays?: number;
}

export interface SavedFile {
  name: string;
  type: string;
  size: number;
  dataUrl: string; // base64 data URL
}

interface SavedFormData<T> {
  formData: T;
  timestamp: string;
  version: string;
  fileMetadata?: {
    logoPreview?: string | null;
    logoFileName?: string | null;
    depoimentoPreviews?: string[];
    midiaPreviews?: string[];
    midiaCaptions?: string[];
  };
  files?: {
    logo?: SavedFile | null;
    depoimentos?: SavedFile[];
    midias?: SavedFile[];
  };
}

export function useFormAutoSave<T extends Record<string, any>>(
  form: UseFormReturn<T>,
  options: AutoSaveOptions
) {
  const {
    storageKey,
    excludeFields = [],
    debounceMs = 1000,
    expirationDays = 7
  } = options;

  const [hasSavedData, setHasSavedData] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const isLoadingRef = useRef(false);

  // Check if there's saved data on mount
  useEffect(() => {
    const savedData = loadSavedData();
    setHasSavedData(!!savedData);
  }, [storageKey]);

  // Auto-save on form changes
  const saveFormData = useDebounce((data: T) => {
    if (isLoadingRef.current) return;
    
    setIsSaving(true);
    try {
      const dataToSave = { ...data };
      
      // Remove excluded fields
      excludeFields.forEach(field => {
        delete dataToSave[field];
      });

      const savedData: SavedFormData<T> = {
        formData: dataToSave,
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      localStorage.setItem(storageKey, JSON.stringify(savedData));
      setLastSavedAt(new Date());
      setHasSavedData(true);
    } catch (error) {
      console.error('Erro ao salvar rascunho:', error);
    } finally {
      setIsSaving(false);
    }
  }, debounceMs);

  // Watch form changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      saveFormData(data as T);
    });

    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Load saved data
  function loadSavedData(): SavedFormData<T> | null {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;

      const parsed: SavedFormData<T> = JSON.parse(saved);
      
      // Check expiration
      const savedDate = new Date(parsed.timestamp);
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() - expirationDays);
      
      if (savedDate < expirationDate) {
        clearSavedData();
        return null;
      }

      return parsed;
    } catch (error) {
      console.error('Erro ao carregar rascunho:', error);
      return null;
    }
  }

  // Restore form data
  function restoreSavedData(): boolean {
    try {
      isLoadingRef.current = true;
      const saved = loadSavedData();
      
      if (!saved) return false;

      // Restore form values
      Object.keys(saved.formData).forEach((key) => {
        form.setValue(key as any, saved.formData[key]);
      });

      setLastSavedAt(new Date(saved.timestamp));
      return true;
    } catch (error) {
      console.error('Erro ao restaurar rascunho:', error);
      return false;
    } finally {
      isLoadingRef.current = false;
    }
  }

  // Clear saved data
  function clearSavedData() {
    try {
      localStorage.removeItem(storageKey);
      setHasSavedData(false);
      setLastSavedAt(null);
    } catch (error) {
      console.error('Erro ao limpar rascunho:', error);
    }
  }

  // Save file metadata separately
  function saveFileMetadata(metadata: SavedFormData<T>['fileMetadata']) {
    try {
      const saved = loadSavedData();
      if (saved) {
        saved.fileMetadata = metadata;
        localStorage.setItem(storageKey, JSON.stringify(saved));
      }
    } catch (error) {
      console.error('Erro ao salvar metadados de arquivos:', error);
    }
  }

  // Load file metadata
  function loadFileMetadata(): SavedFormData<T>['fileMetadata'] | null {
    const saved = loadSavedData();
    return saved?.fileMetadata || null;
  }

  return {
    hasSavedData,
    lastSavedAt,
    isSaving,
    restoreSavedData,
    clearSavedData,
    saveFileMetadata,
    loadFileMetadata,
    getSavedTimestamp: () => loadSavedData()?.timestamp
  };
}

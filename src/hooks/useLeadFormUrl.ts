import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { generateLeadFormHash, generateLeadFormUrl, checkLeadFormStatus } from '@/services/leadFormService';
import { Lead } from '@/types/lead';

export const useLeadFormUrl = (lead: Lead) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [formUrl, setFormUrl] = useState<string | null>(
    lead.form_hash ? generateLeadFormUrl(lead.form_hash) : null
  );
  const [formStatus, setFormStatus] = useState<'completed' | 'pending'>('pending');

  // Gerar URL do formulário
  const generateUrl = async () => {
    if (formUrl) return formUrl; // Já existe

    setIsGenerating(true);
    try {
      const hash = await generateLeadFormHash(lead.id);
      const url = generateLeadFormUrl(hash);
      setFormUrl(url);
      
      toast({
        title: "URL gerada com sucesso!",
        description: "A URL do formulário foi criada."
      });
      
      return url;
    } catch (error) {
      console.error('Error generating form URL:', error);
      toast({
        title: "Erro ao gerar URL",
        description: "Não foi possível gerar a URL do formulário.",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  // Copiar URL para clipboard
  const copyUrl = async () => {
    const url = formUrl || await generateUrl();
    if (!url) return;

    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "URL copiada!",
        description: "A URL foi copiada para a área de transferência."
      });
    } catch (error) {
      console.error('Error copying URL:', error);
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar a URL.",
        variant: "destructive"
      });
    }
  };

  // Abrir formulário em nova aba
  const openForm = async () => {
    const url = formUrl || await generateUrl();
    if (!url) return;

    window.open(url, '_blank');
  };

  // Verificar status do formulário
  const checkStatus = async () => {
    try {
      const status = await checkLeadFormStatus(lead.id);
      setFormStatus(status);
      return status;
    } catch (error) {
      console.error('Error checking form status:', error);
      return 'pending';
    }
  };

  return {
    formUrl,
    formStatus,
    isGenerating,
    generateUrl,
    copyUrl,
    openForm,
    checkStatus
  };
};
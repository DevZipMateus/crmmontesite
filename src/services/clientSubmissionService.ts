import { supabase } from "@/integrations/supabase/client";
import { ClientMediaSubmission, ClientSubmissionFormData } from "@/types/clientSubmission";

export class ClientSubmissionService {
  static async getProjectByHash(hash: string) {
    const { data, error } = await supabase
      .from('projects')
      .select('id, client_name, template')
      .eq('client_submission_hash', hash)
      .single();

    if (error) throw error;
    return data;
  }

  static async submitClientMedia(
    projectId: string, 
    formData: ClientSubmissionFormData
  ): Promise<ClientMediaSubmission> {
    // Upload images first
    const uploadedImages = await this.uploadImages(projectId, formData.images);

    // Create submission record
    const { data, error } = await supabase
      .from('client_media_submissions')
      .insert({
        project_id: projectId,
        client_name: 'Cliente', // Default name since not collected
        client_email: null,
        message: formData.message,
        media_urls: uploadedImages
      })
      .select()
      .single();

    if (error) throw error;
    return data as ClientMediaSubmission;
  }

  static async uploadImages(projectId: string, images: Array<{ file: File; name: string; description?: string; price?: number }>) {
    const timestamp = Date.now();
    const uploadedImages: Array<{ 
      url: string; 
      name: string;
      description?: string;
      price?: number;
      caption?: string;
    }> = [];

    for (let i = 0; i < images.length; i++) {
      const imageData = images[i];
      const fileExt = imageData.file.name.split('.').pop();
      const fileName = `${projectId}/${timestamp}/${i + 1}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('client-submissions')
        .upload(fileName, imageData.file);

      if (uploadError) throw uploadError;

      // Criar caption combinada para compatibilidade
      const caption = imageData.price 
        ? `${imageData.name} - R$ ${imageData.price.toFixed(2)}`
        : imageData.name;

      uploadedImages.push({
        url: fileName,
        name: imageData.name,
        description: imageData.description,
        price: imageData.price,
        caption
      });
    }

    return uploadedImages;
  }

  static async getProjectSubmissions(projectId: string): Promise<ClientMediaSubmission[]> {
    const { data, error } = await supabase
      .from('client_media_submissions')
      .select('*')
      .eq('project_id', projectId)
      .order('submission_date', { ascending: false });

    if (error) throw error;
    return data as ClientMediaSubmission[];
  }

  static async updateSubmissionStatus(submissionId: string, status: string) {
    const { error } = await supabase
      .from('client_media_submissions')
      .update({ status })
      .eq('id', submissionId);

    if (error) throw error;
  }

  static async getImageUrl(imagePath: string): Promise<string> {
    const { data } = await supabase.storage
      .from('client-submissions')
      .createSignedUrl(imagePath, 3600); // 1 hour expiry

    return data?.signedUrl || '';
  }

  static async deleteImageFromSubmission(submissionId: string, imageIndex: number) {
    // Primeiro, buscar a submissão atual
    const { data: submission, error: fetchError } = await supabase
      .from('client_media_submissions')
      .select('media_urls')
      .eq('id', submissionId)
      .single();

    if (fetchError) throw fetchError;

    const mediaUrls = submission.media_urls as any[];
    
    if (imageIndex >= 0 && imageIndex < mediaUrls.length) {
      // Deletar o arquivo do storage
      const imageToDelete = mediaUrls[imageIndex];
      const { error: storageError } = await supabase.storage
        .from('client-submissions')
        .remove([imageToDelete.url]);

      if (storageError) {
        console.warn('Erro ao deletar arquivo do storage:', storageError);
      }

      // Remover a imagem do array
      const updatedMediaUrls = mediaUrls.filter((_, index) => index !== imageIndex);

      // Atualizar a submissão no banco
      const { error: updateError } = await supabase
        .from('client_media_submissions')
        .update({ media_urls: updatedMediaUrls })
        .eq('id', submissionId);

      if (updateError) throw updateError;
    }
  }

  static async deleteEntireSubmission(submissionId: string) {
    // Primeiro, buscar a submissão atual para pegar as URLs das imagens
    const { data: submission, error: fetchError } = await supabase
      .from('client_media_submissions')
      .select('media_urls')
      .eq('id', submissionId)
      .single();

    if (fetchError) throw fetchError;

    // Deletar todos os arquivos do storage
    const mediaUrls = submission.media_urls as any[];
    const filePaths = mediaUrls.map((media) => media.url);
    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage
        .from('client-submissions')
        .remove(filePaths);

      if (storageError) {
        console.warn('Erro ao deletar arquivos do storage:', storageError);
      }
    }

    // Deletar a submissão do banco
    const { error: deleteError } = await supabase
      .from('client_media_submissions')
      .delete()
      .eq('id', submissionId);

    if (deleteError) throw deleteError;
  }
}
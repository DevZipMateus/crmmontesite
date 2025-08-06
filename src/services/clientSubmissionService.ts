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
        client_name: formData.client_name,
        client_email: formData.client_email,
        message: formData.message,
        media_urls: uploadedImages
      })
      .select()
      .single();

    if (error) throw error;
    return data as ClientMediaSubmission;
  }

  static async uploadImages(projectId: string, images: File[]) {
    const timestamp = Date.now();
    const uploadedImages: Array<{ url: string; caption?: string }> = [];

    for (let i = 0; i < images.length; i++) {
      const file = images[i];
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectId}/${timestamp}/${i + 1}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('client-submissions')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      uploadedImages.push({
        url: fileName,
        caption: file.name
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
}
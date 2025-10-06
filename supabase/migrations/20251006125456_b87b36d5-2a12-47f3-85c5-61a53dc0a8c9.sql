-- Adicionar política DELETE para client_media_submissions
CREATE POLICY "Allow authenticated users to delete client_media_submissions"
ON client_media_submissions
FOR DELETE
TO authenticated
USING (true);

-- Verificar e recriar foreign key com CASCADE para client_media_submissions
ALTER TABLE client_media_submissions 
DROP CONSTRAINT IF EXISTS client_media_submissions_project_id_fkey;

ALTER TABLE client_media_submissions 
ADD CONSTRAINT client_media_submissions_project_id_fkey 
FOREIGN KEY (project_id) 
REFERENCES projects(id) 
ON DELETE CASCADE;

-- Verificar e recriar foreign key com CASCADE para project_customizations
ALTER TABLE project_customizations 
DROP CONSTRAINT IF EXISTS project_customizations_project_id_fkey;

ALTER TABLE project_customizations 
ADD CONSTRAINT project_customizations_project_id_fkey 
FOREIGN KEY (project_id) 
REFERENCES projects(id) 
ON DELETE CASCADE;

-- Verificar e recriar foreign key com CASCADE para webhook_logs
ALTER TABLE webhook_logs 
DROP CONSTRAINT IF EXISTS webhook_logs_project_id_fkey;

ALTER TABLE webhook_logs 
ADD CONSTRAINT webhook_logs_project_id_fkey 
FOREIGN KEY (project_id) 
REFERENCES projects(id) 
ON DELETE CASCADE;
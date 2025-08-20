-- Update all projects with status "Configurando Domínio" to "Aguardando Alterações"
UPDATE projects 
SET status = 'Aguardando Alterações' 
WHERE status = 'Configurando Domínio';
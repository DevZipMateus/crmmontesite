-- Primeiro, vamos remover a constraint existente e verificar os status atuais
ALTER TABLE public.projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Agora vamos atualizar os dados sem constraint
UPDATE public.projects 
SET status = 'Aguardando Alterações' 
WHERE status = 'Configurando Domínio';

-- Criar nova constraint com todos os valores válidos
ALTER TABLE public.projects ADD CONSTRAINT projects_status_check 
CHECK (status IN (
  'Em andamento',
  'Recebido', 
  'Criando site',
  'Aguardando Alterações',
  'Site pronto'
));
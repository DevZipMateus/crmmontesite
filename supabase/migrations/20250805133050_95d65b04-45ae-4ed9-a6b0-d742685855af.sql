-- Update existing projects with client_type 'indicacao' to 'outbound'
UPDATE projects 
SET client_type = 'outbound' 
WHERE client_type = 'indicacao';
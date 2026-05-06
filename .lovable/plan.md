
## Plano: Ajustar status do Kanban

### Mudanças de status

| Status atual | Novo status |
|---|---|
| Recebido | Recebido (mantém) |
| Criando site | **Victor** |
| Aguardando Alterações | **Davi** |
| Site pronto | Site pronto (mantém) |
| *(novo)* | **Sem retorno** (ícone vermelho) |

### O que será feito

**1. Migração no banco de dados**
- Atualizar todos os projetos com status "Criando site" para "Victor"
- Atualizar todos os projetos com status "Aguardando Alterações" para "Davi"
- Atualizar a função `sync_lead_project_status` para mapear os novos nomes
- Atualizar a função `trigger_status_webhook` (se necessário)
- Atualizar o trigger `update_customization_deadline` que verifica "Site pronto"

**2. Código frontend (6 arquivos)**
- `src/lib/supabase/projectStatus.ts` — Atualizar `PROJECT_STATUS_TYPES` com os novos nomes e adicionar "Sem retorno" com cor vermelha
- `src/components/projects/list/StatusBadge.tsx` — Atualizar cores para Victor, Davi e Sem retorno
- `src/components/projects/kanban/ProjectCardComponents/StatusButton.tsx` — Atualizar ícones
- `src/components/projects/KanbanBoard.tsx` — Ajustar grid para 5 colunas
- `src/components/dashboard/StatsSection.tsx` — Atualizar filtro de "Criando site" para "Victor"
- `src/components/projeto/form-sections/SiteDetailsSection.tsx` e `ProjectFormEdit.tsx` — Atualizar opções de select

### Detalhes técnicos
- O novo status "Sem retorno" usará ícone `PhoneOff` ou `AlertCircle` com cor `bg-red-500`
- A ordem das colunas será: Recebido → Victor → Davi → Sem retorno → Site pronto

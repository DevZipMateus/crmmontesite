
# Plano de Redesign — CRM MonteSite

Baseado nos 11 mockups recebidos (Design System + 10 telas), este plano cobre a implementação completa do novo visual.

---

## Fase 0 — Design System & Layout Global

**Escopo:** Tokens de cor, tipografia, sidebar persistente, top bar.

### 0.1 Atualizar tokens em `index.css` e `tailwind.config.ts`
- **Primary:** #2563EB (azul)
- **Accent:** #6366F1 (índigo)
- **Success:** #16A34A | **Warning:** #D97706 | **Danger:** #DC2626
- **Neutral:** Slate scale (#64748B base)
- **Blue scale:** 50–800 para primary
- Tipografia: Inter (já usada), com escala H1=24/700, H2=18/600, H3=16/600, Body=14/400, Small=13, Caption=12

### 0.2 Criar Sidebar persistente
- Logo MonteSite + "CRM" no topo
- Seções: WORKSPACE (Início, Projetos [badge], Leads [badge], Produção [badge], Revisões) | OPERAÇÕES (Inadimplentes removido, Formulário Avulso, Gestão de Layouts [external]) | SISTEMA (Integrações, Configurações)
- Avatar do usuário + nome/role no rodapé
- Item ativo com bg azul claro + texto azul
- Badges numéricos nos itens

### 0.3 Top Bar global
- Breadcrumb (MonteSite CRM > Página)
- Barra de busca global com atalho ⌘K
- Botões de ação contextuais (variam por página)
- Ícones de notificação e user no canto direito

### 0.4 Remover página de Inadimplentes
- Remover rota `/projetos-inadimplentes`
- Remover componentes associados
- Remover do menu/sidebar

---

## Fase 1 — Home / Dashboard (Tela 02)

- **Saudação** personalizada com alertas (termos pendentes, inadimplentes)
- **Stats cards** (5): Sites em produção, em configuração, Parceiros, Clientes finais, Inadimplentes — com mini sparkline e variação
- **Acesso rápido** (grid 4x2): Ver Projetos, Gestão de Leads, Gerar Comandos, Formulário Avulso, Inadimplentes, Etapa de Revisão, Integrações, Gestão de Layouts — cada card com ícone, contadores dinâmicos e subtexto
- **Atividade recente** (sidebar direita): lista com avatar, nome, tempo e status badge

---

## Fase 2 — Projetos Kanban (Tela 03)

- Header com toggle Kanban/Lista, botões CSV, Arquivados, Vincular Leads, + Novo projeto
- Barra de busca + filtros (Status, Responsável) como chips
- Colunas por responsável (não por status): Recebido, Victor, Davi, Sem retorno etc.
- **Cards redesenhados:**
  - Nome do cliente + badge "Form" (verde) ou "Aguard." (cinza)
  - Modelo + tipo de cliente
  - Link do lead vinculado
  - Avatar do responsável + tempo + ícones de ação (ver, editar, arquivar)
  - Borda lateral colorida por status

---

## Fase 3 — Projetos Lista (Tela 04)

- Filtros como chips removíveis (Status, Responsável, Período) + botão "+ Filtro" e "Limpar"
- Barra de seleção em lote: "X projetos selecionados" + ações (Arquivar, Vincular leads, Exportar)
- Tabela com colunas: checkbox, Cliente, Lead vinculado (link), Tipo, Modelo, Status (badge colorido), Criado, Responsável (avatar), Ações (ver, editar, comentar, mais)
- Contagem "37 projetos · mostrando 10"

---

## Fase 4 — Detalhe do Projeto (Tela 05)

- Header: nome + status badge + "Lead vinculado" link
- Subtítulo: tipo · modelo · data criação · responsável
- Tabs: Informações, Personalizações, Uploads, Envios do cliente, Atividade
- **Painel principal:**
  - Card "Dados do cliente" (empresa, CNPJ, telefone, e-mail, tipo, endereço)
  - Card "Site & integrações" (domínio, template, blaster link, ID personalização, datas)
  - Card "Comentários internos" com avatares e timestamps
- **Sidebar direita:**
  - Status & Responsável com avatar e botão "Alterar"
  - Ações: Gerar comando, Copiar link público, Marcar como inadimplente
  - Linha do tempo vertical (timeline) com eventos coloridos
  - Zona de perigo (vermelho)

---

## Fase 5 — Gestão de Leads (Tela 06)

- Toggle Cards/Tabela na top bar
- **Métricas superiores:** Total de leads, Sites prontos (%), Com vendedor (%), Atrasados, Cancelados — com barras por situação (Novo, Contato, Negociando, Fechado, Perdido)
- **Distribuição por vendedor** (sidebar): barras horizontais coloridas por vendedor
- Filtros: busca + dropdowns (vendedor, situação, faixa) + período + ícone comentários
- **Cards de lead** (grid 2 colunas):
  - Avatar com iniciais coloridas
  - Nome empresa + badge status
  - Nome contato + e-mail
  - Avatar vendedor + último contato + badges (Form preenchido, Site pronto, Sem retorno)
  - Borda lateral por alerta (amarelo = sem retorno)

---

## Fase 6 — Produção de Sites (Tela 07)

- **Stats cards** (4): Na fila, Em produção hoje, Concluídos esta semana, Tempo médio
- Tabela "Projetos recebidos para produção": Cliente, Tipo, Modelo, Responsável (avatar), Recebido em, Etapas (barras coloridas), Ações (Copiar, Gerar comando)
- **Terminal de comando** (dark): visual de CLI com output do comando gerado, botão "Copiar" e feedback "Comando copiado para a área de transferência"

---

## Fase 7 — Integrações & Webhooks (Tela 09)

- Tabs: eGestor, Make.com, Parceiros, Logs, API, Documentação — com contadores
- **Card principal** (eGestor): status "Conectado", URL do webhook, token mascarado, última sincronização, funcionalidades ativas (checklist com ícones verdes)
- **Sidebar direita:**
  - Status das integrações (eGestor, Blaster, Hostinger, Make.com, Supabase) com status badges
  - Ações rápidas: Configurar parceiro, Rotacionar token, Ver documentação
- **Eventos recentes:** log com status code colorido (200 verde, 500 vermelho), endpoint, origem e tempo

---

## Fase 8 — Formulário Avulso Wizard (Tela 10)

- **Stepper horizontal** com 4 etapas: Dados básicos, Identidade visual, Mídias, Configurações — com progresso visual (check, número ativo, pendente)
- Banner de auto-save (verde)
- Contagem de campos preenchidos por seção
- Navegação: "Voltar" + "Etapa X de 4" + "Continuar →"
- Header com "Salvar rascunho" e "Continuar →"
- Campos redesenhados: color picker inline, drag-and-drop de logo, dropdown de fontes

---

## Fase 9 — Termos de Entrega (Tela 11)

- **Stats cards** (4): Total enviados, Preenchidos (azul), Pendentes (amarelo), Vencidos (vermelho)
- Filtros: Todos, Pendentes, Preenchidos (tabs)
- Tabela: Projeto, Enviado em, Status (badge), Nota (estrela /10), Preenchido por, Ações (Copiar link, Ver)
- Empty state ilustrado: "Tudo em dia por aqui" com ícone

---

## Ordem de implementação sugerida

1. **Fase 0** — Design System + Sidebar + Top Bar + Remover Inadimplentes (base para tudo)
2. **Fase 1** — Dashboard (primeira tela visível)
3. **Fase 2 + 3** — Projetos Kanban + Lista (core do CRM)
4. **Fase 4** — Detalhe do Projeto
5. **Fase 5** — Gestão de Leads
6. **Fase 6** — Produção de Sites
7. **Fase 7** — Integrações
8. **Fase 8** — Formulário Avulso
9. **Fase 9** — Termos de Entrega

---

## Detalhes técnicos

- Todas as alterações são **frontend/apresentação** — nenhuma mudança de banco de dados ou lógica de negócio
- Componentes shadcn/ui serão customizados via variants, não substituídos
- Sidebar será um componente persistente em `PageLayout.tsx`
- Cores usarão tokens semânticos HSL via CSS variables
- Animações com framer-motion para transições de página e cards
- Responsivo: sidebar colapsa em mobile (< 768px)

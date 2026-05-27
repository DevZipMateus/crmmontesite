# Bug: card "trava" na coluna do Victor ao arrastar de Recebido para Davi

## Diagnóstico

O fluxo de drag/drop em `src/components/projects/kanban/` tem dois problemas que, combinados, fazem o card parar na coluna intermediária (Victor) em vez de ir para Davi:

1. **A identidade do alvo do drop depende apenas de `draggingId` em estado** (`useDragAndDrop.handleDrop`). Não há `dataTransfer.setData` no `dragStart`, e a coluna de destino é capturada via closure (`(e) => onDrop(e, statusType.value)`). Quando o usuário arrasta rapidamente passando sobre cards/ScrollArea de Victor, o evento `drop` pode disparar em um elemento cujo handler mais próximo é a coluna intermediária se houver re-render durante o arrasto (a effect de `projectsWithCustomizationStatus` re-executa a cada mudança em `projects` e re-ordena, recriando colunas/handlers no meio do gesto).

2. **A área "drop zone" da coluna não é estável.** O `<ScrollArea>` interno e o placeholder "Sem projetos" criam regiões filhas que recebem `dragover/drop` antes de bubblar. Se o `onDragOver` de um filho não chamar `preventDefault` consistentemente (ScrollArea Viewport do Radix não chama), o navegador pode considerar a última coluna válida como destino — frequentemente a coluna sob o cursor no momento do `dragleave`, que acaba sendo Victor pelo caminho percorrido.

Além disso, `KanbanColumn` passa `(e, statusType.value)` para `onDragOver`, mas `useDragAndDrop.handleDragOver` ignora o status — então a coluna "ativa" só é registrada no `drop`, sem feedback intermediário, dificultando depuração.

## Correção

### 1. `src/components/projects/kanban/useDragAndDrop.ts`
- No `handleDragStart`, gravar o id também em `e.dataTransfer.setData("text/plain", projectId)` e definir `effectAllowed = "move"`.
- No `handleDrop`, ler o id preferencialmente de `e.dataTransfer.getData("text/plain")` e usar `draggingId` apenas como fallback. Isso torna o destino imune a re-renders.
- Garantir `e.stopPropagation()` em `handleDrop` para não disparar handlers de pais.

### 2. `src/components/projects/kanban/KanbanColumn.tsx`
- Envolver header + lista/placeholder em um único container com `onDragOver`/`onDrop` no nível raiz da coluna e `flex-1` para ocupar toda a área visível.
- Aplicar `pointer-events-none` no `ScrollArea` filho durante drag (ou simplesmente garantir que o `div` raiz capture o evento adicionando `onDragEnter` que chama `preventDefault`).
- Adicionar destaque visual quando a coluna está sendo "hovered" durante o drag (estado `isOver`) para o usuário enxergar onde vai cair — isso também serve como verificação visual da correção.
- O placeholder "Sem projetos" e a `ScrollArea` recebem `onDragOver={(e)=>{e.preventDefault(); e.stopPropagation();}}` para que o `drop` bubble corretamente até o handler da coluna.

### 3. `src/components/projects/KanbanBoard.tsx`
- Não recriar `projectsWithCustomizationStatus` enquanto houver `draggingId` ativo (passar `draggingId` para o `useEffect` e fazer early-return). Isso evita re-render no meio do gesto.

## Verificação

- Arrastar card de Recebido para Davi (passando por Victor) — deve cair em Davi.
- Arrastar para Victor diretamente — continua funcionando.
- Arrastar para coluna vazia (placeholder "Sem projetos") — deve aceitar o drop.
- Arrastar para "Site pronto" sem domínio — modal de domínio continua abrindo.

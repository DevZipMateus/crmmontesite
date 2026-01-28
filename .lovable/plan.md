
## Plano: Permitir Atualização de Dados em Formulários Já Preenchidos

### Problema Atual
A Edge Function `receive-lead-form-data` bloqueia o reenvio quando o lead já possui um `project_id` vinculado (linhas 78-88), retornando erro 400.

### Solução
Modificar a lógica para que, quando o lead já tiver projeto vinculado, a função **atualize** os dados existentes (projeto + personalização) em vez de criar novos registros.

---

### Alterações na Edge Function

**Arquivo:** `supabase/functions/receive-lead-form-data/index.ts`

#### Fluxo Atualizado

```text
                    ┌─────────────────┐
                    │  Receber dados  │
                    │   do formulário │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Buscar lead    │
                    │  pelo form_hash │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │ Lead tem        │
                    │ project_id?     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              │ NÃO                         │ SIM
              ▼                             ▼
    ┌─────────────────┐           ┌─────────────────┐
    │ CRIAR projeto   │           │ ATUALIZAR proj. │
    │ CRIAR person.   │           │ ATUALIZAR pers. │
    │ VINCULAR lead   │           │ Manter vínculos │
    └─────────────────┘           └─────────────────┘
              │                             │
              └──────────────┬──────────────┘
                             │
                    ┌────────▼────────┐
                    │  Retornar       │
                    │  sucesso        │
                    └─────────────────┘
```

#### Código Modificado (Linhas 78-167)

Substituir a verificação que bloqueia por lógica de atualização:

```typescript
let projectId: string;
let personalizationId: string | null = null;
let isUpdate = false;

// Verificar se lead já possui projeto vinculado
if (lead.project_id) {
  console.log('Lead already has project, updating existing data:', lead.project_id);
  isUpdate = true;
  projectId = lead.project_id;

  // Atualizar projeto existente
  const { error: projectUpdateError } = await supabase
    .from('projects')
    .update({
      template: modelo || undefined,
      responsible_name: responsavelnome,
      telefone: telefone,
      email_complementar: email,
      modelo_escolhido: modelo,
      observacoes_cliente: historia_empresa || undefined,
      formulario_preenchido: true,
      data_formulario: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', lead.project_id);

  if (projectUpdateError) {
    console.error('Error updating project:', projectUpdateError);
    return new Response(
      JSON.stringify({ error: 'Erro ao atualizar projeto: ' + projectUpdateError.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  // Buscar personalization_id existente
  const { data: existingProject } = await supabase
    .from('projects')
    .select('personalization_id')
    .eq('id', lead.project_id)
    .single();

  if (existingProject?.personalization_id) {
    personalizationId = existingProject.personalization_id;
    
    // Atualizar personalização existente
    const { error: persUpdateError } = await supabase
      .from('site_personalizacoes')
      .update({
        officenome: officenome,
        responsavelnome: responsavelnome,
        email: email,
        telefone: telefone,
        endereco: endereco,
        cnpj_cpf: cnpj_cpf || '',
        visao_missao_valores: visao_missao_valores || '',
        historia_empresa: historia_empresa || '',
        mercado_atuacao: mercado_atuacao || '',
        produtos: produtos || '',
        depoimentos: depoimentos || '',
        descricao: descricao || visao_missao_valores || '',
        servicos: servicos,
        redessociais: redessociais || '',
        slogan: slogan,
        paletacores: paletacores,
        fonte: fonte,
        estilo_visual: estilo_visual,
        possuiplanos: possuiplanos || false,
        planos: planos,
        possuimapa: possuimapa || false,
        linkmapa: linkmapa,
        horario_funcionamento: horario_funcionamento,
        botaowhatsapp: botaowhatsapp !== false,
        modelo: modelo,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingProject.personalization_id);

    if (persUpdateError) {
      console.error('Error updating personalization:', persUpdateError);
    }
  } else {
    // Criar nova personalização se não existir
    // ... (código de criação existente)
  }

} else {
  // CRIAR novo projeto (código existente das linhas 90-167)
  // ...
}

// Atualizar lead com data de último contato
const { error: leadUpdateError } = await supabase
  .from('leads')
  .update({
    project_id: projectId,
    link_confidence_score: 100,
    link_method: 'form_hash',
    situacao: 'Preenchendo Formulário',
    data_ultimo_contato: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })
  .eq('id', lead.id);

// Retornar resposta com indicação de atualização
return new Response(
  JSON.stringify({ 
    success: true, 
    project_id: projectId,
    lead_id: lead.id,
    personalization_id: personalizationId,
    updated: isUpdate,
    message: isUpdate 
      ? 'Dados atualizados com sucesso!' 
      : 'Formulário processado com sucesso!' 
  }),
  { 
    status: 200, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  }
);
```

---

### Resumo das Alterações

| Cenário | Comportamento Atual | Novo Comportamento |
|---------|--------------------|--------------------|
| Lead sem projeto | Cria projeto + personalização | Mantido igual |
| Lead com projeto | Erro 400 "já preenchido" | Atualiza dados existentes |

### Benefícios

1. **Correção de erros**: Cliente pode corrigir informações enviadas anteriormente
2. **Flexibilidade**: Permite múltiplos envios sem perder dados
3. **Rastreabilidade**: Campo `updated` na resposta indica se foi criação ou atualização
4. **Timestamps**: Atualiza `data_formulario` e `updated_at` a cada submissão

---

### Seção Técnica

**Arquivo modificado:** `supabase/functions/receive-lead-form-data/index.ts`

**Principais mudanças:**
1. Remover bloco de erro (linhas 78-88)
2. Adicionar variáveis `projectId`, `personalizationId`, `isUpdate`
3. Adicionar branch de atualização com `UPDATE` em vez de `INSERT`
4. Buscar `personalization_id` do projeto existente para atualizar
5. Atualizar resposta para incluir campo `updated: boolean`

**Depois de implementar:** Executar deploy da Edge Function

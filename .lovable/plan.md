
## Pré-carregar Dados Existentes no Formulário de Lead

### Objetivo
Quando um cliente reabrir um formulário já preenchido, os dados anteriores (textos, logo e mídias) devem ser exibidos para visualização e edição.

### Arquitetura da Solução

```text
┌────────────────────────────────────┐
│    LeadFormPage.tsx                │
│  ┌─────────────────────────────┐   │
│  │ 1. Buscar lead (form_hash)  │   │
│  │ 2. Se project_id existir:   │   │
│  │    → Buscar personalization │   │
│  │    → Passar dados existentes│   │
│  └───────────────┬─────────────┘   │
│                  │                 │
│  ┌───────────────▼─────────────┐   │
│  │    PersonalizeForm.tsx      │   │
│  │  - Receber existingData     │   │
│  │  - Pré-popular campos       │   │
│  │  - Exibir imagens salvas    │   │
│  │  - Permitir substituir      │   │
│  └─────────────────────────────┘   │
└────────────────────────────────────┘
```

---

### Alterações Necessárias

#### 1. LeadFormPage.tsx
**O que muda:** Buscar dados de personalização existentes quando o lead já tem projeto vinculado.

- Após carregar o lead, verificar se `lead.project_id` existe
- Buscar o projeto e seu `personalization_id`
- Buscar dados completos de `site_personalizacoes` incluindo `logo_url`, `midia_urls`, `depoimento_urls`
- Passar os dados existentes para o `PersonalizeForm`

#### 2. PersonalizeForm.tsx
**O que muda:** Aceitar dados existentes e pré-popular o formulário.

**Nova prop:**
```typescript
existingData?: {
  // Campos de texto
  officenome: string;
  email: string;
  telefone: string;
  cnpj_cpf: string;
  visao_missao_valores: string;
  historia_empresa: string;
  mercado_atuacao: string;
  endereco: string;
  horario_funcionamento: string;
  slogan: string;
  servicos: string;
  produtos: string;
  redessociais: string;
  paletacores: string;
  depoimentos: string;
  planos: string;
  possuiplanos: boolean;
  possuimapa: boolean;
  linkmapa: string;
  botaowhatsapp: boolean;
  modelo: string;
  // URLs dos arquivos salvos
  logo_url: string | null;
  midia_urls: Array<{url: string, caption: string}>;
  depoimento_urls: string[];
}
```

**Comportamento:**
- Usar `useEffect` para popular `form.reset()` com os dados existentes
- Gerar URLs assinadas para exibir arquivos salvos (logo, mídias, depoimentos)
- Exibir imagens existentes nos componentes de upload
- Permitir substituição: novo upload substitui arquivo existente
- Se usuário não fizer novo upload, manter arquivos anteriores

#### 3. Componentes de Upload (LogoUploader, MediaUploader)
**O que muda:** Exibir imagens existentes do servidor.

**LogoUploader:**
- Nova prop `existingLogoUrl?: string` para exibir logo já salva
- Se não houver novo upload, mostrar a imagem existente
- Botão "Remover" deve marcar para exclusão (não deletar imediatamente)

**MediaUploader / PersonalizeConfigForm:**
- Nova prop `existingMidias?: Array<{url: string, caption: string}>`
- Exibir mídias existentes com suas legendas
- Permitir remover individualmente ou adicionar novas
- Mesclar uploads novos com existentes na submissão

#### 4. useFormSubmission.tsx
**O que muda:** Lidar com arquivos existentes + novos.

- Receber lista de arquivos existentes que devem ser mantidos
- Na atualização, só fazer upload de arquivos **novos**
- Arquivos existentes mantêm suas URLs originais
- Arquivos marcados para exclusão são removidos

---

### Novo Hook: useExistingPersonalization

Criar hook para buscar e processar dados existentes:

```typescript
// src/hooks/useExistingPersonalization.ts
export function useExistingPersonalization(projectId: string | null) {
  // Buscar personalização do projeto
  // Gerar URLs assinadas para arquivos
  // Retornar dados formatados para o formulário
}
```

---

### Fluxo de Dados

| Etapa | Descrição |
|-------|-----------|
| 1 | LeadFormPage carrega lead via form_hash |
| 2 | Se lead.project_id existe, buscar projeto e personalização |
| 3 | Gerar URLs assinadas para logo_url, midia_urls, depoimento_urls |
| 4 | Passar existingData para PersonalizeForm |
| 5 | PersonalizeForm popula campos com form.reset() |
| 6 | Componentes de upload exibem imagens existentes |
| 7 | Usuário edita textos e/ou substitui arquivos |
| 8 | Submissão: atualiza textos + mantém/substitui arquivos |

---

### Mapeamento de Campos

| Campo no Banco | Campo no Formulário |
|----------------|---------------------|
| officenome | nome_empresa |
| email | email |
| telefone | telefone |
| cnpj_cpf | cnpj_cpf |
| visao_missao_valores | visao_missao_valores |
| historia_empresa | historia_empresa |
| mercado_atuacao | mercado_atuacao |
| endereco | endereco |
| horario_funcionamento | horario_funcionamento |
| slogan | slogan |
| servicos | servicosOferecidos |
| produtos | produtos |
| redessociais | redes_sociais |
| paletacores | cores_preferidas |
| depoimentos | depoimentos |
| planos | planos |
| possuiplanos | possuiPlanos |
| possuimapa | possuiMapa |
| linkmapa | linkMapa |
| botaowhatsapp | botaoWhatsapp |
| logo_url | logoPreview (URL assinada) |
| midia_urls | midiaPreviews (URLs assinadas) |
| depoimento_urls | depoimentoPreviews (URLs assinadas) |

---

### Seção Técnica

**Arquivos a modificar:**
1. `src/pages/LeadFormPage.tsx` - Buscar dados existentes
2. `src/components/site-personalize/PersonalizeForm.tsx` - Aceitar e popular dados
3. `src/components/site-personalize/LogoUploader.tsx` - Exibir logo existente
4. `src/components/site-personalize/PersonalizeConfigForm.tsx` - Exibir mídias existentes
5. `src/components/site-personalize/PersonalizeServicosForm.tsx` - Exibir depoimentos existentes
6. `src/components/site-personalize/useFormSubmission.tsx` - Lidar com arquivos existentes

**Novo arquivo:**
- `src/hooks/useExistingPersonalization.ts` - Hook para buscar personalização

**Dependências:**
- Usar `getSignedUrl` de `src/lib/supabase/storage.ts` para gerar URLs de arquivos
- Bucket `site_personalizacoes` para os arquivos

**Considerações:**
- URLs assinadas expiram em 1 hora - regenerar se necessário
- Bucket não é público, então sempre usar signed URLs
- Validar que arquivos existem antes de exibir (usar `checkFileExists`)

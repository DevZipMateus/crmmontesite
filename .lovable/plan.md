## Objetivo

Substituir o campo único de "Endereço" nos formulários enviados aos clientes por campos estruturados (CEP, logradouro, número, complemento, bairro, cidade, estado), persistir cada campo separadamente no banco, exibi-los individualmente nas páginas do projeto e usá-los na geração de comandos da página de Produção.

## Campos novos

- `cep` (com máscara `00000-000` e auto-preenchimento via API ViaCEP)
- `logradouro` (rua/avenida)
- `numero`
- `complemento` (opcional)
- `bairro`
- `cidade`
- `estado` (UF, select com 27 estados)

O campo antigo `endereco` continua existindo no banco e passa a ser preenchido automaticamente com a versão concatenada (`{logradouro}, {numero} {complemento} - {bairro}, {cidade}/{estado} - CEP {cep}`) para não quebrar integrações antigas (webhook, exports, comandos legados).

## Mudanças

### 1. Banco de dados (migração)
Adicionar em `public.site_personalizacoes` as colunas: `cep`, `logradouro`, `numero`, `complemento`, `bairro`, `cidade`, `estado` (todas `text nullable`). Nenhum backfill automático — registros antigos mantêm apenas o texto em `endereco`.

### 2. Formulário público do cliente
Arquivo: `src/components/site-personalize/PersonalizeBasicForm.tsx`
- Trocar o `FormField` único de `endereco` por uma seção "Endereço" com os 7 campos.
- Adicionar hook simples que, ao terminar de digitar o CEP, chama `https://viacep.com.br/ws/{cep}/json/` e preenche logradouro/bairro/cidade/estado (sem bloquear edição manual).
- Ampliar `FormValues` com os novos campos.
- Manter validação: CEP, logradouro, número, bairro, cidade, estado obrigatórios; complemento opcional.

### 3. Envio ao backend
Arquivos: `src/components/site-personalize/services/directClientService.ts`, `src/components/site-personalize/services/partnerSubmissionService.ts`, `src/components/site-personalize/useFormSubmission.tsx`
- Passar cada novo campo para `site_personalizacoes.insert/update`.
- Preencher `endereco` (campo antigo) com string concatenada para compatibilidade.

### 4. Recuperação de dados existentes
Arquivo: `src/hooks/useExistingPersonalization.ts`
- Adicionar os novos campos ao tipo e ao mapeamento de reset do formulário (para reenvios pré-preencherem corretamente).

### 5. Exibição na página do projeto
Arquivos: `src/components/projeto/detail/ProjectInformation.tsx`, `src/components/projeto/detail/PersonalizationData.tsx`
- Em "Dados do cliente" (ProjectInformation), substituir o `ENDERECO: --` estático por bloco com CEP, Logradouro/Número, Complemento, Bairro, Cidade/UF vindos de `site_personalizacoes` (via join já disponível ou nova consulta).
- Em `PersonalizationData` (aba "Formulário do Cliente"), trocar a linha única por lista dos campos separados; se apenas o `endereco` legado existir, exibir o texto antigo.

### 6. Geração de comandos (Produção)
Arquivo: `src/components/producao/SiteCommandGenerator.tsx`
- Ler os novos campos e emitir no prompt cada linha separada (`CEP: ...`, `Rua: ...`, `Número: ...`, `Bairro: ...`, `Cidade/UF: ...`), mantendo fallback para o `endereco` legado quando os novos vierem vazios.

### 7. Rastreamento de edição
`edited_fields` já é preenchido dinamicamente pelo edge function de reenvio; os novos campos entram automaticamente no diff assim que forem enviados.

## Detalhes técnicos

- ViaCEP: fetch client-side, sem chave; ignorar falha silenciosamente para não travar o formulário.
- Estado: `Select` com as 27 UFs (constante local).
- Migração inclui apenas `ALTER TABLE ADD COLUMN` (sem novas policies/grants — a tabela já é acessível). Não altera `endereco` para preservar dados antigos.
- Nenhuma alteração no edge function `receive-form-data` é necessária se o formulário passar a enviar os novos campos; ele encaminha o objeto inteiro. Se você quiser, posso confirmar isso durante a implementação e ajustar caso encontre filtragem explícita.

## Fora do escopo

- Não altero webhooks/API do Blaster nesta etapa (o `endereco` concatenado continua chegando lá igual).
- Não faço backfill dos endereços antigos em campos separados (ficariam vazios até o cliente reenviar o formulário).


## Plano: Adicionar Suporte a PDF no Formulário de Envio de Mídias

### Visão Geral
Modificar o formulário `ClientSubmissionForm.tsx` para aceitar arquivos PDF além de imagens e vídeos, permitindo que clientes enviem documentos PDF organizados em pastas.

---

### Alterações no Arquivo

**Arquivo:** `src/components/client-submission/ClientSubmissionForm.tsx`

#### 1. Atualizar Imports
Adicionar o ícone `FileText` do lucide-react para representar arquivos PDF:

```typescript
import { Upload, X, DollarSign, Image as ImageIcon, Video, Plus, Folder, FolderOpen, FolderPlus, AlertCircle, FileText } from "lucide-react";
```

#### 2. Atualizar Atributo `accept` do Input (Linha 347)
Adicionar `.pdf` à lista de tipos aceitos:

```typescript
// De:
accept="image/*,video/*,.gif"

// Para:
accept="image/*,video/*,.gif,.pdf,application/pdf"
```

#### 3. Atualizar Validação de Arquivos (Linhas 50-54 e 95-98)
Modificar as funções `handleImageSelect` e `handleDrop` para aceitar PDFs:

```typescript
// Na função handleImageSelect:
const validFiles = files.filter(file => 
  allowedTypes.some(type => file.type.startsWith(type)) || 
  file.name.toLowerCase().endsWith('.gif') ||
  file.type === 'application/pdf' ||
  file.name.toLowerCase().endsWith('.pdf')
);

// Atualizar mensagem de erro:
toast({
  title: "Aviso",
  description: "Apenas imagens (JPG, PNG, GIF), vídeos (MP4) e documentos (PDF) são permitidos.",
  variant: "destructive",
});
```

#### 4. Atualizar Texto de Formatos Aceitos (Linha 365)
```typescript
// De:
<p className="text-xs text-muted-foreground mt-1">
  Formatos aceitos: PNG, JPG, JPEG, GIF, MP4
</p>

// Para:
<p className="text-xs text-muted-foreground mt-1">
  Formatos aceitos: PNG, JPG, JPEG, GIF, MP4, PDF
</p>
```

#### 5. Atualizar Preview dos Arquivos (Linhas 382-423)
Adicionar detecção de PDF e renderizar preview apropriado:

```typescript
{category.images.map((image, imageIndex) => {
  const isVideo = image.file.type.startsWith('video/');
  const isGif = image.file.name.toLowerCase().endsWith('.gif');
  const isPdf = image.file.type === 'application/pdf' || 
                image.file.name.toLowerCase().endsWith('.pdf');
  
  // Determinar tipo para exibição
  const getFileType = () => {
    if (isVideo) return 'Vídeo';
    if (isPdf) return 'PDF';
    if (isGif) return 'GIF';
    return 'Imagem';
  };

  // Ícone apropriado
  const getIcon = () => {
    if (isVideo) return <Video className="h-5 w-5 text-blue-500" />;
    if (isPdf) return <FileText className="h-5 w-5 text-red-500" />;
    return <ImageIcon className="h-5 w-5 text-green-500" />;
  };

  return (
    <div key={imageIndex} className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getIcon()}
          <span className="text-sm font-medium">
            {getFileType()} {imageIndex + 1}
          </span>
        </div>
        {/* ... botão remover ... */}
      </div>
      
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center overflow-hidden">
        {isVideo ? (
          <video src={URL.createObjectURL(image.file)} ... />
        ) : isPdf ? (
          // Preview para PDF - ícone grande com nome do arquivo
          <div className="flex flex-col items-center justify-center text-center p-4">
            <FileText className="h-16 w-16 text-red-500 mb-2" />
            <p className="text-sm font-medium text-muted-foreground truncate max-w-full">
              {image.file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              Documento PDF
            </p>
          </div>
        ) : (
          <img src={URL.createObjectURL(image.file)} ... />
        )}
      </div>
      {/* ... campos de nome, descrição, preço ... */}
    </div>
  );
})}
```

---

### Resumo Visual do Preview de PDF

```
+----------------------------------------+
|  📄 PDF 1                          [X] |
+----------------------------------------+
|                                        |
|           📄 (ícone grande)            |
|         documento.pdf                  |
|         Documento PDF                  |
|                                        |
+----------------------------------------+
|  Nome do Produto *                     |
|  [______________________________]      |
|                                        |
|  Descrição (opcional)                  |
|  [______________________________]      |
|                                        |
|  💲 Preço (opcional)                   |
|  [______________________________]      |
+----------------------------------------+
```

---

### Seção Técnica

**Arquivo modificado:** `src/components/client-submission/ClientSubmissionForm.tsx`

**Alterações:**
1. Linha 12: Adicionar `FileText` aos imports
2. Linhas 50-54: Atualizar validação em `handleImageSelect` para incluir PDF
3. Linhas 56-61: Atualizar mensagem de erro
4. Linhas 95-106: Atualizar validação em `handleDrop` para incluir PDF
5. Linha 347: Adicionar `.pdf,application/pdf` ao atributo `accept`
6. Linha 365: Atualizar texto "Formatos aceitos" para incluir PDF
7. Linhas 383-423: Adicionar lógica de detecção e preview de PDF

**Nenhuma alteração necessária no backend:** O serviço `ClientSubmissionService` já suporta qualquer tipo de arquivo, pois trabalha com objetos `File` genéricos.


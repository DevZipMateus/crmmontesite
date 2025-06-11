
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, FileText, Code, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const FormIntegration = () => {
  const { toast } = useToast();

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Código copiado!",
      description: "O código foi copiado para a área de transferência.",
    });
  };

  const routerSetupCode = `// 1. Configuração de rotas no React Router
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/:hash" element={<FormularioComHash />} />
        <Route path="/formulario/:modelo" element={<FormularioPersonalizacao />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
  );
}`;

  const hashCaptureCode = `// 2. Componente para capturar e persistir hash
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

function FormularioComHash() {
  const { hash } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (hash) {
      // Persiste a hash para uso posterior
      localStorage.setItem('projectHash', hash);
      sessionStorage.setItem('projectHash', hash);
      
      // Redireciona para seleção de modelos
      navigate('/selecionar-modelo');
    }
  }, [hash, navigate]);

  return (
    <div className="loading">
      Carregando seu formulário personalizado...
    </div>
  );
}`;

  const contextSetupCode = `// 3. Context para gerenciar hash globalmente
import { createContext, useContext, useState, useEffect } from 'react';

const ProjectContext = createContext();

export function ProjectProvider({ children }) {
  const [projectHash, setProjectHash] = useState(null);

  useEffect(() => {
    // Recupera hash do localStorage se existir
    const savedHash = localStorage.getItem('projectHash') || 
                     sessionStorage.getItem('projectHash');
    if (savedHash) {
      setProjectHash(savedHash);
    }
  }, []);

  const updateHash = (hash) => {
    setProjectHash(hash);
    localStorage.setItem('projectHash', hash);
    sessionStorage.setItem('projectHash', hash);
  };

  return (
    <ProjectContext.Provider value={{ projectHash, updateHash }}>
      {children}
    </ProjectContext.Provider>
  );
}

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within ProjectProvider');
  }
  return context;
};`;

  const formSubmissionCode = `// 4. Hook para envio do formulário
import { useState } from 'react';
import { useProject } from './ProjectContext';

export function useFormSubmission() {
  const [isLoading, setIsLoading] = useState(false);
  const { projectHash } = useProject();

  const submitForm = async (formData) => {
    if (!projectHash) {
      throw new Error('Hash do projeto não encontrada');
    }

    setIsLoading(true);

    try {
      const payload = {
        modelo: formData.modelo,
        observacoes: formData.observacoes || '',
        email: formData.email || '',
        hash: projectHash // Hash capturada da URL original
      };

      const response = await fetch(
        'https://vaabpicspdbolvutnscp.supabase.co/functions/v1/receive-form-data',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao enviar formulário');
      }

      const result = await response.json();
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  return { submitForm, isLoading };
}`;

  const formComponentCode = `// 5. Componente do formulário de personalização
import { useState } from 'react';
import { useFormSubmission } from './useFormSubmission';
import { useProject } from './ProjectContext';

function FormularioPersonalizacao() {
  const [formData, setFormData] = useState({
    modelo: '',
    observacoes: '',
    email: ''
  });
  const { submitForm, isLoading } = useFormSubmission();
  const { projectHash } = useProject();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const result = await submitForm(formData);
      
      // Sucesso - redirecionar para página de confirmação
      window.location.href = '/confirmacao';
    } catch (error) {
      alert('Erro ao enviar formulário: ' + error.message);
    }
  };

  // Verificar se hash está presente
  if (!projectHash) {
    return (
      <div className="error">
        Acesso direto não permitido. Use o link fornecido.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Personalize seu Site</h1>
      <p>Projeto: {projectHash}</p>
      
      <div>
        <label>Modelo escolhido:</label>
        <select 
          value={formData.modelo}
          onChange={(e) => setFormData({...formData, modelo: e.target.value})}
          required
        >
          <option value="">Selecione um modelo</option>
          <option value="Modelo Premium">Modelo Premium</option>
          <option value="Modelo Básico">Modelo Básico</option>
          <option value="Modelo Avançado">Modelo Avançado</option>
        </select>
      </div>

      <div>
        <label>Observações:</label>
        <textarea
          value={formData.observacoes}
          onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
          placeholder="Descreva suas preferências..."
        />
      </div>

      <div>
        <label>Email adicional:</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          placeholder="contato@empresa.com"
        />
      </div>

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Enviando...' : 'Finalizar Personalização'}
      </button>
    </form>
  );
}`;

  const validationCode = `// 6. Validação e tratamento de erros
export function validateFormData(data) {
  const errors = {};

  if (!data.modelo || data.modelo.trim() === '') {
    errors.modelo = 'Modelo é obrigatório';
  }

  if (!data.hash || data.hash.trim() === '') {
    errors.hash = 'Hash do projeto é obrigatória';
  }

  if (data.email && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(data.email)) {
    errors.email = 'Email deve ter formato válido';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Uso no componente
const handleSubmit = async (e) => {
  e.preventDefault();
  
  const validation = validateFormData({...formData, hash: projectHash});
  
  if (!validation.isValid) {
    setErrors(validation.errors);
    return;
  }

  try {
    await submitForm(formData);
  } catch (error) {
    setErrors({ submit: error.message });
  }
};`;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Integração do Formulário no Site Externo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Guia completo para implementar a captura de hash e envio de dados do formulário de personalização no site externo (montesite.com.br).
          </p>
          
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg">
            <h4 className="font-semibold text-amber-800 mb-2">Pré-requisitos</h4>
            <ul className="text-sm text-amber-700 space-y-1">
              <li>• React Router Dom configurado</li>
              <li>• Sistema de gerenciamento de estado (Context API ou Redux)</li>
              <li>• Suporte a localStorage/sessionStorage</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            1. Configuração de Rotas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Configure as rotas para capturar a hash da URL e redirecionar apropriadamente.
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Setup do React Router</h4>
              <Button variant="outline" size="sm" onClick={() => copyCode(routerSetupCode)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{routerSetupCode}</code>
              </pre>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded">
            <h4 className="font-semibold text-blue-800 mb-1">Estrutura de URLs:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <code>https://montesite.com.br/abc123</code> → Captura hash "abc123"</li>
              <li>• <code>https://montesite.com.br/selecionar-modelo</code> → Seleção de modelos</li>
              <li>• <code>https://montesite.com.br/formulario/modelo-premium</code> → Formulário</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Captura e Persistência da Hash</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Componente de Captura</h4>
              <Button variant="outline" size="sm" onClick={() => copyCode(hashCaptureCode)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{hashCaptureCode}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Gerenciamento Global de Estado</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Use Context API para gerenciar a hash globalmente e garantir que ela esteja disponível em todos os componentes.
          </p>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Context Provider</h4>
              <Button variant="outline" size="sm" onClick={() => copyCode(contextSetupCode)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{contextSetupCode}</code>
              </pre>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 p-3 rounded">
            <h4 className="font-semibold text-green-800 mb-1">Vantagens do Context:</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Hash disponível em qualquer componente</li>
              <li>• Persistência automática no navegador</li>
              <li>• Recuperação em caso de refresh da página</li>
              <li>• Gerenciamento centralizado</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>4. Hook de Envio do Formulário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">useFormSubmission Hook</h4>
              <Button variant="outline" size="sm" onClick={() => copyCode(formSubmissionCode)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{formSubmissionCode}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>5. Componente do Formulário</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Formulário Completo</h4>
              <Button variant="outline" size="sm" onClick={() => copyCode(formComponentCode)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{formComponentCode}</code>
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>6. Validação e Tratamento de Erros</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Sistema de Validação</h4>
              <Button variant="outline" size="sm" onClick={() => copyCode(validationCode)}>
                <Copy className="h-4 w-4 mr-2" />
                Copiar
              </Button>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <pre className="text-sm overflow-x-auto">
                <code>{validationCode}</code>
              </pre>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-red-50 border border-red-200 p-3 rounded">
              <h4 className="font-semibold text-red-800 mb-1">Erros Comuns:</h4>
              <ul className="text-sm text-red-700 space-y-1">
                <li>• Hash não encontrada (404)</li>
                <li>• Modelo não selecionado (400)</li>
                <li>• Email com formato inválido</li>
                <li>• Projeto já preenchido</li>
              </ul>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
              <h4 className="font-semibold text-yellow-800 mb-1">Dicas de Debug:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Verificar console do navegador</li>
                <li>• Testar hash diretamente na URL</li>
                <li>• Validar localStorage/sessionStorage</li>
                <li>• Confirmar endpoint está acessível</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Checklist de Implementação
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input type="checkbox" id="routes" className="rounded" />
              <label htmlFor="routes" className="text-sm">Configurar rotas dinâmicas (/{"{hash}"})</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="context" className="rounded" />
              <label htmlFor="context" className="text-sm">Implementar Context Provider para hash</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="persistence" className="rounded" />
              <label htmlFor="persistence" className="text-sm">Configurar persistência em localStorage</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="form" className="rounded" />
              <label htmlFor="form" className="text-sm">Criar formulário de personalização</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="submission" className="rounded" />
              <label htmlFor="submission" className="text-sm">Implementar hook de envio</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="validation" className="rounded" />
              <label htmlFor="validation" className="text-sm">Adicionar validação de dados</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="error" className="rounded" />
              <label htmlFor="error" className="text-sm">Configurar tratamento de erros</label>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="testing" className="rounded" />
              <label htmlFor="testing" className="text-sm">Testar fluxo completo</label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Building2, User, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { getLeadByFormHash } from '@/services/leadFormService';
import { Lead } from '@/types/lead';
import { PersonalizeForm } from '@/components/site-personalize/PersonalizeForm';

export default function LeadFormPage() {
  const { form_hash } = useParams<{ form_hash: string }>();
  const navigate = useNavigate();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLead = async () => {
      if (!form_hash) {
        setError('Hash do formulário não fornecido');
        setLoading(false);
        return;
      }

      try {
        const leadData = await getLeadByFormHash(form_hash);
        
        if (!leadData) {
          setError('Formulário não encontrado. Verifique o link e tente novamente.');
          setLoading(false);
          return;
        }

        // Verificar se já foi preenchido
        if (leadData.project_id) {
          setError('Este formulário já foi preenchido anteriormente.');
          setLoading(false);
          return;
        }

        setLead(leadData);
      } catch (err) {
        console.error('Error loading lead:', err);
        setError('Erro ao carregar informações do lead.');
      } finally {
        setLoading(false);
      }
    };

    loadLead();
  }, [form_hash]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Carregando formulário...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!lead) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header com informações do lead */}
      <div className="bg-gradient-to-b from-primary/10 to-background border-b">
        <div className="container max-w-4xl mx-auto px-4 py-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Formulário de Personalização</h1>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Informações do Lead</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{lead.empresa}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{lead.nome_cliente}</span>
                </div>
                {lead.vendedor && (
                  <Badge variant="secondary">
                    Vendedor: {lead.vendedor}
                  </Badge>
                )}
              </CardContent>
            </Card>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Preencha os dados abaixo para personalizar seu site. 
                Todas as informações fornecidas serão utilizadas para criar seu projeto.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>

      {/* Formulário de personalização */}
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <PersonalizeForm 
          leadFormHash={form_hash}
          leadData={{
            empresa: lead.empresa,
            nome_cliente: lead.nome_cliente,
            email: lead.email,
            cnpj: lead.cnpj,
            telefone: lead.empresa // Pode ajustar conforme necessário
          }}
        />
      </div>
    </div>
  );
}
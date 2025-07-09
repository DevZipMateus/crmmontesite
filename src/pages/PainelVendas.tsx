
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, Download, Copy } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SalesProjectTable from "@/components/projects/SalesProjectTable";
import SalesSearchInput from "@/components/projects/SalesSearchInput";
import { useProjects } from "@/hooks/use-projects";
import { PageLayout } from "@/components/layout/PageLayout";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PainelVendas() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { projects, loading } = useProjects({ statusFilter: null, searchQuery }, searchQuery);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  const handleExportData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('export-sales-data', {
        headers: {
          'Authorization': 'Bearer whk_b6cc05805dab54348f903d55f2c18133217fdb0a032c0400fb022417fc61ef12'
        }
      });

      if (error) throw error;

      toast({
        title: "Dados exportados com sucesso",
        description: `${data?.length || 0} projetos exportados`,
      });

      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `vendas_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados",
        variant: "destructive",
      });
    }
  };

  const copyWebhookUrl = () => {
    const webhookUrl = 'https://vaabpicspdbolvutnscp.supabase.co/functions/v1/export-sales-data';
    navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "URL copiada",
      description: "URL do webhook copiada para área de transferência",
    });
  };

  const webhookUrl = 'https://vaabpicspdbolvutnscp.supabase.co/functions/v1/export-sales-data';
  const egestorToken = 'whk_b6cc05805dab54348f903d55f2c18133217fdb0a032c0400fb022417fc61ef12';

  return (
    <PageLayout 
      title="Painel de Vendas"
      actions={
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" /> Exportar Dados
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Exportação de Dados - API eGestor</DialogTitle>
                <DialogDescription>
                  Configure o acesso à API para exportar dados dos projetos de vendas
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div>
                  <label className="text-sm font-medium">URL Base da API:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-sm">
                      {webhookUrl}
                    </code>
                    <Button size="sm" variant="outline" onClick={copyWebhookUrl}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Token de Autenticação:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 p-2 bg-muted rounded text-sm">
                      Bearer {egestorToken}
                    </code>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => {
                        navigator.clipboard.writeText(`Bearer ${egestorToken}`);
                        toast({ title: "Token copiado", description: "Token copiado para área de transferência" });
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-3">Endpoints Disponíveis:</h4>
                  
                  <div className="space-y-4 text-sm">
                    <div>
                      <h5 className="font-medium text-blue-800">1. Listar apenas IDs e informações básicas:</h5>
                      <code className="block p-2 bg-blue-100 rounded text-xs mt-1">
                        GET {webhookUrl}?fields=id,client_name,status,updated_at
                      </code>
                      <p className="text-blue-700 mt-1">Retorna lista leve com apenas os campos essenciais</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-blue-800">2. Buscar projeto específico por ID:</h5>
                      <code className="block p-2 bg-blue-100 rounded text-xs mt-1">
                        GET {webhookUrl}?id=PROJECT_ID
                      </code>
                      <p className="text-blue-700 mt-1">Retorna dados completos de um projeto específico</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-blue-800">3. Filtrar por status:</h5>
                      <code className="block p-2 bg-blue-100 rounded text-xs mt-1">
                        GET {webhookUrl}?status=Site pronto
                      </code>
                      <p className="text-blue-700 mt-1">Retorna apenas projetos com status específico</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-blue-800">4. Buscar atualizações desde data:</h5>
                      <code className="block p-2 bg-blue-100 rounded text-xs mt-1">
                        GET {webhookUrl}?since=2025-07-01
                      </code>
                      <p className="text-blue-700 mt-1">Retorna projetos criados/atualizados desde a data especificada</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-blue-800">5. Paginação:</h5>
                      <code className="block p-2 bg-blue-100 rounded text-xs mt-1">
                        GET {webhookUrl}?limit=20&offset=0
                      </code>
                      <p className="text-blue-700 mt-1">Controla quantos registros retornar e a partir de qual posição</p>
                    </div>
                    
                    <div>
                      <h5 className="font-medium text-blue-800">6. Todos os projetos (comportamento atual):</h5>
                      <code className="block p-2 bg-blue-100 rounded text-xs mt-1">
                        GET {webhookUrl}
                      </code>
                      <p className="text-blue-700 mt-1">Retorna todos os projetos com dados completos</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">Header obrigatório:</h4>
                  <code className="block p-2 bg-green-100 rounded text-xs">
                    Authorization: Bearer {egestorToken}
                  </code>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={handleExportData} className="flex items-center gap-2">
                    <Download className="h-4 w-4" /> Baixar JSON Completo
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button 
            onClick={handleLogout} 
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" /> Sair
          </Button>
        </div>
      }
    >
      <div className="mb-6">
        <SalesSearchInput 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Buscar por nome, email, domínio ou link..."
          className="rounded-xl shadow-sm"
        />
      </div>

      <SalesProjectTable 
        projects={projects}
        loading={loading}
      />
    </PageLayout>
  );
}

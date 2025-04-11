import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { getSupabaseClient } from "@/lib/supabase";
import { 
  FileDown, 
  Copy, 
  ArrowLeft, 
  ExternalLink, 
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Status options
const statusOptions = [
  { value: "form_sent", label: "Formulário Enviado" },
  { value: "content_organized", label: "Conteúdo Organizado" },
  { value: "in_creation", label: "Em Criação no Lovable" },
  { value: "waiting_domain", label: "Aguardando Domínio" },
  { value: "building", label: "Compilando Projeto (Build)" },
  { value: "published", label: "Publicado" },
  { value: "final_review", label: "Revisão Final" },
];

// Model options for display
const modelOptions = {
  "modelo1": "Modelo Básico",
  "modelo2": "Modelo Profissional",
  "modelo3": "Modelo Premium",
};

export default function SiteDetalhe() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast: hookToast } = useToast();
  const [siteData, setSiteData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Fetch site data
  useEffect(() => {
    const fetchSiteData = async () => {
      if (!id) return;
      
      try {
        const supabase = getSupabaseClient();
        
        // First, get the site data
        const { data, error } = await supabase
          .from("site_personalizacoes")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) throw error;
        
        setSiteData(data);
        
        // If logo exists, get the public URL
        if (data.logo_url) {
          const { data: publicUrlData } = await supabase
            .storage
            .from("site_personalizacoes")
            .createSignedUrl(data.logo_url, 3600); // 1 hour expiry
            
          if (publicUrlData) {
            setLogoUrl(publicUrlData.signedUrl);
          }
        }
      } catch (error) {
        console.error("Error fetching site data:", error);
        hookToast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar os dados do site.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchSiteData();
  }, [id, hookToast]);

  // Update site status
  const updateStatus = async (newStatus: string) => {
    if (!id || !siteData) return;
    
    setUpdatingStatus(true);
    
    try {
      const supabase = getSupabaseClient();
      
      const { error } = await supabase
        .from("site_personalizacoes")
        .update({ status: newStatus })
        .eq("id", id);
        
      if (error) throw error;
      
      setSiteData({...siteData, status: newStatus});
      toast.success("Status atualizado com sucesso!");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Erro ao atualizar o status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Copy text to clipboard
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado para a área de transferência`);
  };

  // Download logo
  const downloadLogo = () => {
    if (!logoUrl) return;
    
    const link = document.createElement("a");
    link.href = logoUrl;
    link.download = `logo-${siteData.officeNome.replace(/\s+/g, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="container py-12 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados do site...</span>
      </div>
    );
  }

  if (!siteData) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="mb-4">Site não encontrado ou ocorreu um erro ao carregar os dados.</p>
              <Button onClick={() => navigate("/producao-sites")}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 md:py-10 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate("/producao-sites")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
        
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status:</span>
          <Select
            value={siteData.status || "form_sent"}
            onValueChange={updateStatus}
            disabled={updatingStatus}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {updatingStatus && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{siteData.officeNome}</CardTitle>
              <CardDescription>{siteData.responsavelNome}</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {modelOptions[siteData.modelo as keyof typeof modelOptions] || siteData.modelo}
              </Badge>
              <Badge variant="secondary">
                {statusOptions.find(s => s.value === siteData.status)?.label || "Formulário Enviado"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Informações de Contato</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Telefone:</span>
                  <div className="flex items-center">
                    <span>{siteData.telefone}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(siteData.telefone, "Telefone")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Email:</span>
                  <div className="flex items-center">
                    <span>{siteData.email}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(siteData.email, "Email")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Endereço:</span>
                  <div className="flex items-center">
                    <span>{siteData.endereco}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(siteData.endereco, "Endereço")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                {siteData.botaoWhatsapp && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">WhatsApp:</span>
                    <Badge>Habilitado</Badge>
                  </div>
                )}
              </div>
            </div>

            <div>
              {logoUrl ? (
                <div className="flex flex-col items-center">
                  <div className="w-48 h-48 border rounded-md overflow-hidden mb-2">
                    <img 
                      src={logoUrl} 
                      alt={`Logo de ${siteData.officeNome}`} 
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={downloadLogo}
                  >
                    <FileDown className="mr-2 h-4 w-4" />
                    Baixar Logo
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center h-48 border rounded-md bg-muted">
                  <p className="text-sm text-muted-foreground">Logo não enviada</p>
                </div>
              )}
            </div>
          </div>

          <Separator className="my-6" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Preferências Visuais</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Fonte:</span>
                  <div className="flex items-center">
                    <span>{siteData.fonte || "Não especificada"}</span>
                    {siteData.fonte && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyToClipboard(siteData.fonte, "Fonte")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Paleta de Cores:</span>
                  <div className="flex items-center">
                    <span>{siteData.paletaCores || "Não especificada"}</span>
                    {siteData.paletaCores && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => copyToClipboard(siteData.paletaCores, "Paleta de Cores")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Modelo:</span>
                  <div className="flex items-center gap-2">
                    <span>
                      {modelOptions[siteData.modelo as keyof typeof modelOptions] || siteData.modelo}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => window.open(`/personalize-site?modelo=${siteData.modelo}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <Tabs defaultValue="conteudo">
            <TabsList>
              <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
              <TabsTrigger value="servicos">Serviços</TabsTrigger>
              {siteData.possuiPlanos && <TabsTrigger value="planos">Planos</TabsTrigger>}
              {siteData.depoimentos && <TabsTrigger value="depoimentos">Depoimentos</TabsTrigger>}
            </TabsList>
            <TabsContent value="conteudo" className="mt-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2 flex justify-between items-center">
                    Descrição do Escritório
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(siteData.descricao, "Descrição")}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
                    </Button>
                  </h3>
                  <div className="p-4 border rounded-md bg-muted/30">
                    <p className="whitespace-pre-wrap">{siteData.descricao}</p>
                  </div>
                </div>

                {siteData.slogan && (
                  <div>
                    <h3 className="font-medium mb-2 flex justify-between items-center">
                      Slogan
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(siteData.slogan, "Slogan")}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar
                      </Button>
                    </h3>
                    <div className="p-4 border rounded-md bg-muted/30">
                      <p className="whitespace-pre-wrap">{siteData.slogan}</p>
                    </div>
                  </div>
                )}

                {siteData.redesSociais && (
                  <div>
                    <h3 className="font-medium mb-2 flex justify-between items-center">
                      Redes Sociais
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(siteData.redesSociais, "Redes Sociais")}
                      >
                        <Copy className="mr-2 h-4 w-4" />
                        Copiar
                      </Button>
                    </h3>
                    <div className="p-4 border rounded-md bg-muted/30">
                      <p className="whitespace-pre-wrap">{siteData.redesSociais}</p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            <TabsContent value="servicos" className="mt-4">
              <div>
                <h3 className="font-medium mb-2 flex justify-between items-center">
                  Serviços a Destacar
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => copyToClipboard(siteData.servicos, "Serviços")}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copiar
                  </Button>
                </h3>
                <div className="p-4 border rounded-md bg-muted/30">
                  <p className="whitespace-pre-wrap">{siteData.servicos}</p>
                </div>
              </div>
            </TabsContent>
            {siteData.possuiPlanos && (
              <TabsContent value="planos" className="mt-4">
                <div>
                  <h3 className="font-medium mb-2 flex justify-between items-center">
                    Planos de Negócios
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(siteData.planos || "", "Planos")}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
                    </Button>
                  </h3>
                  <div className="p-4 border rounded-md bg-muted/30">
                    <p className="whitespace-pre-wrap">{siteData.planos || "Planos não detalhados"}</p>
                  </div>
                </div>
              </TabsContent>
            )}
            {siteData.depoimentos && (
              <TabsContent value="depoimentos" className="mt-4">
                <div>
                  <h3 className="font-medium mb-2 flex justify-between items-center">
                    Depoimentos de Clientes
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => copyToClipboard(siteData.depoimentos, "Depoimentos")}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copiar
                    </Button>
                  </h3>
                  <div className="p-4 border rounded-md bg-muted/30">
                    <p className="whitespace-pre-wrap">{siteData.depoimentos}</p>
                  </div>
                </div>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}


import { useNavigate, useParams } from "react-router-dom";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, ExternalLink, FileIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";

export default function SiteDetalhe() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Fetch site personalization data
  const { data: personalization, isLoading } = useQuery({
    queryKey: ["site-personalizacao", id],
    queryFn: async () => {
      // Try to get personalization directly by ID first
      const { data: directData, error: directError } = await supabase
        .from('site_personalizacoes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!directError && directData) {
        return directData;
      }
      
      // If not found directly, try to find via project
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select('personalization_id, blaster_link')
        .eq('id', id)
        .single();
      
      if (projectError) {
        console.error("Erro ao buscar projeto:", projectError);
        return null;
      }
      
      // First check for personalization_id
      if (project?.personalization_id) {
        const { data, error } = await supabase
          .from('site_personalizacoes')
          .select('*')
          .eq('id', project.personalization_id)
          .single();
        
        if (!error) {
          return data;
        }
      }
      
      // Backward compatibility: check blaster_link if personalization_id is not available
      if (project?.blaster_link?.startsWith('personalization:')) {
        const personalizationId = project.blaster_link.replace('personalization:', '');
        
        const { data, error } = await supabase
          .from('site_personalizacoes')
          .select('*')
          .eq('id', personalizationId)
          .single();
        
        if (error) {
          console.error("Erro ao buscar personalização:", error);
          return null;
        }
        
        return data;
      }
      
      return null;
    },
    enabled: !!id,
  });

  // Function to get a public URL for a file in storage
  const getFileUrl = async (filePath: string) => {
    if (!filePath) return null;
    
    const { data, error } = await supabase
      .storage
      .from('site_personalizacoes')
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiration
    
    if (error) {
      console.error("Erro ao gerar URL para arquivo:", error);
      return null;
    }
    
    return data.signedUrl;
  };

  const handleProjectDeleted = () => {
    navigate('/projetos');
  };

  if (isLoading) {
    return (
      <PageLayout title="Carregando informações do site...">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
        </div>
      </PageLayout>
    );
  }

  if (!personalization) {
    return (
      <PageLayout title="Detalhes do Site">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="flex items-center gap-2 text-gray-500"
            onClick={() => navigate('/projetos')}
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Lista de Projetos
          </Button>
        </div>
        
        <div className="bg-white border border-gray-100 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">Informações do Site</h2>
          </div>
          <p className="text-gray-500">Nenhuma informação de personalização encontrada para este site.</p>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout 
      title={`Site: ${personalization.officenome}`}
      actions={
        <>
          <Button 
            variant="outline" 
            onClick={() => navigate(`/projeto/${id}/editar`)}
            className="flex items-center gap-2 shadow-sm"
          >
            <Edit className="h-4 w-4" /> Editar
          </Button>
          <DeleteProjectDialog 
            projectId={id as string}
            projectName={personalization.officenome}
            onDelete={handleProjectDeleted}
            variant="button"
            size="default"
          />
        </>
      }
    >
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="flex items-center gap-2 text-gray-500"
          onClick={() => navigate('/projetos')}
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Lista de Projetos
        </Button>
      </div>
      
      <div className="grid gap-6">
        {/* Basic Information Card */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Detalhes do Cliente</h3>
                  <div className="mt-2 space-y-2">
                    <p><span className="font-medium">Nome da Empresa:</span> {personalization.officenome}</p>
                    <p><span className="font-medium">Responsável:</span> {personalization.responsavelnome}</p>
                    <p><span className="font-medium">Telefone:</span> {personalization.telefone}</p>
                    <p><span className="font-medium">Email:</span> {personalization.email}</p>
                    <p><span className="font-medium">Endereço:</span> {personalization.endereco}</p>
                  </div>
                </div>
                
                {personalization.redessociais && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Redes Sociais</h3>
                    <p className="mt-2 whitespace-pre-line">{personalization.redessociais}</p>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Identidade Visual</h3>
                  <div className="mt-2 space-y-2">
                    {personalization.fonte && (
                      <p><span className="font-medium">Fonte:</span> {personalization.fonte}</p>
                    )}
                    {personalization.paletacores && (
                      <p><span className="font-medium">Paleta de cores:</span> {personalization.paletacores}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Descrição</h3>
                  <p className="mt-2">{personalization.descricao}</p>
                </div>
                
                {personalization.slogan && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Slogan</h3>
                    <p className="mt-2">{personalization.slogan}</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Card */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle>Conteúdo do Site</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Serviços</h3>
              <p className="whitespace-pre-line">{personalization.servicos}</p>
            </div>
            
            {personalization.possuiplanos && personalization.planos && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Planos</h3>
                <p className="whitespace-pre-line">{personalization.planos}</p>
              </div>
            )}
            
            {personalization.depoimentos && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Depoimentos</h3>
                <p className="whitespace-pre-line">{personalization.depoimentos}</p>
              </div>
            )}

            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Configurações Adicionais</h3>
              <div className="space-y-2">
                <p><span className="font-medium">Botão WhatsApp:</span> {personalization.botaowhatsapp ? 'Sim' : 'Não'}</p>
                <p><span className="font-medium">Possui mapa:</span> {personalization.possuimapa ? 'Sim' : 'Não'}</p>
                {personalization.possuimapa && personalization.linkmapa && (
                  <p>
                    <span className="font-medium">Link do mapa:</span>{' '}
                    <a 
                      href={personalization.linkmapa} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline flex items-center gap-1"
                    >
                      Ver mapa <ExternalLink className="h-3 w-3" />
                    </a>
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media Files Card */}
        <Card className="border-gray-100 shadow-sm">
          <CardHeader className="bg-gray-50/50 border-b border-gray-100">
            <CardTitle>Arquivos Enviados</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Section */}
              {personalization.logo_url && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Logo</h3>
                  <MediaFileDisplay 
                    filePath={personalization.logo_url} 
                    type="logo" 
                    getFileUrl={getFileUrl}
                  />
                </div>
              )}

              {/* Depoimento Files Section */}
              {personalization.depoimento_urls && personalization.depoimento_urls.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-500">Arquivos de Depoimentos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {personalization.depoimento_urls.map((filePath: string, index: number) => (
                      <MediaFileDisplay 
                        key={index} 
                        filePath={filePath} 
                        type="depoimento" 
                        index={index} 
                        getFileUrl={getFileUrl}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Midia Files Section */}
            {personalization.midia_urls && personalization.midia_urls.length > 0 && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Mídias</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {personalization.midia_urls.map((media: any, index: number) => (
                    <MediaFileDisplay 
                      key={index} 
                      filePath={media.url} 
                      caption={media.caption} 
                      type="midia" 
                      index={index}
                      getFileUrl={getFileUrl}
                    />
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}

// Media file display component
interface MediaFileDisplayProps {
  filePath: string;
  type: 'logo' | 'midia' | 'depoimento';
  caption?: string;
  index?: number;
  getFileUrl: (path: string) => Promise<string | null>;
}

function MediaFileDisplay({ filePath, type, caption, index, getFileUrl }: MediaFileDisplayProps) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  // Get the file URL on component mount
  useState(() => {
    const fetchUrl = async () => {
      try {
        setIsLoading(true);
        const url = await getFileUrl(filePath);
        setFileUrl(url);
      } catch (err) {
        console.error("Error fetching file URL:", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUrl();
  });

  // Check if file is an image
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filePath);
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center bg-gray-100 rounded-md p-4 h-32">
        <div className="animate-spin h-6 w-6 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (isError || !fileUrl) {
    return (
      <div className="flex flex-col justify-center items-center bg-gray-100 rounded-md p-4 h-32">
        <FileIcon className="h-8 w-8 text-gray-400" />
        <p className="text-sm text-gray-500 mt-2">Erro ao carregar arquivo</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <a 
        href={fileUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="group"
      >
        {isImage ? (
          <div className="relative overflow-hidden bg-gray-100 rounded-md aspect-square">
            <img 
              src={fileUrl} 
              alt={caption || `${type} ${index || 0}`} 
              className="w-full h-full object-cover transition-transform group-hover:scale-105" 
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity flex items-center justify-center">
              <ExternalLink className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center items-center bg-gray-100 rounded-md p-4 h-32 group-hover:bg-gray-200">
            <FileIcon className="h-8 w-8 text-gray-400" />
          </div>
        )}
      </a>
      {caption && <p className="text-sm text-gray-500 mt-1 truncate">{caption}</p>}
      {!caption && <p className="text-xs text-gray-400 mt-1">{type} {(index !== undefined) ? index + 1 : ''}</p>}
    </div>
  );
}

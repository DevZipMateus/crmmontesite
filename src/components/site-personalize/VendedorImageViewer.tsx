import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Image, Download, Eye, Loader2 } from "lucide-react";
import { getSignedUrl } from "@/lib/supabase/storage";
import { useToast } from "@/hooks/use-toast";

interface VendedorImageViewerProps {
  imageUrl: string;
  vendedorName: string;
}

export const VendedorImageViewer: React.FC<VendedorImageViewerProps> = ({
  imageUrl,
  vendedorName
}) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const { toast } = useToast();

  const loadImage = async () => {
    if (signedUrl || loading) return;
    
    setLoading(true);
    setError(false);
    
    try {
      const url = await getSignedUrl(imageUrl, 'vendedor-fotos');
      if (url) {
        setSignedUrl(url);
      } else {
        setError(true);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a imagem.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Error loading image:', err);
      setError(true);
      toast({
        title: "Erro",
        description: "Erro ao carregar a imagem.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = async () => {
    if (!signedUrl) await loadImage();
    
    if (signedUrl) {
      try {
        const response = await fetch(signedUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `foto-${vendedorName.replace(/\s+/g, '-').toLowerCase()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast({
          title: "Download concluído",
          description: "Foto baixada com sucesso.",
        });
      } catch (err) {
        console.error('Error downloading image:', err);
        toast({
          title: "Erro",
          description: "Erro ao baixar a imagem.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Dialog onOpenChange={(open) => open && loadImage()}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Ver Foto
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Foto Profissional - {vendedorName}</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center space-y-4">
            {loading && (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Carregando imagem...</span>
              </div>
            )}
            
            {error && (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                <Image className="h-12 w-12 mb-2" />
                <p>Erro ao carregar a imagem</p>
              </div>
            )}
            
            {signedUrl && !loading && !error && (
              <>
                <img 
                  src={signedUrl} 
                  alt={`Foto de ${vendedorName}`}
                  className="max-w-full max-h-96 object-contain rounded-lg"
                />
                <Button onClick={downloadImage} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar Foto
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <Button variant="outline" size="sm" onClick={downloadImage}>
        <Download className="h-4 w-4 mr-2" />
        Baixar
      </Button>
    </div>
  );
};
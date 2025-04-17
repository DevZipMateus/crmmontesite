import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/lib/supabase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import PersonalizeForm from "@/components/site-personalize/PersonalizeForm";
import { FormValues } from "@/components/site-personalize/PersonalizeBasicForm";
import { modelosDisponiveis } from "@/components/site-personalize/modelosData";

export default function PersonalizeSite() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [depoimentoFiles, setDepoimentoFiles] = useState<File[]>([]);
  const [depoimentoPreviews, setDepoimentoPreviews] = useState<string[]>([]);
  const [midiaFiles, setMidiaFiles] = useState<File[]>([]);
  const [midiaPreviews, setMidiaPreviews] = useState<string[]>([]);
  const [modeloSelecionado, setModeloSelecionado] = useState<string | null>(null);

  const queryParams = new URLSearchParams(location.search);
  const modeloParam = queryParams.get("modelo") || "";

  useEffect(() => {
    if (modeloParam) {
      setModeloSelecionado(modeloParam);
    } else {
      toast({
        title: "Modelo não especificado",
        description: "Por favor, acesse esta página através de um link com o modelo especificado.",
        variant: "destructive",
      });
    }
  }, [modeloParam, toast]);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
    }
  };

  const handleDepoimentoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setDepoimentoFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setDepoimentoPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveDepoimento = (index: number) => {
    setDepoimentoFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });

    setDepoimentoPreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });
  };

  const handleMidiaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      setMidiaFiles((prev) => [...prev, ...newFiles]);

      const newPreviews = newFiles.map((file) => {
        if (file.type.startsWith('image/') || file.type === 'image/gif') {
          return URL.createObjectURL(file);
        }
        return file.type.startsWith('video/') ? URL.createObjectURL(file) : '';
      });
      setMidiaPreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveMidia = (index: number) => {
    setMidiaFiles((prev) => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });

    setMidiaPreviews((prev) => {
      const newPreviews = [...prev];
      URL.revokeObjectURL(newPreviews[index]);
      newPreviews.splice(index, 1);
      return newPreviews;
    });

    toast({
      description: "Mídia removida com sucesso",
    });
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);

    try {
      const supabase = getSupabaseClient();

      const formData = {
        ...data,
        modelo: modeloSelecionado || data.modelo,
        created_at: new Date().toISOString(),
      };

      let logoUrl = null;
      if (logoFile) {
        const fileName = `logos/${Date.now()}_${logoFile.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("site_personalizacoes")
          .upload(fileName, logoFile);

        if (uploadError) {
          throw new Error(`Erro ao fazer upload da logo: ${uploadError.message}`);
        }

        logoUrl = fileName;
      }

      const depoimentoUrls: string[] = [];
      for (const file of depoimentoFiles) {
        const fileName = `depoimentos/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("site_personalizacoes")
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Erro ao fazer upload de depoimento: ${uploadError.message}`);
        }

        depoimentoUrls.push(fileName);
      }

      const midiaUrls: string[] = [];
      for (const file of midiaFiles) {
        const fileName = `midias/${Date.now()}_${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("site_personalizacoes")
          .upload(fileName, file);

        if (uploadError) {
          throw new Error(`Erro ao fazer upload de mídia: ${uploadError.message}`);
        }

        midiaUrls.push(fileName);
      }

      const { data: insertData, error: insertError } = await supabase
        .from("site_personalizacoes")
        .insert([{
          officenome: formData.officeNome,
          responsavelnome: formData.responsavelNome,
          telefone: formData.telefone,
          email: formData.email,
          endereco: formData.endereco,
          redessociais: formData.redesSociais,
          fonte: formData.fonte,
          paletacores: formData.paletaCores,
          descricao: formData.descricao,
          slogan: formData.slogan,
          possuiplanos: formData.possuiPlanos,
          planos: formData.planos,
          servicos: formData.servicos,
          depoimentos: formData.depoimentos,
          botaowhatsapp: formData.botaoWhatsapp,
          possuimapa: formData.possuiMapa,
          linkmapa: formData.linkMapa,
          modelo: formData.modelo,
          logo_url: logoUrl,
          depoimento_urls: depoimentoUrls.length > 0 ? depoimentoUrls : null,
          midia_urls: midiaUrls.length > 0 ? midiaUrls : null,
          created_at: formData.created_at
        }])
        .select();

      if (insertError) {
        throw insertError;
      }

      const { data: projectData, error: projectError } = await supabase
        .from("projects")
        .insert([{
          client_name: formData.officeNome,
          responsible_name: formData.responsavelNome,
          template: formData.modelo,
          status: "Recebido",
          client_type: "cliente_final"
        }])
        .select();

      if (projectError) {
        console.error("Erro ao criar projeto automático:", projectError);
      } else {
        console.log("Projeto criado automaticamente:", projectData);
      }

      toast({
        title: "Personalização salva com sucesso!",
        description: "Suas informações foram enviadas e um projeto foi criado.",
      });

      navigate("/confirmacao");
    } catch (error) {
      console.error("Erro ao salvar personalização:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao enviar o formulário. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const modeloDetails = modelosDisponiveis.find(m => m.id === modeloSelecionado);

  return (
    <div className="container py-6 md:py-10 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl md:text-3xl font-bold">Personalize Seu Site</CardTitle>
          <CardDescription>
            {!modeloSelecionado 
              ? "Por favor, acesse esta página através de um link com o modelo especificado."
              : `Preencha o formulário abaixo com as informações do seu escritório contábil para personalizar seu site no modelo ${modeloSelecionado}.`}
          </CardDescription>
          {modeloDetails && (
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mt-2">
              <h3 className="font-medium text-blue-700">Modelo selecionado: {modeloDetails.name}</h3>
              <p className="text-sm text-blue-600 mt-1">{modeloDetails.description}</p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {modeloSelecionado ? (
            <PersonalizeForm
              modeloSelecionado={modeloSelecionado}
              logoPreview={logoPreview}
              depoimentoPreviews={depoimentoPreviews}
              midiaPreviews={midiaPreviews}
              isSubmitting={isSubmitting}
              handleLogoUpload={handleLogoUpload}
              handleDepoimentoUpload={handleDepoimentoUpload}
              handleRemoveDepoimento={handleRemoveDepoimento}
              handleMidiaUpload={handleMidiaUpload}
              handleRemoveMidia={handleRemoveMidia}
              onSubmit={onSubmit}
            />
          ) : (
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                É necessário especificar um modelo através da URL para continuar.
              </p>
              <p className="text-sm mt-2 text-muted-foreground">
                Exemplo: /personalize-site?modelo=Modelo%201
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

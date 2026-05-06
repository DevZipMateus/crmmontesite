
import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PersonalizeForm } from "@/components/site-personalize/PersonalizeForm";
import { useFileUploadHandlers } from "@/components/site-personalize/FileUploadHandlers";
import { useFormSubmission } from "@/components/site-personalize/useFormSubmission";

export default function PersonalizeSite() {
  const params = useParams();
  
  // File state management
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFileName, setLogoFileName] = useState<string | null>(null);
  const [depoimentoFiles, setDepoimentoFiles] = useState<File[]>([]);
  const [depoimentoPreviews, setDepoimentoPreviews] = useState<string[]>([]);
  const [midiaFiles, setMidiaFiles] = useState<File[]>([]);
  const [midiaPreviews, setMidiaPreviews] = useState<string[]>([]);
  const [midiaCaptions, setMidiaCaptions] = useState<string[]>([]);

  const modeloSelecionado = params.modelo || "Modelo 1";

  // Initialize file upload handlers
  const fileHandlers = useFileUploadHandlers({
    setLogoFile,
    setLogoPreview,
    setLogoFileName,
    setDepoimentoFiles,
    setDepoimentoPreviews,
    setMidiaFiles,
    setMidiaPreviews,
    setMidiaCaptions
  });

  // Initialize form submission handler
  const { onSubmit, isSubmitting } = useFormSubmission({
    logoFile,
    depoimentoFiles,
    midiaFiles,
    midiaCaptions
  });

  return (
    <div className="container py-6 md:py-10 max-w-4xl mx-auto">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl md:text-3xl font-bold">Formulário de Cliente Avulso</CardTitle>
          <CardDescription>
            Preencha o formulário abaixo com as informações da sua empresa/escritório para personalizar seu site.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PersonalizeForm
            modeloSelecionado={modeloSelecionado}
          />
        </CardContent>
      </Card>
    </div>
  );
}

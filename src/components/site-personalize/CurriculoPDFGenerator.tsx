import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SalesLandingPage } from "@/types/salesLandingPage";
import { getSignedUrl } from "@/lib/supabase/storage";
import jsPDF from "jspdf";

interface CurriculoPDFGeneratorProps {
  vendedor: SalesLandingPage;
}

export const CurriculoPDFGenerator: React.FC<CurriculoPDFGeneratorProps> = ({
  vendedor
}) => {
  const { toast } = useToast();

  const loadImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
    try {
      const signedUrl = await getSignedUrl(imageUrl, 'vendedor-fotos');
      if (!signedUrl) return null;

      const response = await fetch(signedUrl);
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error loading image:', error);
      return null;
    }
  };

  const generatePDF = async () => {
    try {
      // Carregar foto se disponível
      let fotoBase64: string | null = null;
      if (vendedor.foto_profissional_url) {
        toast({
          title: "Carregando foto...",
          description: "Preparando currículo com foto.",
        });
        fotoBase64 = await loadImageAsBase64(vendedor.foto_profissional_url);
      }

      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.width;
      const margin = 20;
      const lineHeight = 7;
      let currentY = 30;

      // Configurar fonte
      pdf.setFont("helvetica");

      // Adicionar foto se disponível
      if (fotoBase64) {
        try {
          const imgWidth = 30;
          const imgHeight = 30;
          const imgX = pageWidth - margin - imgWidth;
          const imgY = 20;
          
          pdf.addImage(fotoBase64, 'JPEG', imgX, imgY, imgWidth, imgHeight);
        } catch (imgError) {
          console.error('Error adding image to PDF:', imgError);
        }
      }

      // Título do documento
      pdf.setFontSize(20);
      pdf.setTextColor(51, 51, 51);
      pdf.text("CURRÍCULO PROFISSIONAL", pageWidth / 2, currentY, { align: "center" });
      currentY += 20;

      // Nome
      pdf.setFontSize(16);
      pdf.setTextColor(33, 150, 243);
      pdf.text(vendedor.nome_completo, pageWidth / 2, currentY, { align: "center" });
      currentY += 15;

      // Cargo
      if (vendedor.cargo) {
        pdf.setFontSize(12);
        pdf.setTextColor(100, 100, 100);
        pdf.text(vendedor.cargo, pageWidth / 2, currentY, { align: "center" });
        currentY += 10;
      }

      // Área de atuação
      pdf.setFontSize(11);
      pdf.text(vendedor.area_atuacao, pageWidth / 2, currentY, { align: "center" });
      currentY += 15;

      // Linha divisória
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 15;

      // Dados de Contato
      pdf.setFontSize(14);
      pdf.setTextColor(51, 51, 51);
      pdf.text("CONTATO", margin, currentY);
      currentY += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      pdf.text(`Email: ${vendedor.email_profissional}`, margin, currentY);
      currentY += lineHeight;
      pdf.text(`Telefone/WhatsApp: ${vendedor.telefone_whatsapp}`, margin, currentY);
      currentY += lineHeight;
      
      if (vendedor.cidade_regiao) {
        pdf.text(`Região: ${vendedor.cidade_regiao}`, margin, currentY);
        currentY += lineHeight;
      }
      currentY += 10;

      // Perfil Profissional
      pdf.setFontSize(14);
      pdf.setTextColor(51, 51, 51);
      pdf.text("PERFIL PROFISSIONAL", margin, currentY);
      currentY += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      const bioLines = pdf.splitTextToSize(vendedor.mini_bio, pageWidth - 2 * margin);
      pdf.text(bioLines, margin, currentY);
      currentY += bioLines.length * lineHeight + 10;

      // Slogan
      if (vendedor.slogan) {
        pdf.setFontSize(11);
        pdf.setTextColor(33, 150, 243);
        pdf.text(`"${vendedor.slogan}"`, pageWidth / 2, currentY, { align: "center" });
        currentY += 15;
      }

      // Formação e Certificações
      if (vendedor.formacao_certificacoes) {
        pdf.setFontSize(14);
        pdf.setTextColor(51, 51, 51);
        pdf.text("FORMAÇÃO E CERTIFICAÇÕES", margin, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        pdf.setTextColor(80, 80, 80);
        const formacaoLines = pdf.splitTextToSize(vendedor.formacao_certificacoes, pageWidth - 2 * margin);
        pdf.text(formacaoLines, margin, currentY);
        currentY += formacaoLines.length * lineHeight + 10;
      }

      // Principais Serviços
      pdf.setFontSize(14);
      pdf.setTextColor(51, 51, 51);
      pdf.text("PRINCIPAIS SERVIÇOS", margin, currentY);
      currentY += 10;

      pdf.setFontSize(10);
      pdf.setTextColor(80, 80, 80);
      const servicosLines = pdf.splitTextToSize(vendedor.principais_servicos, pageWidth - 2 * margin);
      pdf.text(servicosLines, margin, currentY);
      currentY += servicosLines.length * lineHeight + 10;

      // Diferenciais
      if (vendedor.diferenciais) {
        pdf.setFontSize(14);
        pdf.setTextColor(51, 51, 51);
        pdf.text("DIFERENCIAIS", margin, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        pdf.setTextColor(80, 80, 80);
        const diferenciaisLines = pdf.splitTextToSize(vendedor.diferenciais, pageWidth - 2 * margin);
        pdf.text(diferenciaisLines, margin, currentY);
        currentY += diferenciaisLines.length * lineHeight + 10;
      }

      // Redes Sociais
      if (vendedor.redes_sociais) {
        pdf.setFontSize(14);
        pdf.setTextColor(51, 51, 51);
        pdf.text("REDES SOCIAIS", margin, currentY);
        currentY += 10;

        pdf.setFontSize(10);
        pdf.setTextColor(80, 80, 80);
        const redesLines = pdf.splitTextToSize(vendedor.redes_sociais, pageWidth - 2 * margin);
        pdf.text(redesLines, margin, currentY);
        currentY += redesLines.length * lineHeight + 10;
      }

      // Rodapé
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(
        `Documento gerado em ${new Date().toLocaleDateString('pt-BR')}`,
        pageWidth / 2,
        pdf.internal.pageSize.height - 10,
        { align: "center" }
      );

      // Salvar PDF
      const fileName = `curriculo-${vendedor.nome_completo.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      pdf.save(fileName);

      toast({
        title: "PDF Gerado!",
        description: "Currículo baixado com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o currículo em PDF.",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePDF = async () => {
    try {
      await generatePDF();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      toast({
        title: "Erro",
        description: "Erro ao gerar o currículo em PDF.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleGeneratePDF} variant="outline" size="sm">
      <FileText className="h-4 w-4 mr-2" />
      Baixar Currículo PDF
    </Button>
  );
};
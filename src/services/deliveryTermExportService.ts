import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ProjectWithTermStatus } from '@/types/deliveryTerm';

export const exportDeliveryTermToPDF = (project: ProjectWithTermStatus) => {
  if (!project.delivery_term) {
    throw new Error('Este projeto não possui termo de entrega preenchido.');
  }

  const term = project.delivery_term;
  const doc = new jsPDF();
  
  let yPos = 20;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  const addText = (text: string, x: number, fontSize = 10, isBold = false) => {
    if (yPos > pageHeight - margin) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    
    const maxWidth = pageWidth - (margin * 2);
    const lines = doc.splitTextToSize(text, maxWidth);
    
    lines.forEach((line: string) => {
      if (yPos > pageHeight - margin) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(line, x, yPos);
      yPos += lineHeight;
    });
  };

  const addCenteredText = (text: string, fontSize = 10, isBold = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(fontSize);
    const textWidth = doc.getTextWidth(text);
    doc.text(text, (pageWidth - textWidth) / 2, yPos);
    yPos += lineHeight;
  };

  const addSection = (title: string) => {
    yPos += 5;
    addText(title, margin, 12, true);
    yPos += 3;
  };

  const addDivider = () => {
    yPos += 3;
    doc.setDrawColor(200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 6;
  };

  // Header
  doc.setFillColor(37, 99, 235); // blue-600
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMO DE ACEITE E ENTREGA', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('DEFINITIVA DE WEBSITE', pageWidth / 2, 30, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  yPos = 55;

  // Informações do Projeto
  addSection('INFORMAÇÕES DO PROJETO');
  
  addText(`Cliente: ${project.client_name}`, margin);
  if (project.domain) {
    addText(`Domínio: ${project.domain}`, margin);
  }
  addText(`Data do Aceite: ${format(new Date(term.data_aceite), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}`, margin);

  addDivider();

  // Pesquisa de Satisfação
  addSection('PESQUISA DE SATISFAÇÃO');
  
  addText(`Nota de Atendimento: ${term.nota_atendimento}/10`, margin, 11, true);
  
  // Visual stars representation
  yPos += 2;
  const starFilled = '★';
  const starEmpty = '☆';
  let starsText = '';
  for (let i = 0; i < 10; i++) {
    starsText += i < term.nota_atendimento ? starFilled : starEmpty;
  }
  doc.setFontSize(14);
  doc.text(starsText, margin, yPos);
  yPos += lineHeight + 3;

  if (term.comentarios) {
    addText('Comentários:', margin, 10, true);
    addText(term.comentarios, margin);
  }

  addDivider();

  // Dados de Identificação
  addSection('DADOS DE IDENTIFICAÇÃO DO CLIENTE');
  
  addText(`Nome Completo: ${term.nome_completo}`, margin);
  addText(`CPF: ${term.cpf}`, margin);
  if (term.ip_address) {
    addText(`IP de Origem: ${term.ip_address}`, margin);
  }

  addDivider();

  // Condições de Entrega
  addSection('CONDIÇÕES DE ENTREGA E SUPORTE');

  const conditions = [
    '• Início da Vigência: O prazo de suporte inicia-se imediatamente após o preenchimento deste termo.',
    '• Período de Ajustes Gratuitos: 30 (trinta) dias corridos de garantia para solicitar correções ou pequenos ajustes.',
    '• Limite de Envios: Dentro do período de 30 dias, o cliente tem direito a enviar 02 (dois) e-mails com listas de alterações.',
    '• Recomendação: Juntar todas as alterações necessárias e enviar de uma única vez para aproveitar melhor a cota.',
    '• Canal Oficial: Todas as solicitações devem ser encaminhadas exclusivamente para o e-mail: sites@zipline.com.br.',
  ];

  conditions.forEach(condition => {
    addText(condition, margin);
  });

  yPos += 3;
  doc.setTextColor(180, 83, 9); // amber-700
  addText('⚠️ Cobranças Adicionais: Caso o prazo de 30 dias expire OU o limite de 2 e-mails seja atingido (o que ocorrer primeiro), qualquer nova solicitação de alteração terá uma taxa de serviço de R$ 100,00 (cem reais) por e-mail/solicitação enviada.', margin);
  doc.setTextColor(0, 0, 0);

  addDivider();

  // Declaração
  addSection('DECLARAÇÃO');
  
  addText(`Eu, ${term.nome_completo}, inscrito(a) no CPF sob nº ${term.cpf}, declaro que recebi a versão funcional do meu site e dou aceite no projeto, concordando integralmente com as condições de entrega e suporte descritas acima.`, margin);

  // Signature area
  yPos += 15;
  doc.setDrawColor(0);
  doc.line(margin, yPos, margin + 80, yPos);
  yPos += 5;
  addText('Assinatura Digital', margin);
  addText(`${term.nome_completo}`, margin, 10, true);
  addText(`CPF: ${term.cpf}`, margin);

  // Footer
  yPos = pageHeight - 25;
  doc.setDrawColor(200);
  doc.line(margin, yPos - 5, pageWidth - margin, yPos - 5);
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Documento gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, margin, yPos);
  
  if (project.domain) {
    doc.text(`Site: https://${project.domain}`, margin, yPos + 5);
  }
  
  doc.text('Este documento é válido como comprovante de aceite do projeto.', margin, yPos + 10);

  // Save PDF
  const clientNameClean = project.client_name.replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `termo_entrega_${clientNameClean}_${format(new Date(term.data_aceite), 'yyyyMMdd')}.pdf`;
  doc.save(fileName);
};

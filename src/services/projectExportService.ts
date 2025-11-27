import jsPDF from 'jspdf';
import { Project } from '@/types/project';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PersonalizationData {
  officenome: string;
  responsavelnome: string;
  telefone: string;
  email: string;
  endereco: string;
  cnpj_cpf?: string;
  descricao: string;
  servicos: string;
  redessociais?: string;
  slogan?: string;
  horario_funcionamento?: string;
  visao_missao_valores?: string;
  historia_empresa?: string;
  mercado_atuacao?: string;
  produtos?: string;
  planos?: string;
  depoimentos?: string;
  possuimapa?: boolean;
  linkmapa?: string;
  botaowhatsapp?: boolean;
  modelo?: string;
  created_at?: string;
}

interface Customization {
  id: string;
  description: string;
  status: string;
  priority: string;
  requested_at: string;
  completed_at?: string;
  notes?: string;
}

export const exportProjectToPDF = async (
  project: Project,
  personalization?: PersonalizationData | null,
  customizations?: Customization[]
) => {
  const doc = new jsPDF();
  
  let yPos = 20;
  const lineHeight = 7;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;

  // Helper function to add text with automatic page break
  const addText = (text: string, x: number, fontSize = 10, isBold = false) => {
    if (yPos > pageHeight - margin) {
      doc.addPage();
      yPos = 20;
    }
    
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }
    
    doc.setFontSize(fontSize);
    
    // Split text if too long
    const maxWidth = 170;
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

  const addSection = (title: string) => {
    yPos += 5;
    addText(title, 20, 14, true);
    yPos += 2;
  };

  // Title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Relatório Completo do Projeto', 20, yPos);
  yPos += 12;

  // Project Basic Information
  addSection('1. Informações Básicas do Projeto');
  
  addText(`Nome do Cliente: ${project.client_name}`, 20, 10, true);
  addText(`Status: ${project.status || 'Não informado'}`, 20);
  addText(`Template/Modelo: ${project.template || project.modelo_escolhido || 'Não informado'}`, 20);
  addText(`Tipo de Cliente: ${project.client_type || 'Não informado'}`, 20);
  
  if (project.created_at) {
    addText(`Data de Criação: ${format(new Date(project.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20);
  }
  
  if (project.data_formulario) {
    addText(`Formulário Preenchido em: ${format(new Date(project.data_formulario), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20);
  }
  
  if (project.site_ready_date) {
    addText(`Site Pronto em: ${format(new Date(project.site_ready_date), "dd/MM/yyyy", { locale: ptBR })}`, 20);
  }
  
  if (project.customization_deadline) {
    addText(`Prazo de Customização: ${format(new Date(project.customization_deadline), "dd/MM/yyyy", { locale: ptBR })}`, 20);
  }

  // Contact Information
  yPos += 3;
  addText('Contato:', 20, 10, true);
  if (project.telefone) addText(`Telefone: ${project.telefone}`, 20);
  if (project.email_complementar) addText(`Email: ${project.email_complementar}`, 20);
  if (project.cnpj) addText(`CNPJ: ${project.cnpj}`, 20);

  // Domain and Technical Info
  if (project.domain || project.assigned_programmer) {
    yPos += 3;
    addText('Informações Técnicas:', 20, 10, true);
    if (project.domain) addText(`Domínio: ${project.domain}`, 20);
    if (project.assigned_programmer) addText(`Programador: ${project.assigned_programmer}`, 20);
  }

  // Observations
  if (project.observacoes_cliente) {
    yPos += 3;
    addText('Observações do Cliente:', 20, 10, true);
    addText(project.observacoes_cliente, 20);
  }

  // Personalization Data
  if (personalization) {
    yPos += 5;
    addSection('2. Dados de Personalização');

    addText(`Nome da Empresa: ${personalization.officenome}`, 20, 10, true);
    addText(`Responsável: ${personalization.responsavelnome}`, 20);
    addText(`Telefone: ${personalization.telefone}`, 20);
    addText(`Email: ${personalization.email}`, 20);
    
    if (personalization.endereco) {
      addText(`Endereço: ${personalization.endereco}`, 20);
    }
    
    if (personalization.cnpj_cpf) {
      addText(`CNPJ/CPF: ${personalization.cnpj_cpf}`, 20);
    }

    if (personalization.horario_funcionamento) {
      yPos += 3;
      addText('Horário de Funcionamento:', 20, 10, true);
      addText(personalization.horario_funcionamento, 20);
    }

    if (personalization.descricao) {
      yPos += 3;
      addText('Descrição:', 20, 10, true);
      addText(personalization.descricao, 20);
    }

    if (personalization.visao_missao_valores) {
      yPos += 3;
      addText('Visão, Missão e Valores:', 20, 10, true);
      addText(personalization.visao_missao_valores, 20);
    }

    if (personalization.historia_empresa) {
      yPos += 3;
      addText('História da Empresa:', 20, 10, true);
      addText(personalization.historia_empresa, 20);
    }

    if (personalization.mercado_atuacao) {
      yPos += 3;
      addText('Mercado de Atuação:', 20, 10, true);
      addText(personalization.mercado_atuacao, 20);
    }

    if (personalization.produtos) {
      yPos += 3;
      addText('Produtos:', 20, 10, true);
      addText(personalization.produtos, 20);
    }

    if (personalization.servicos) {
      yPos += 3;
      addText('Serviços:', 20, 10, true);
      addText(personalization.servicos, 20);
    }

    if (personalization.planos) {
      yPos += 3;
      addText('Planos:', 20, 10, true);
      addText(personalization.planos, 20);
    }

    if (personalization.depoimentos) {
      yPos += 3;
      addText('Depoimentos:', 20, 10, true);
      addText(personalization.depoimentos, 20);
    }

    if (personalization.slogan) {
      yPos += 3;
      addText(`Slogan: ${personalization.slogan}`, 20);
    }

    if (personalization.redessociais) {
      yPos += 3;
      addText('Redes Sociais:', 20, 10, true);
      addText(personalization.redessociais, 20);
    }

    yPos += 3;
    addText('Configurações:', 20, 10, true);
    addText(`Botão WhatsApp: ${personalization.botaowhatsapp ? 'Sim' : 'Não'}`, 20);
    addText(`Possui Mapa: ${personalization.possuimapa ? 'Sim' : 'Não'}`, 20);
    if (personalization.possuimapa && personalization.linkmapa) {
      addText(`Link do Mapa: ${personalization.linkmapa}`, 20);
    }
  }

  // Customizations
  if (customizations && customizations.length > 0) {
    yPos += 5;
    addSection('3. Customizações Solicitadas');

    customizations.forEach((customization, index) => {
      yPos += 3;
      addText(`#${index + 1} - ${customization.status.toUpperCase()}`, 20, 10, true);
      addText(`Prioridade: ${customization.priority}`, 20);
      addText(`Descrição: ${customization.description}`, 20);
      addText(`Solicitado em: ${format(new Date(customization.requested_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20);
      
      if (customization.completed_at) {
        addText(`Concluído em: ${format(new Date(customization.completed_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20);
      }
      
      if (customization.notes) {
        addText(`Notas: ${customization.notes}`, 20);
      }
    });
  }

  // Footer
  yPos = pageHeight - 15;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}`, 20, yPos);

  // Save PDF
  const fileName = `projeto_${project.client_name.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
  doc.save(fileName);
};


import React from "react";
import { Link } from "react-router-dom";
import { 
  LayoutGrid, 
  Plus, 
  Terminal,
  Link as LinkIcon,
  Settings,
  Users,
  ContactRound,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  description: string;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, href, description }) => {
  return (
    <Link
      to={href}
      className={cn(
        "flex flex-col items-center justify-center gap-2 p-4 rounded-lg bg-white border border-gray-200",
        "transition-all duration-200 hover:border-blue-400 hover:shadow-sm"
      )}
    >
      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <h3 className="font-medium text-center">{label}</h3>
      <p className="text-xs text-center text-gray-500">{description}</p>
    </Link>
  );
};

const MainMenuSection: React.FC = () => {
  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4">Menu Principal</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MenuItem 
          icon={<LayoutGrid size={24} />}
          label="Ver Projetos"
          href="/projetos"
          description="Gerenciar projetos existentes"
        />
        
        <MenuItem 
          icon={<Plus size={24} />}
          label="Criar Projetos"
          href="/criar-projetos"
          description="Criar novos projetos e personalizar sites"
        />
        
        <MenuItem 
          icon={<ContactRound size={24} />}
          label="Gestão de Leads"
          href="/leads"
          description="Acompanhar clientes potenciais pré-venda"
        />
        
        <MenuItem 
          icon={<Terminal size={24} />}
          label="Gerar Comandos"
          href="/producao-sites"
          description="Gerar comandos de produção"
        />
        
        <MenuItem 
          icon={<LinkIcon size={24} />}
          label="Modelos & URLs"
          href="/custom-urls"
          description="Gerenciar modelos e URLs para formulários"
        />
        
        <MenuItem 
          icon={<Globe size={24} />}
          label="DNS Hostinger"
          href="/hostinger-dns"
          description="Gerenciar registros DNS da Hostinger"
        />
        
        <MenuItem 
          icon={<Settings size={24} />}
          label="Configurações"
          href="/webhooks"
          description="Webhooks, APIs e parceiros"
        />
        
        <MenuItem 
          icon={<Users size={24} />}
          label="Painel de Vendas"
          href="/painel-vendas"
          description="Visualizar projetos (somente leitura)"
        />
        
        <MenuItem 
          icon={<Users size={24} />}
          label="Landing Pages Vendedores"
          href="/landing-pages-vendedores"
          description="Gerenciar formulários e gerar comandos para landing pages"
        />
      </div>
    </section>
  );
};

export default MainMenuSection;

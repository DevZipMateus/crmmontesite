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
  Globe,
  AlertCircle,
  FileCheck,
  Sheet
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  description: string;
  isExternal?: boolean;
  variant?: "default" | "green";
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, href, description, isExternal, variant = "default" }) => {
  const baseClasses = "flex flex-col items-center justify-center gap-2 p-4 rounded-lg border transition-all duration-200 hover:shadow-sm";
  
  const variantClasses = {
    default: "bg-white border-gray-200 hover:border-blue-400",
    green: "bg-emerald-50 border-emerald-200 hover:border-emerald-400"
  };
  
  const iconClasses = {
    default: "w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-blue-600",
    green: "w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"
  };

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(baseClasses, variantClasses[variant])}
      >
        <div className={iconClasses[variant]}>
          {icon}
        </div>
        <h3 className="font-medium text-center">{label}</h3>
        <p className="text-xs text-center text-gray-500">{description}</p>
      </a>
    );
  }

  return (
    <Link
      to={href}
      className={cn(baseClasses, variantClasses[variant])}
    >
      <div className={iconClasses[variant]}>
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
           icon={<Settings size={24} />}
           label="Configurações"
           href="/webhooks"
           description="Webhooks, APIs e parceiros"
         />
        
        <MenuItem 
          icon={<AlertCircle size={24} />}
          label="Projetos Inadimplentes"
          href="/projetos-inadimplentes"
          description="Gerenciar projetos com pagamentos pendentes"
        />
        
        <MenuItem 
          icon={<FileCheck size={24} />}
          label="Etapa de Revisão"
          href="/revisoes"
          description="Gerenciar etapas de revisão de websites"
        />
        
        <MenuItem 
          icon={<Sheet size={24} />}
          label="Gestão de Layouts"
          href="https://layouts-importacoes.netlify.app/"
          description="Layouts e importação via Google Sheets"
          isExternal
          variant="green"
        />
      </div>
    </section>
  );
};

export default MainMenuSection;

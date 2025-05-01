
import React from "react";
import { Link } from "react-router-dom";
import { 
  LayoutGrid, 
  PlusCircle, 
  FilePlus, 
  Presentation, 
  Link as LinkIcon 
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
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <MenuItem 
          icon={<LayoutGrid size={24} />}
          label="Ver Projetos"
          href="/projetos"
          description="Gerenciar projetos existentes"
        />
        
        <MenuItem 
          icon={<PlusCircle size={24} />}
          label="Novo Projeto"
          href="/novo-projeto"
          description="Criar um novo projeto"
        />
        
        <MenuItem 
          icon={<FilePlus size={24} />}
          label="Personalizar Site"
          href="/personalize-site"
          description="Personalizar modelos de site"
        />
        
        <MenuItem 
          icon={<Presentation size={24} />}
          label="Sites em Produção"
          href="/producao-sites"
          description="Gerenciar sites em desenvolvimento"
        />
        
        <MenuItem 
          icon={<LinkIcon size={24} />}
          label="URLs Personalizadas"
          href="/custom-urls"
          description="Gerenciar URLs para formulários"
        />
      </div>
    </section>
  );
};

export default MainMenuSection;

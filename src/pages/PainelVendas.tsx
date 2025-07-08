import { useState } from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import SalesProjectTable from "@/components/projects/SalesProjectTable";
import SalesSearchInput from "@/components/projects/SalesSearchInput";
import { useProjects } from "@/hooks/use-projects";
import { PageLayout } from "@/components/layout/PageLayout";

export default function PainelVendas() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  
  const { projects, loading } = useProjects({ statusFilter: null, searchQuery }, searchQuery);

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userType");
    navigate("/login");
  };

  return (
    <PageLayout 
      title="Painel de Vendas"
      actions={
        <Button 
          onClick={handleLogout} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <LogOut className="h-4 w-4" /> Sair
        </Button>
      }
    >
      <div className="mb-6">
        <SalesSearchInput 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Buscar por nome, email, domínio ou link..."
          className="rounded-xl shadow-sm"
        />
      </div>

      <SalesProjectTable 
        projects={projects}
        loading={loading}
      />
    </PageLayout>
  );
}

import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PartnersTable } from "@/components/partners/PartnersTable";
import { PartnerDialog } from "@/components/partners/PartnerDialog";
import { WebhookLogsCard } from "@/components/partners/WebhookLogsCard";
import { Partner } from "@/types/webhook";

export default function Parceiros() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const { data: partners, isLoading, refetch } = useQuery({
    queryKey: ['partners'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Partner[];
    }
  });

  const handleEdit = (partner: Partner) => {
    setSelectedPartner(partner);
    setIsDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedPartner(null);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedPartner(null);
    refetch();
  };

  return (
    <PageLayout 
      title="Gestão de Parceiros"
      actions={
        <Button onClick={handleNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Novo Parceiro
        </Button>
      }
    >
      <div className="space-y-6">
        <PartnersTable 
          partners={partners || []}
          loading={isLoading}
          onEdit={handleEdit}
          onRefresh={refetch}
        />
        
        <WebhookLogsCard />
        
        <PartnerDialog
          open={isDialogOpen}
          onClose={handleCloseDialog}
          partner={selectedPartner}
        />
      </div>
    </PageLayout>
  );
}

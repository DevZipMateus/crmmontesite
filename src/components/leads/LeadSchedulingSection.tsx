
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, MessageSquare } from "lucide-react";
import SchedulingForm from "./SchedulingForm";
import SchedulingList from "./SchedulingList";
import LeadNotesSection from "./LeadNotesSection";

interface LeadSchedulingSectionProps {
  leadId: string;
}

const LeadSchedulingSection: React.FC<LeadSchedulingSectionProps> = ({ leadId }) => {
  const [isAddingSchedule, setIsAddingSchedule] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar size={20} />
          Agendamentos e Anotações
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="agendamentos" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="agendamentos" className="flex items-center gap-2">
              <Calendar size={16} />
              Agendamentos
            </TabsTrigger>
            <TabsTrigger value="anotacoes" className="flex items-center gap-2">
              <MessageSquare size={16} />
              Anotações
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="agendamentos" className="space-y-4 mt-4">
            {/* Botão para adicionar agendamento */}
            {!isAddingSchedule && (
              <Button
                onClick={() => setIsAddingSchedule(true)}
                variant="outline"
                className="w-full"
              >
                <Plus size={16} className="mr-2" />
                Agendar Contato
              </Button>
            )}

            {/* Formulário para novo agendamento */}
            {isAddingSchedule && (
              <SchedulingForm
                leadId={leadId}
                onCancel={() => setIsAddingSchedule(false)}
              />
            )}

            {/* Lista de agendamentos */}
            <SchedulingList leadId={leadId} />
          </TabsContent>
          
          <TabsContent value="anotacoes" className="mt-4">
            <LeadNotesSection leadId={leadId} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default LeadSchedulingSection;

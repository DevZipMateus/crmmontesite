
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Book, 
  Code, 
  Workflow, 
  FileText, 
  AlertCircle
} from "lucide-react";
import { DocumentationDownloader } from "./DocumentationDownloader";
import { 
  ApiGuide, 
  ErrorHandling, 
  BusinessFlow, 
  FormIntegration, 
  TroubleshootingGuide 
} from "./api-documentation";

export const WebhookDocumentation = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Documentação da API</h2>
          <p className="text-muted-foreground">
            Guia completo para integração com webhooks e sistema de formulários
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="bg-green-100 text-green-700">
            Sistema Automatizado
          </Badge>
          <DocumentationDownloader />
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">
            <Workflow className="h-4 w-4 mr-2" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="api-guide">
            <Code className="h-4 w-4 mr-2" />
            Guia da API
          </TabsTrigger>
          <TabsTrigger value="forms">
            <FileText className="h-4 w-4 mr-2" />
            Formulários
          </TabsTrigger>
          <TabsTrigger value="errors">
            <AlertCircle className="h-4 w-4 mr-2" />
            Erros
          </TabsTrigger>
          <TabsTrigger value="troubleshooting">
            <Book className="h-4 w-4 mr-2" />
            Troubleshooting
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <BusinessFlow />
        </TabsContent>

        <TabsContent value="api-guide" className="space-y-4">
          <ApiGuide />
        </TabsContent>

        <TabsContent value="forms" className="space-y-4">
          <FormIntegration />
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <ErrorHandling />
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-4">
          <TroubleshootingGuide />
        </TabsContent>
      </Tabs>
    </div>
  );
};

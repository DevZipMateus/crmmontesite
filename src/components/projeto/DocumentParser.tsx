
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileUploadTab } from "@/components/projeto/FileUploadTab";
import { GoogleDocsTab } from "@/components/projeto/GoogleDocsTab";
import { DocumentContent } from "@/components/projeto/DocumentContent";

interface DocumentParserProps {
  isReading: boolean;
  isLoadingGoogleDoc: boolean;
  fileName: string;
  docContent: string;
  googleDocsLink: string;
  setGoogleDocsLink: (link: string) => void;
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleGoogleDocsImport: () => void;
  onCancel: () => void;
}

export const DocumentParser: React.FC<DocumentParserProps> = ({
  isReading,
  isLoadingGoogleDoc,
  fileName,
  docContent,
  googleDocsLink,
  setGoogleDocsLink,
  handleFileUpload,
  handleGoogleDocsImport,
  onCancel,
}) => {
  return (
    <>
      <Tabs defaultValue="file">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="file">Upload de Arquivo</TabsTrigger>
          <TabsTrigger value="gdocs">Google Docs</TabsTrigger>
        </TabsList>
        
        <TabsContent value="file">
          <FileUploadTab 
            isReading={isReading} 
            handleFileUpload={handleFileUpload} 
          />
        </TabsContent>
        
        <TabsContent value="gdocs">
          <GoogleDocsTab 
            isLoadingGoogleDoc={isLoadingGoogleDoc}
            googleDocsLink={googleDocsLink}
            setGoogleDocsLink={setGoogleDocsLink}
            handleGoogleDocsImport={handleGoogleDocsImport}
          />
        </TabsContent>
      </Tabs>
      
      {docContent && (
        <DocumentContent fileName={fileName} docContent={docContent} />
      )}
      
      {!docContent && (
        <div className="flex justify-between items-center mt-4">
          <Button
            variant="secondary"
            onClick={onCancel}
          >
            Voltar para Projetos
          </Button>
        </div>
      )}
    </>
  );
};

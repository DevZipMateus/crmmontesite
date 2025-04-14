
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Link as LinkIcon } from "lucide-react";

interface GoogleDocsTabProps {
  isLoadingGoogleDoc: boolean;
  googleDocsLink: string;
  setGoogleDocsLink: (link: string) => void;
  handleGoogleDocsImport: () => void;
}

export const GoogleDocsTab: React.FC<GoogleDocsTabProps> = ({
  isLoadingGoogleDoc,
  googleDocsLink,
  setGoogleDocsLink,
  handleGoogleDocsImport,
}) => {
  return (
    <div className="space-y-4 pt-4">
      <p className="text-muted-foreground mb-4">
        Insira o link de um documento do Google Docs para importar o conteúdo.
      </p>
      
      <div className="grid w-full items-center gap-1.5">
        <Label htmlFor="gdocsLink">Link do Google Docs</Label>
        <div className="flex items-center gap-2">
          <Input
            id="gdocsLink"
            type="url"
            placeholder="https://docs.google.com/document/d/..."
            value={googleDocsLink}
            onChange={(e) => setGoogleDocsLink(e.target.value)}
            disabled={isLoadingGoogleDoc}
            className="flex-1"
          />
          <Button 
            onClick={handleGoogleDocsImport}
            disabled={isLoadingGoogleDoc || !googleDocsLink}
            size="sm"
          >
            {isLoadingGoogleDoc ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <LinkIcon className="h-4 w-4 mr-2" />
            )}
            Importar
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          O documento deve estar configurado com permissão de acesso para visualização.
        </p>
      </div>
    </div>
  );
};

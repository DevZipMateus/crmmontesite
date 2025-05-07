
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaFileDisplay } from "./MediaFileDisplay";
import { Badge } from "@/components/ui/badge";

interface PersonalizationFilesProps {
  personalization: any;
  getFileUrl: (path: string | { url: string; caption?: string }) => Promise<string | null>;
}

export const PersonalizationFiles: React.FC<PersonalizationFilesProps> = ({ 
  personalization,
  getFileUrl
}) => {
  if (!personalization) return null;
  
  const hasLogo = !!personalization.logo_url;
  
  // Handle depoimento_urls (can be array of strings)
  const depoimentoUrls = Array.isArray(personalization.depoimento_urls) 
    ? personalization.depoimento_urls 
    : [];
  const hasDepoimentos = depoimentoUrls.length > 0;
  
  // Handle midia_urls (can be array of objects or strings)
  const midiaUrls = Array.isArray(personalization.midia_urls) 
    ? personalization.midia_urls 
    : [];
  const hasMidia = midiaUrls.length > 0;
  
  console.log("Personalização - Logo:", personalization.logo_url);
  console.log("Personalização - Depoimentos:", depoimentoUrls);
  console.log("Personalização - Mídias:", midiaUrls);
  
  if (!hasLogo && !hasDepoimentos && !hasMidia) return null;
  
  return (
    <Card className="border-gray-100 shadow-sm">
      <CardHeader className="bg-gray-50/50 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <CardTitle>Arquivos Enviados</CardTitle>
          <div className="flex items-center gap-2">
            {hasLogo && <Badge variant="outline" className="bg-blue-50">Logo</Badge>}
            {hasDepoimentos && <Badge variant="outline" className="bg-green-50">Depoimentos ({depoimentoUrls.length})</Badge>}
            {hasMidia && <Badge variant="outline" className="bg-purple-50">Mídias ({midiaUrls.length})</Badge>}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo Section */}
          {hasLogo && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Logo</h3>
              <div className="max-w-[200px]">
                <MediaFileDisplay 
                  filePath={personalization.logo_url} 
                  type="logo" 
                  getFileUrl={getFileUrl}
                />
              </div>
            </div>
          )}

          {/* Depoimento Files Section */}
          {hasDepoimentos && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500">Arquivos de Depoimentos</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {depoimentoUrls.map((filePath: string, index: number) => (
                  <MediaFileDisplay 
                    key={index} 
                    filePath={filePath} 
                    type="depoimento" 
                    index={index} 
                    getFileUrl={getFileUrl}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Midia Files Section */}
        {hasMidia && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-3">Mídias</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {midiaUrls.map((media: any, index: number) => (
                <MediaFileDisplay 
                  key={index} 
                  filePath={media} 
                  type="midia" 
                  index={index}
                  getFileUrl={getFileUrl}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ModelManagerHelp: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Como usar URLs personalizadas</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            As URLs personalizadas permitem criar links mais amigáveis e memoráveis para seus formulários.
          </li>
          <li>
            Por exemplo, em vez de usar "/formulario/modelo1", você pode usar "/formulario/contabil".
          </li>
          <li>
            A URL personalizada deve ser única para cada modelo.
          </li>
          <li>
            Se uma URL personalizada não for definida, o sistema usará automaticamente o ID do modelo.
          </li>
          <li>
            Você pode editar a URL personalizada a qualquer momento, mas os links antigos deixarão de funcionar.
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default ModelManagerHelp;

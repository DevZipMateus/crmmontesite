
import { PageLayout } from "@/components/layout/PageLayout";
import PersonalizeSite from "./PersonalizeSite";

export default function CriarProjetos() {
  return (
    <PageLayout 
      title="Formulário Avulso"
      contentClass="bg-gray-50/50"
    >
      <div className="max-w-6xl mx-auto">
        <PersonalizeSite />
      </div>
    </PageLayout>
  );
}

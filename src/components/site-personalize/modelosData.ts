
export interface ModeloItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

// Modelos disponíveis para exibição e seleção
export const modelosDisponiveis: ModeloItem[] = [
  {
    id: "Modelo 1",
    name: "Básico",
    description: "Design simples e elegante ideal para pequenos escritórios",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "Modelo 2",
    name: "Profissional",
    description: "Layout moderno com recursos avançados",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "Modelo 3",
    name: "Premium",
    description: "Design exclusivo com animações e recursos premium",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "Modelo 4",
    name: "Corporativo",
    description: "Ideal para escritórios de médio e grande porte",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "Modelo 5",
    name: "Consultoria",
    description: "Focado em serviços de consultoria empresarial",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "Modelo 6",
    name: "Especialista",
    description: "Para escritórios com foco em nichos específicos",
    imageUrl: "/placeholder.svg"
  },
];

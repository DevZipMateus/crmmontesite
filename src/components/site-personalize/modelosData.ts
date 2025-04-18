
export interface ModeloItem {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

// Modelos disponíveis para exibição e seleção
export const modelosDisponiveis: ModeloItem[] = [
  {
    id: "modelo1",
    name: "Modelo 1",
    description: "Um site moderno e responsivo, ideal para quem busca presença online com estilo e simplicidade",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "modelo2",
    name: "Modelo 2",
    description: "Design clean e objetivo, feito para apresentar suas informações de forma clara e profissional",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "modelo3",
    name: "Modelo 3",
    description: "Layout versátil que se adapta a diferentes tipos de negócio ou projeto pessoal.",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "modelo4",
    name: "Modelo 4",
    description: "Site focado em conversão e destaque visual, perfeito para quem quer impactar logo de cara.",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "modelo5",
    name: "Modelo 5",
    description: "Um modelo funcional, rápido e leve, com tudo o que você precisa para começar bem na internet.",
    imageUrl: "/placeholder.svg"
  },
  {
    id: "modelo6",
    name: "Modelo 6",
    description: "Design equilibrado entre beleza e usabilidade, pronto para ser personalizado ao seu estilo.",
    imageUrl: "/placeholder.svg"
  },
];

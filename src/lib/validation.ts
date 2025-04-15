
import { z } from "zod";

// Project schema validation
export const projectSchema = z.object({
  client_name: z.string().min(2, "Nome do cliente é obrigatório"),
  responsible_name: z.string().min(2, "Nome do responsável é obrigatório"),
  template: z.string().min(1, "Selecione um modelo"),
  status: z.string().min(1, "Selecione um status"),
  client_type: z.string().min(1, "Selecione o tipo de cliente"),
  domain: z.string().optional(),
  blaster_link: z.string().optional(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

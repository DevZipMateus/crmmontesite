
import { z } from "zod";

// Project schema validation
export const projectSchema = z.object({
  client_name: z.string().min(2, "Nome do cliente é obrigatório"),
  responsible_name: z.string().optional().nullable(),
  template: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  client_type: z.string().optional().nullable(),
  domain: z.string().optional().nullable(),
  blaster_link: z.string().optional().nullable(),
  partner_link: z.string().optional().nullable(), // Added partner_link field
  provider_credentials: z.string().optional().nullable(),
});

export type ProjectFormValues = z.infer<typeof projectSchema>;

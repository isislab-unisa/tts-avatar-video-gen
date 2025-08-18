import { z } from "zod";

export const projectSchema = z.object({
  title: z.string().min(2, { message: "Titolo troppo corto" }).max(120),
  text: z.string().min(1, { message: "Testo obbligatorio" }).max(4000),
  avatar: z.enum(["cody"], { message: "Seleziona un avatar" }),
  bgColor: z.string().optional(),
});

export type ProjectForm = z.infer<typeof projectSchema>;

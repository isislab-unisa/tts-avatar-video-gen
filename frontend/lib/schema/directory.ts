import { z } from "zod";

export const directorySchema = z.object({
  name: z
    .string()
    .min(2, { message: "Il nome deve avere almeno 2 caratteri" })
    .max(40, { message: "Massimo 40 caratteri" })
    .regex(/^[\w\s\-]+$/, {
      message: "Solo lettere, numeri, spazi e trattini",
    }),
});

export type DirectoryForm = z.infer<typeof directorySchema>;

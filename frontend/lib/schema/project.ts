import { z } from "zod";

export const getProjectRenameSchema = (t: (k: string) => string) =>
  z.object({
    title: z
      .string()
      .min(2, { message: t("titleMin") })
      .max(120, { message: t("titleMax") }),
  });

export const getCreateDirectorySchema = (t: (k: string) => string) =>
  z.object({
    name: z.string().min(2, { message: t("dirNameMin") }),
  });

export type ProjectRenameForm = z.infer<
  ReturnType<typeof getProjectRenameSchema>
>;

export type CreateDirectoryForm = z.infer<
  ReturnType<typeof getCreateDirectorySchema>
>;

export const projectSchema = z.object({
  title: z.string().min(2, { message: "Titolo troppo corto" }).max(120),
  text: z.string().min(1, { message: "Testo obbligatorio" }).max(4000),
  avatar: z.enum(["cody"], { message: "Seleziona un avatar" }),
  bgColor: z.string().optional(),
});

export type ProjectForm = z.infer<typeof projectSchema>;

// i18n-aware schema factory for project creation form (client-side)
export const getProjectCreateSchema = (t: (k: string) => string) =>
  z.object({
    title: z
      .string()
      .min(2, { message: t("titleMin") })
      .max(120, { message: t("titleMax") }),
    text: z
      .string()
      .min(1, { message: t("textRequired") })
      .max(4000),
    avatar: z.enum(["cody"], { message: t("genericError") }),
    bgColor: z.string().optional(),
  });

export type ProjectCreateForm = z.infer<
  ReturnType<typeof getProjectCreateSchema>
>;

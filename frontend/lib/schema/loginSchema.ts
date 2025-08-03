import { z } from "zod";

export const getLoginSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email({ message: t("email") }),
    password: z.string().min(8, { message: t("password") }),
    rememberMe: z.boolean().optional(),
  });

export type LoginFormValues = z.infer<ReturnType<typeof getLoginSchema>>;

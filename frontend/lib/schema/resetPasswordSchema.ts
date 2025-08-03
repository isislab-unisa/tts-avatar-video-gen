import { z } from "zod";

export const getResetPasswordSchema = (t: (key: string) => string) =>
  z
    .object({
      password: z.string().min(8, { message: t("password") }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("confirmPassword"),
      path: ["confirmPassword"],
    });

export type ResetPasswordFormValues = z.infer<
  ReturnType<typeof getResetPasswordSchema>
>;

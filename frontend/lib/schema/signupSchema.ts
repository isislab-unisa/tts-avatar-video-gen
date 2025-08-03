import { z } from "zod";

export const getSignUpSchema = (t: (key: string) => string) =>
  z
    .object({
      username: z.string().min(2, { message: t("username") }),
      email: z.string().email({ message: t("email") }),
      password: z.string().min(8, { message: t("password") }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t("confirmPassword"),
      path: ["confirmPassword"],
    });

export type SignUpFormValues = z.infer<ReturnType<typeof getSignUpSchema>>;

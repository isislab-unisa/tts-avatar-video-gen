import { z } from "zod";

export const getForgotPasswordSchema = (t: (key: string) => string) =>
  z.object({
    email: z.string().email({ message: t("email") }),
  });

export type ForgotPasswordFormValues = z.infer<
  ReturnType<typeof getForgotPasswordSchema>
>;

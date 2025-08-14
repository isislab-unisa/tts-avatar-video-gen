"use client";
import React, { useState, useEffect } from "react";
import { Mail, ArrowRight, Loader2 } from "lucide-react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { InputField } from "@/components/Auth/FormFields";
import {
  ForgotPasswordFormValues,
  getForgotPasswordSchema,
} from "@/lib/schema/forgotPasswordSchema";
import { authClient } from "@/lib/auth-client";
import { useTranslations, useLocale } from "next-intl";

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");
  const tv = useTranslations("Validation");
  const locale = useLocale();
  const [pending, setPending] = useState(false);

  const schema = getForgotPasswordSchema(tv);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    form.clearErrors();
  }, [locale, form]);

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    try {
      setPending(true);
      const { error } = await authClient.forgetPassword({
        email: data.email,
        redirectTo: "/reset-password",
      });

      if (error) {
        toast.error(t("toastError") + error.message);
      } else {
        toast.success(t("toastSuccess"));
      }
    } catch {
      toast.error(t("toastUnexpected"));
    } finally {
      setPending(false);
    }
  };

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 -translate-y-58">
        <Image
          src="/cody-forgot.png"
          alt="Robot"
          width={260}
          height={260}
          className="object-contain hidden sm:block"
          priority
        />
        <Image
          src="/cody-forgot.png"
          alt="Robot"
          width={260}
          height={260}
          className="object-contain sm:hidden"
          priority
        />
      </div>
      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 bg-card border border-border rounded-xl shadow-md space-y-6 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        <FormProvider {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 text-left"
          >
            <InputField
              control={form.control}
              name="email"
              label={t("emailLabel")}
              placeholder="email@example.com"
              type="email"
              icon={<Mail className="w-5 h-5 text-muted-foreground" />}
            />
            <Button type="submit" className="w-full" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t("sendingButton")}
                </>
              ) : (
                <>
                  {t("sendButton")} <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>
        </FormProvider>
        <p className="text-sm">
          {t("rememberPassword")}{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </main>
  );
}

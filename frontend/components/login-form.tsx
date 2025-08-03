"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getLoginSchema, LoginFormValues } from "@/lib/schema/loginSchema";
import { InputField, CheckboxField } from "@/components/Auth/FormFields";
import { GoogleAuthButton } from "@/components/Auth/GoogleAuthButton";
import { GitHubAuthButton } from "@/components/Auth/GitHubAuthButton";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

export function LoginForm() {
  const t = useTranslations("Login");
  const tv = useTranslations("Validation");
  const locale = useLocale();
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const schema = getLoginSchema(tv);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  useEffect(() => {
    form.clearErrors();
  }, [locale, form]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      setPending(true);
      await authClient.signIn.email(
        {
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe,
        },
        {
          onSuccess: () => {
            toast.success(t("toastSuccess"));
            router.push("/dashboard");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || t("toastError"));
          },
        }
      );
    } catch {
      toast.error(t("toastUnexpected"));
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="w-full max-w-[384px] lg:min-w-[384px]">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full"
        >
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>

          <InputField
            control={form.control}
            name="email"
            label="Email"
            placeholder="email@example.com"
            type="email"
            icon={<Mail className="w-5 h-5 text-muted-foreground" />}
          />

          <InputField
            control={form.control}
            name="password"
            label="Password"
            placeholder="••••••••"
            type="password"
            icon={<Lock className="w-5 h-5 text-muted-foreground" />}
            showPasswordToggle
          />

          <div className="flex items-center justify-between min-h-[24px]">
            <div className="flex-shrink-0">
              <CheckboxField
                control={form.control}
                name="rememberMe"
                label={t("rememberMe")}
              />
            </div>
            <div className="flex-shrink-0">
              <Link
                href="/forgot-password"
                className="text-sm underline underline-offset-4 hover:opacity-80 whitespace-nowrap"
              >
                {t("forgotPassword")}
              </Link>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                {t("loading")}
              </>
            ) : (
              <>
                {t("loginButton")}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 bg-background text-muted-foreground">
                {t("orContinue")}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <GoogleAuthButton
              action="login"
              redirectTo="/dashboard"
              buttonText={t("loginWithGoogle")}
            />
            <GitHubAuthButton
              action="login"
              redirectTo="/dashboard"
              buttonText={t("loginWithGitHub")}
            />
          </div>

          <p className="text-center text-sm">
            {t("noAccount")}{" "}
            <Link href="/signup" className="underline underline-offset-4">
              {t("signUp")}
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
}

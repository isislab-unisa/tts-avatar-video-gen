"use client";

import React, { useState, useEffect } from "react";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  ResetPasswordFormValues,
  getResetPasswordSchema,
} from "@/lib/schema/resetPasswordSchema";
import { authClient } from "@/lib/auth-client";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

const ResetPassword = () => {
  const t = useTranslations("ResetPassword");
  const tv = useTranslations("Validation");
  const locale = useLocale();

  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const schema = getResetPasswordSchema(tv);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const router = useRouter();

  useEffect(() => {
    form.clearErrors();
  }, [locale, form]);

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) return;

    try {
      setPending(true);
      const { error } = await authClient.resetPassword({
        newPassword: data.password,
        token,
      });

      if (error) {
        toast.error(t("toastError") + error.message);
      } else {
        toast.success(t("toastSuccess"));
        router.push("/login");
      }
    } catch {
      toast.error(t("toastUnexpected"));
    } finally {
      setPending(false);
    }
  };

  if (!token) {
    return (
      <main className="flex items-center justify-center min-h-screen p-4 bg-background">
        <Card className="w-full max-w-md text-center border border-border shadow-md">
          <CardHeader>
            <CardTitle className="text-destructive text-2xl">
              {t("invalidToken")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{t("invalidTokenMessage")}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 overflow-hidden">
      <div className="absolute inset-0 flex items-start justify-center pt-12 pointer-events-none z-0">
        <Image
          src={showPassword ? "/cody-open.png" : "/cody-closed.png"}
          alt="Robot"
          width={260}
          height={260}
          className="object-contain"
          priority
        />
      </div>

      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 bg-card border border-border rounded-xl shadow-md space-y-6">
        <div className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </div>

        <CardContent className="p-0">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">
                  {t("passwordLabel")}
                </label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...form.register("password")}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">
                  {t("confirmPasswordLabel")}
                </label>
                <div className="relative">
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    {...form.register("confirmPassword")}
                    placeholder="••••••••"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-2 flex items-center text-muted-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={pending}>
                {pending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t("updatingButton")}
                  </>
                ) : (
                  <>
                    {t("resetButton")} <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <div className="text-sm text-center">
          {t("rememberPassword")}{" "}
          <Link
            href="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            {t("loginLink")}
          </Link>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;

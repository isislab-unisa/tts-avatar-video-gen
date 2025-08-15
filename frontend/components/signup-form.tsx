"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { getSignUpSchema, SignUpFormValues } from "@/lib/schema/signupSchema";
import { InputField } from "@/components/Auth/FormFields";
import { GoogleAuthButton } from "@/components/Auth/GoogleAuthButton";
import { GitHubAuthButton } from "@/components/Auth/GitHubAuthButton";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useTranslations, useLocale } from "next-intl";

export function SignupForm() {
  const t = useTranslations("Signup");
  const tv = useTranslations("Validation");
  const locale = useLocale();
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const schema = getSignUpSchema(tv);

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    form.clearErrors();
  }, [locale, form]);

  const onSubmit = async (data: SignUpFormValues) => {
    try {
      setPending(true);
      await authClient.signUp.email(
        {
          email: data.email,
          password: data.password,
          name: data.username,
        },
        {
          onSuccess: () => {
            toast.success(t("toastSuccess"));
            router.push("/login");
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
            name="username"
            label={t("usernameLabel")}
            placeholder="cody"
            type="text"
            icon={<User className="w-5 h-5 text-muted-foreground" />}
          />

          <InputField
            control={form.control}
            name="email"
            label={t("emailLabel")}
            placeholder="email@example.com"
            type="email"
            icon={<Mail className="w-5 h-5 text-muted-foreground" />}
          />

          <InputField
            control={form.control}
            name="password"
            label={t("passwordLabel")}
            placeholder="••••••••"
            type="password"
            icon={<Lock className="w-5 h-5 text-muted-foreground" />}
            showPasswordToggle
          />

          <InputField
            control={form.control}
            name="confirmPassword"
            label={t("confirmPasswordLabel")}
            placeholder="••••••••"
            type="password"
            icon={<Lock className="w-5 h-5 text-muted-foreground" />}
            showPasswordToggle
          />

          <div className="min-h-[44px] flex items-center">
            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={pending}
            >
              {pending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  {t("loading")}
                </>
              ) : (
                <>
                  {t("signupButton")}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

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
              action="signup"
              redirectTo="/dashboard"
              buttonText={t("signupWithGoogle")}
            />
            <GitHubAuthButton
              action="signup"
              redirectTo="/dashboard"
              buttonText={t("signupWithGitHub")}
            />
          </div>

          <p className="text-center text-sm">
            {t("haveAccount")}{" "}
            <Link href="/login" className="underline underline-offset-4">
              {t("login")}
            </Link>
          </p>
        </form>
      </Form>
    </div>
  );
}

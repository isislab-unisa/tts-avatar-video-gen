"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginFormValues } from "@/lib/schema/loginSchema";
import { InputField, CheckboxField } from "@/components/Auth/FormFields";
import { GoogleAuthButton } from "@/components/Auth/GoogleAuthButton";
import { GitHubAuthButton } from "@/components/Auth/GitHubAuthButton";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { authClient } from "@/lib/auth-client";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import Link from "next/link";

export function LoginForm() {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

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
            toast.success("Logged in successfully!");
            router.push("/dashboard");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Login failed");
          },
        }
      );
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your credentials to continue
          </p>
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

        <div className="flex items-center justify-between">
          <CheckboxField
            control={form.control}
            name="rememberMe"
            label="Remember me"
          />
          <Link
            href="/forgot-password"
            className="text-sm underline underline-offset-4 hover:opacity-80"
          >
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Please wait...
            </>
          ) : (
            <>
              Login
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
              Or continue with
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <GoogleAuthButton
            action="login"
            redirectTo="/dashboard"
            buttonText="Login with Google"
          />
          <GitHubAuthButton
            action="login"
            redirectTo="/dashboard"
            buttonText="Login with GitHub"
          />
        </div>

        <p className="text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="underline underline-offset-4">
            Sign up
          </Link>
        </p>
      </form>
    </Form>
  );
}

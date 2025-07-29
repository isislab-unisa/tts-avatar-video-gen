"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpFormValues, signUpSchema } from "@/lib/schema/signupSchema";
import { InputField } from "@/components/Auth/FormFields";
import { GoogleAuthButton } from "@/components/Auth/GoogleAuthButton";
import { GitHubAuthButton } from "@/components/Auth/GitHubAuthButton";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

export function SignupForm() {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

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
            toast.success("Account created! Check your email to verify.");
            router.push("/login");
          },
          onError: (ctx) => {
            toast.error(ctx.error.message || "Signup failed.");
          },
        }
      );
    } catch {
      toast.error("Unexpected error occurred.");
    } finally {
      setPending(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-sm text-muted-foreground">
            Enter your information to sign up
          </p>
        </div>

        <InputField
          control={form.control}
          name="username"
          label="Username"
          placeholder="cody"
          type="text"
          icon={<User className="w-5 h-5 text-muted-foreground" />}
        />

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

        <InputField
          control={form.control}
          name="confirmPassword"
          label="Confirm Password"
          placeholder="••••••••"
          type="password"
          icon={<Lock className="w-5 h-5 text-muted-foreground" />}
          showPasswordToggle
        />

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Please wait...
            </>
          ) : (
            <>
              Sign up <ArrowRight className="w-4 h-4 ml-2" />
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
            action="signup"
            redirectTo="/dashboard"
            buttonText="Sign up with Google"
          />
          <GitHubAuthButton
            action="signup"
            redirectTo="/dashboard"
            buttonText="Sign up with GitHub"
          />
        </div>

        <p className="text-center text-sm">
          Already have an account?{" "}
          <Link href="/login" className="underline underline-offset-4">
            Log in
          </Link>
        </p>
      </form>
    </Form>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GoogleIcon } from "@/components/ui/google-icon";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface GoogleAuthButtonProps {
  action: "login" | "signup";
  redirectTo?: string;
  buttonText?: string;
}

export const GoogleAuthButton = ({
  action = "login",
  redirectTo = "/dashboard",
  buttonText = "Login with Google",
}: GoogleAuthButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: redirectTo,
      });
    } catch {
      toast.error(`Could not ${action} with Google. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      className="flex items-center justify-center w-full gap-2 cursor-pointer"
      onClick={handleGoogleAuth}
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <>
          <GoogleIcon className="w-4 h-4" />
          <span>{buttonText}</span>
        </>
      )}
    </Button>
  );
};

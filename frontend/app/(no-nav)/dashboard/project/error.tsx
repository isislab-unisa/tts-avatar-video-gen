"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProjectError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Error");
  const router = useRouter();

  return (
    <div className="container mx-auto p-6">
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6 text-center">
        <div className="flex items-center space-x-2 text-red-600">
          <AlertCircle className="h-8 w-8" />
          <h1 className="text-2xl font-bold">{t("projectErrorTitle")}</h1>
        </div>

        <div className="space-y-2">
          <p className="text-muted-foreground">
            {t("projectErrorDescription")}
          </p>
        </div>

        <div className="flex gap-4">
          <Button onClick={reset} variant="default" className="cursor-pointer">
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("tryAgain")}
          </Button>
          <Button
            onClick={() => router.push("/dashboard")}
            variant="outline"
            className="cursor-pointer"
          >
            {t("goToDashboard")}
          </Button>
        </div>
      </div>
    </div>
  );
}

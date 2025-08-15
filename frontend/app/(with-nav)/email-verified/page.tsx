"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function EmailVerifiedPage() {
  const t = useTranslations("EmailVerified");

  return (
    <main className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4 overflow-hidden">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 -translate-y-50">
        <Image
          src="/cody-celebrate.png"
          alt="Robot"
          width={260}
          height={260}
          className="object-contain hidden sm:block"
          priority
        />
        <Image
          src="/cody-celebrate.png"
          alt="Robot"
          width={300}
          height={260}
          className="object-contain sm:hidden"
          priority
        />
      </div>

      <div className="relative z-10 w-full max-w-md p-6 sm:p-8 bg-card border border-border rounded-xl shadow-md space-y-6 text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="w-14 h-14 text-green-500" />
        </div>

        <h1 className="text-2xl font-bold">{t("title")}</h1>

        <p className="text-sm text-muted-foreground">{t("description")}</p>

        <Link href="/dashboard" className="block w-full">
          <Button className="w-full cursor-pointer" size="lg">
            {t("dashboardButton")}
          </Button>
        </Link>
      </div>
    </main>
  );
}

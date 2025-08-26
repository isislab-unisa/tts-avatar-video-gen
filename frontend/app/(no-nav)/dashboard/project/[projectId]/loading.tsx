"use client";

import { useTranslations } from "next-intl";

export default function LoadingProject() {
  const t = useTranslations("Status");
  return (
    <div className="min-h-[60vh] grid place-items-center text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
        <p className="text-muted-foreground">{t("loading")}</p>
      </div>
    </div>
  );
}

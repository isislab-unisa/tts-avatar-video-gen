"use client";

import { useTranslations } from "next-intl";

export default function ErrorProject({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Status");

  return (
    <div className="min-h-[60vh] grid place-items-center text-center px-4">
      <div className="max-w-md">
        <h2 className="text-lg font-semibold mb-2">{t("errorTitle")}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t("errorMessage")}
        </p>
        <button onClick={reset} className="rounded-md px-4 py-2 border text-sm">
          {t("retry")}
        </button>
        {process.env.NODE_ENV !== "production" && error?.message ? (
          <p className="mt-3 text-xs text-muted-foreground break-words">
            {error.message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

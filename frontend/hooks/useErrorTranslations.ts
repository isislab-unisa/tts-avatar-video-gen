"use client";

import { useTranslations } from "next-intl";
import { type ErrorMessageKey } from "@/lib/error-translations";

// Hook per ottenere le traduzioni degli errori lato client
export function useErrorTranslations() {
  const t = useTranslations("Errors");

  const getErrorMessage = (key: ErrorMessageKey): string => {
    return t(key);
  };

  return { getErrorMessage };
}

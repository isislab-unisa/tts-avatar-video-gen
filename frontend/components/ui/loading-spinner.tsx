import { useTranslations } from "next-intl";

export default function LoadingSpinner() {
  const t = useTranslations("Status");

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground text-lg">{t("loading")}</p>
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Download as DownloadIcon } from "lucide-react";

type BaseProps = {
  filename?: string;
  label: string;
  className?: string;
};

type WithUrl = BaseProps & {
  url: string;
  resolveUrl?: never;
};

type WithResolver = BaseProps & {
  url?: never;
  resolveUrl: () => Promise<string | null>;
};

type Props = WithUrl | WithResolver;

export default function DownloadButton(props: Props) {
  const { filename, label, className } = props;
  const t = useTranslations("Api");

  const handleClick = React.useCallback(async () => {
    try {
      const finalUrl = "url" in props ? props.url : await props.resolveUrl();
      if (!finalUrl) return;

      const res = await fetch(finalUrl);
      if (!res.ok) throw new Error(t("downloadFailed"));

      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = filename || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (error) {
      console.error("Download failed:", error);
    }
  }, [props, filename, t]);

  const disabled = "url" in props ? !props.url : false;

  return (
    <Button
      className={className || "cursor-pointer"}
      onClick={handleClick}
      disabled={disabled}
    >
      <DownloadIcon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}

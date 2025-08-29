"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Download as DownloadIcon } from "lucide-react";

type Props = {
  url?: string | null;
  filename?: string;
  label: string;
  className?: string;
};

export default function DownloadButton({
  url,
  filename,
  label,
  className,
}: Props) {
  const handleClick = React.useCallback(async () => {
    if (!url) return;
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename || "download";
    a.click();
  }, [url, filename]);

  return (
    <Button
      className={className || "cursor-pointer"}
      onClick={handleClick}
      disabled={!url}
    >
      <DownloadIcon className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}

"use client";
import * as React from "react";

export default function LocalTime({
  iso,
  locale = "it-IT",
  options,
  showSeconds = false,
}: {
  iso: string;
  locale?: string;
  options?: Intl.DateTimeFormatOptions;
  showSeconds?: boolean;
}) {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return <>—</>;

  const fmt = new Intl.DateTimeFormat(locale, {
    dateStyle: "short",
    timeStyle: showSeconds ? "medium" : "short",
    ...options,
  });

  return <>{fmt.format(d)}</>;
}

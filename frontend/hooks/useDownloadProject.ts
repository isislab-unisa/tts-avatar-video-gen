"use client";

import { getProjectDownloadUrlAction } from "@/app/(no-nav)/dashboard/_actions/projects";

export function useDownloadProject() {
  return async function download(projectId: string, fallbackName?: string) {
    const res = await getProjectDownloadUrlAction(projectId);
    if (!res.ok) throw new Error(res.message || "Download URL not available");

    const r = await fetch(res.url, { credentials: "include" });
    if (!r.ok) throw new Error("Download failed");

    const blob = await r.blob();
    const objectUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = fallbackName ?? "download";
    document.body.appendChild(a);
    a.click();
    a.remove();

    setTimeout(() => URL.revokeObjectURL(objectUrl), 2000);
  };
}

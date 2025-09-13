"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import { SortDropdown } from "@/components/sort-dropdown";
import { Search } from "lucide-react";

type Props = {
  basePath: string;
  currentSort: "createdAt" | "title";
  currentOrder: "asc" | "desc";
  placeholder?: string;
  isInFolder?: boolean;
};

export default function ProjectsToolbar({
  basePath,
  currentSort,
  currentOrder,
  placeholder,
  isInFolder = false,
}: Props) {
  const router = useRouter();
  const sp = useSearchParams();
  const t = useTranslations("Common");
  const q = sp.get("q") ?? "";

  function updateQuery(nextQ: string) {
    const params = new URLSearchParams(sp.toString());
    if (nextQ.trim()) params.set("q", nextQ.trim());
    else params.delete("q");
    params.set("page", "1");
    router.replace(`${basePath}?${params.toString()}`);
  }

  const searchPlaceholder =
    placeholder ?? (isInFolder ? t("searchInFolder") : t("searchProjects"));

  return (
    <div className="flex items-center justify-between w-full mb-4">
      <div className="flex-1"></div>
      <div className="flex items-center gap-3">
        <div className="relative w-fit max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder={searchPlaceholder}
            defaultValue={q}
            onChange={(e) => updateQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <SortDropdown
          basePath={basePath}
          currentSort={currentSort}
          currentOrder={currentOrder}
        />
      </div>
    </div>
  );
}

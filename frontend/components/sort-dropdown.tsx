"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, Check, Calendar, Type } from "lucide-react";

type SortKey = "createdAt" | "title";
type SortOrder = "asc" | "desc";

export function SortDropdown({
  basePath,
  currentSort,
  currentOrder,
}: {
  basePath: string;
  currentSort: SortKey;
  currentOrder: SortOrder;
}) {
  const t = useTranslations("Common");

  function href(sort: SortKey, order: SortOrder) {
    const qs = new URLSearchParams({ sort, order, page: "1" });
    return `${basePath}?${qs.toString()}`;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 cursor-pointer">
          <ArrowUpDown className="h-4 w-4" />
          {t("sort")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {t("sortField")}
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link
            href={href("createdAt", currentOrder)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              {t("sortByDate")}
            </div>
            {currentSort === "createdAt" && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={href("title", currentOrder)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Type className="h-4 w-4 text-muted-foreground" />
              {t("sortByTitle")}
            </div>
            {currentSort === "title" && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4" />
          {t("sortDirection")}
        </DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link
            href={href(currentSort, "asc")}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{t("sortAscending")}</span>
            {currentOrder === "asc" && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link
            href={href(currentSort, "desc")}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{t("sortDescending")}</span>
            {currentOrder === "desc" && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

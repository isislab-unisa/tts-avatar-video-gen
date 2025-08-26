"use client";

import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

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
  function href(sort: SortKey, order: SortOrder) {
    const qs = new URLSearchParams({ sort, order, page: "1" });
    return `${basePath}?${qs.toString()}`;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">Ordina</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Campo</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={href("createdAt", currentOrder)}>
            Per data {currentSort === "createdAt" ? "✓" : ""}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={href("title", currentOrder)}>
            Per titolo {currentSort === "title" ? "✓" : ""}
          </Link>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Direzione</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href={href(currentSort, "asc")}>
            Ascendente {currentOrder === "asc" ? "✓" : ""}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={href(currentSort, "desc")}>
            Discendente {currentOrder === "desc" ? "✓" : ""}
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

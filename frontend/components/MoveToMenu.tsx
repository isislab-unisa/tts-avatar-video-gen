"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { FolderSymlink, Folder, FolderPlus } from "lucide-react";

export type MoveTarget = { id: string; name: string };

type Props = {
  currentDirectoryId?: string | null;
  targets: MoveTarget[];
  onMove: (directoryId: string) => void | Promise<void>;
  onCreateNew?: () => void;
  className?: string;
};

export default function MoveToMenu({
  currentDirectoryId,
  targets,
  onMove,
  onCreateNew,
  className,
}: Props) {
  const t = useTranslations("Project");
  const filtered = React.useMemo(
    () => targets.filter((d) => d.id !== currentDirectoryId),
    [targets, currentDirectoryId]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className || "cursor-pointer"}>
          <FolderSymlink className="mr-2 h-4 w-4" />
          {t("moveTo")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-50 w-72">
        {filtered.map((d) => (
          <DropdownMenuItem
            key={d.id}
            className="cursor-pointer"
            onSelect={(e) => {
              e.preventDefault();
              void onMove(d.id);
            }}
          >
            <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="truncate">{d.name}</span>
          </DropdownMenuItem>
        ))}
        {onCreateNew ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onSelect={onCreateNew}>
              <FolderPlus className="mr-2 h-4 w-4" />
              <span>{t("createNewFolder")}</span>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Folder, FolderPlus } from "lucide-react";

export type MoveTarget = { id: string; name: string };

type Props = {
  currentDirectoryId?: string | null;
  targets: MoveTarget[];
  onMove: (directoryId: string) => void | Promise<void>;
  onCreateNew?: () => void;
};

export default function MoveToMenuContent({
  targets,
  onMove,
  onCreateNew,
}: Omit<Props, "currentDirectoryId">) {
  const t = useTranslations("Project");
  const tm = useTranslations("Toast");

  const filtered = targets;

  return (
    <>
      <div className="max-h-48 overflow-y-auto">
        {filtered.length > 0 ? (
          filtered.map((d) => (
            <DropdownMenuItem
              key={d.id}
              className="cursor-pointer"
              onSelect={(e) => {
                e.preventDefault();
                void onMove(d.id);
              }}
            >
              <Folder className="mr-1 h-4 w-4 text-muted-foreground" />
              <span className="truncate">{d.name}</span>
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            <Folder className="mr-1 h-4 w-4 text-muted-foreground" />
            <span className="truncate">{tm("noFoldersAvailable")}</span>
          </DropdownMenuItem>
        )}
      </div>
      {onCreateNew ? (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="cursor-pointer" onSelect={onCreateNew}>
            <FolderPlus className="mr-1 h-4 w-4" />
            <span>{t("createNewFolder")}</span>
          </DropdownMenuItem>
        </>
      ) : null}
    </>
  );
}

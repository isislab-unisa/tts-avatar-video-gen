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
  targets,
  onMove,
  onCreateNew,
  className,
}: Omit<Props, "currentDirectoryId">) {
  const t = useTranslations("Project");
  const [open, setOpen] = React.useState(false);
  // I targets sono già filtrati dal componente padre
  const filtered = targets;

  const handleMove = async (directoryId: string) => {
    await onMove(directoryId);
    setOpen(false); // Chiudi il dropdown dopo lo spostamento
  };

  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew();
      setOpen(false); // Chiudi il dropdown dopo aver aperto il dialog di creazione
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={className || "cursor-pointer"}>
          <FolderSymlink className="mr-2 h-4 w-4" />
          {t("moveTo")}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-50 w-72">
        <div className="max-h-48 overflow-y-auto">
          {filtered.length > 0 ? (
            filtered.map((d) => (
              <DropdownMenuItem
                key={d.id}
                className="cursor-pointer"
                onSelect={(e) => {
                  e.preventDefault();
                  void handleMove(d.id);
                }}
              >
                <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="truncate">{d.name}</span>
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled className="text-muted-foreground">
              <Folder className="mr-2 h-4 w-4" />
              <span>{t("noFolders")}</span>
            </DropdownMenuItem>
          )}
        </div>
        {onCreateNew ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer"
              onSelect={handleCreateNew}
            >
              <FolderPlus className="mr-2 h-4 w-4" />
              <span>{t("createNewFolder")}</span>
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

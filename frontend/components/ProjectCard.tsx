"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MoreHorizontal,
  Pencil,
  FolderSymlink,
  Trash2,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  deleteProjectAction,
  moveProjectAction,
  renameProjectAction,
  type ProjectListItem,
} from "@/app/(no-nav)/dashboard/_actions/projects";
import type { DirectoryDTO } from "@/app/(no-nav)/dashboard/_actions/directories";

type Props = {
  item: ProjectListItem;
  directories: DirectoryDTO[];
  showFolder?: boolean; // true in Home, false nelle pagine cartella
  currentDirId?: string; // per filtrare "Sposta in…" (non mostrare la dir corrente)
};

export default function ProjectCard({
  item,
  directories,
  showFolder = false,
  currentDirId,
}: Props) {
  const [openConfirm, setOpenConfirm] = React.useState(false);

  async function onRename() {
    // AlertDialog per rename lo lasciamo nella pagina dettaglio
    const title = window.prompt("Nuovo titolo", item.title);
    if (!title) return;
    const ok = await renameProjectAction(item.id, title);
    if (ok) {
      toast.success("Titolo aggiornato");
    } else {
      toast.error("Rinomina fallita");
    }
  }

  async function onMove(dirId: string) {
    const ok = await moveProjectAction(item.id, dirId);
    if (ok) toast.success("Spostato");
    else toast.error("Spostamento fallito");
  }

  async function onDelete() {
    const ok = await deleteProjectAction(item.id);
    if (ok) toast.success("Eliminato");
    else toast.error("Eliminazione fallita");
  }

  const dirName =
    directories.find((d) => d.id === item.directoryId)?.name || "—";
  const selectableDirs = directories.filter((d) => d.id !== currentDirId);

  return (
    <div className="group rounded-xl bg-muted/40 hover:bg-muted/50 transition-colors overflow-hidden border border-border">
      <Link href={`/dashboard/project/${item.id}`} className="block">
        <div className="aspect-[4/3] w-full bg-black/30 relative">
          <Image
            src={item.avatarImage || "/cody.png"}
            alt="preview"
            fill
            sizes="(max-width:768px) 100vw, 33vw"
            className="object-cover"
          />
        </div>
      </Link>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground capitalize">
              {item.avatar || "cody"}
            </div>

            <Link
              href={`/dashboard/project/${item.id}`}
              className="block truncate font-medium"
            >
              {item.title}
            </Link>

            {showFolder && (
              <div className="text-xs text-muted-foreground">
                Cartella: {dirName}
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => onRename()}
              >
                <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                Rinomina
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer">
                  <FolderSymlink className="mr-2 h-4 w-4 text-muted-foreground" />
                  Sposta in…
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="w-56">
                  {selectableDirs.map((d) => (
                    <DropdownMenuItem
                      key={d.id}
                      className="cursor-pointer"
                      onClick={() => onMove(d.id)}
                    >
                      <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                      {d.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                onClick={() => setOpenConfirm(true)}
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                Elimina
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <AlertDialog open={openConfirm} onOpenChange={setOpenConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminare il progetto?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <Button
              onClick={() => onDelete()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Elimina
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

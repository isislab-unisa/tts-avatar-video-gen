"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  MoreHorizontal,
  Pencil,
  FolderSymlink,
  Trash2,
  Folder,
  Download as DownloadIcon,
  FolderPlus,
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
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import RenameProjectDialog from "@/components/RenameProjectDialog";
import {
  deleteProjectAction,
  moveProjectAction,
  getProjectDownloadUrlAction,
  type ProjectListItem,
} from "@/app/(no-nav)/dashboard/_actions/projects";
import { type DirectoryDTO } from "@/app/(no-nav)/dashboard/_actions/directories";
import { CreateDirectoryDialog } from "@/components/CreateDirectoryDialog";
import { toast } from "sonner";

type Props = {
  item: ProjectListItem;
  directories: DirectoryDTO[];
  showFolder?: boolean;
};

export default function ProjectHomeCard({
  item,
  directories,
  showFolder,
}: Props) {
  const router = useRouter();
  const tProj = useTranslations("Project");
  const tDlg = useTranslations("Dialog");
  const tToast = useTranslations("Toast");

  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const dirName =
    directories.find((d) => d.id === item.directoryId)?.name ?? "—";

  // escludi la cartella che già contiene il progetto
  const moveTargets = React.useMemo(
    () => directories.filter((d) => d.id !== item.directoryId),
    [directories, item.directoryId]
  );

  const handleMove = async (dirId: string, dirLabel?: string) => {
    const ok = await moveProjectAction(item.id, dirId);
    if (ok) {
      // Close the dropdown to give user feedback
      setDropdownOpen(false);
      toast.success(
        tToast("projectMoved", { title: item.title, folder: dirLabel ?? "" })
      );
      router.refresh();
    } else {
      toast.error(tToast("moveFail"));
    }
  };

  const handleDelete = async () => {
    const res = await deleteProjectAction(item.id);
    const ok = typeof res === "boolean" ? res : !!res.ok;
    if (ok) {
      // Close the dropdown to give user feedback
      setDropdownOpen(false);
      toast.success(tToast("projectDeleted", { title: item.title }));
      router.refresh();
    } else {
      toast.error(tToast("deleteFail"));
    }
  };

  const handleDownload = async () => {
    try {
      const res = await getProjectDownloadUrlAction(item.id);
      console.log("Download response:", res); // Debug
      if (!res.ok || !res.url) {
        console.error(
          "Download failed:",
          !res.ok && "message" in res ? res.message : "No URL"
        ); // Debug
        toast.error(tToast("downloadFail"));
        return;
      }

      const r = await fetch(res.url);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${item.title || "video"}.mp4`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch (error) {
      console.error("Download error:", error); // Debug
      toast.error(tToast("downloadFail"));
    }
  };

  // tutta la card cliccabile + accessibilità tastiera
  const goToDetail = React.useCallback(() => {
    router.push(`/dashboard/project/${item.id}`);
  }, [router, item.id]);

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => goToDetail()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToDetail();
        }
      }}
      className="group rounded-xl bg-card hover:bg-muted/40 transition-colors overflow-hidden border cursor-pointer focus:outline-none"
    >
      {/* Anteprima */}
      <div className="aspect-[16/11] w-full bg-muted relative">
        <Image
          src={item.avatarImage || "/cody.png"}
          alt="preview"
          fill
          sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 20vw"
          className="object-cover"
          priority={false}
        />
      </div>

      {/* Testi + menu */}
      <div className="p-3 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-[11px] text-muted-foreground uppercase">
              {item.avatar || "cody"}
            </div>

            <div
              className="block truncate font-medium text-sm"
              title={item.title}
            >
              {item.title}
            </div>

            {showFolder && (
              <div className="text-[11px] text-muted-foreground truncate">
                Cartella: {dirName}
              </div>
            )}

            <div className="text-[11px] text-muted-foreground">
              {new Date(item.createdAt).toLocaleString()}
            </div>
          </div>

          {/* Kebab menu (ferma la navigazione della card) */}
          <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-8 w-8"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-60 z-50"
              align="end"
              onClick={(e) => e.stopPropagation()}
            >
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setRenameOpen(true);
                }}
              >
                <Pencil className="mr-2 h-4 w-4 text-muted-foreground" />
                {tProj("rename")}
              </DropdownMenuItem>

              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="cursor-pointer gap-2">
                  <FolderSymlink className="mr-2 h-4 w-4 text-muted-foreground" />
                  {tProj("moveTo")}
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent
                  className="w-64"
                  onClick={(e) => e.stopPropagation()}
                >
                  {moveTargets.length === 0 ? (
                    <div className="px-2 py-2 text-sm text-muted-foreground">
                      —
                    </div>
                  ) : (
                    moveTargets.map((d) => (
                      <DropdownMenuItem
                        key={d.id}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          void handleMove(d.id, d.name);
                        }}
                      >
                        <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span className="truncate">{d.name}</span>
                      </DropdownMenuItem>
                    ))
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setCreateOpen(true);
                    }}
                  >
                    <FolderPlus className="mr-2 h-4 w-4" />
                    {tProj("createNewFolder")}
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  void handleDownload();
                }}
              >
                <DownloadIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                {tProj("download")}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setDeleteOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                {tProj("delete")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Rename */}
      <RenameProjectDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        projectId={item.id}
        defaultTitle={item.title}
        onRenamed={() => router.refresh()}
      />

      {/* Delete */}
      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title={tDlg("deleteProjectTitle")}
      />

      {/* Create folder con Zod (riuso del dialog già usato nel dettaglio) */}
      <CreateDirectoryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(dir) => {
          setCreateOpen(false);
          // come nella pagina di dettaglio: crea e sposta subito il progetto
          void handleMove(dir.id, dir.name);
        }}
      />
    </div>
  );
}

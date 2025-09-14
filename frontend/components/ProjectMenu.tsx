"use client";

import * as React from "react";
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
  type ProjectListItem,
} from "@/app/(no-nav)/dashboard/_actions/projects";
import type { DirectoryDTO } from "@/lib/schema/directory";
import { CreateDirectoryDialog } from "@/components/CreateDirectoryDialog";
import { toast } from "sonner";
import { useDownloadProject } from "@/hooks/useDownloadProject";

type Props = {
  project: ProjectListItem;
  directories: DirectoryDTO[];
  currentDirId?: string;
  onProjectUpdated?: () => void;
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "ghost" | "outline";
};

export default function ProjectMenu({
  project,
  directories,
  currentDirId,
  onProjectUpdated,
  className = "",
  size = "md",
  variant = "ghost",
}: Props) {
  const tProj = useTranslations("Project");
  const tToast = useTranslations("Toast");
  const router = useRouter();

  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const moveTargets = React.useMemo(
    () => directories.filter((d) => d.id !== currentDirId),
    [directories, currentDirId]
  );

  const handleMove = async (dirId: string, dirLabel?: string) => {
    const res = await moveProjectAction(project.id, dirId);
    if (res.ok) {
      setDropdownOpen(false); // Chiudi il dropdown

      // Emetti evento per aggiornare la sidebar in tempo reale
      const event = new CustomEvent("projectMoved", {
        detail: {
          projectId: project.id,
          oldDirectoryId: project.directoryId,
          newDirectoryId: dirId,
          projectTitle: project.title,
        },
      });
      window.dispatchEvent(event);

      toast.success(
        tToast("projectMoved", { title: project.title, folder: dirLabel ?? "" })
      );
      onProjectUpdated?.();
      router.refresh(); // Aggiorna la sidebar
    } else {
      toast.error(res.message || tToast("moveFail"));
    }
  };

  const handleDelete = async () => {
    const res = await deleteProjectAction(project.id);
    if (res.ok) {
      setDropdownOpen(false);

      // Emetti evento per aggiornare la cache della sidebar in tempo reale
      const event = new CustomEvent("projectDeleted", {
        detail: {
          projectId: project.id,
          directoryId: project.directoryId,
        },
      });
      window.dispatchEvent(event);

      toast.success(tToast("projectDeleted", { title: project.title }));
      onProjectUpdated?.();
      router.refresh(); // Aggiorna la sidebar
    } else {
      toast.error(res.message || tToast("deleteFail"));
    }
  };

  // const handle = async () => {
  //   try {
  //     const result = await getProjectDownloadUrlAction(project.id);
  //     if (!result.ok) {
  //       toast.error(result.message || tToast("downloadFail"));
  //       return;
  //     }

  //     // Scarico come blob (coerente con la pagina di dettaglio)
  //     const res = await fetch(result.url);
  //     if (!res.ok) throw new Error("Download failed");

  //     const blob = await res.blob();
  //     const objectUrl = URL.createObjectURL(blob);

  //     const a = document.createElement("a");
  //     a.href = objectUrl;
  //     a.download = `${project.title}.mp4`;
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     URL.revokeObjectURL(objectUrl);

  //     toast.success(tToast("downloadStarted"));
  //   } catch (err) {
  //     console.error("Download error:", err);
  //     toast.error(tToast("downloadFail"));
  //   }
  // };

  const download = useDownloadProject();

  const handleDownload = React.useCallback(async () => {
    try {
      await download(project.id, `${project.title}.mp4`);
    } catch (err) {
      console.error("Download error:", err);
    }
  }, [download, project.id, project.title]);

  const sizeClasses = { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-10 w-10" };
  const iconSizes = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant={variant}
            size="icon"
            className={`shrink-0 ${sizeClasses[size]} ${className}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <MoreHorizontal className={iconSizes[size]} />
            <span className="sr-only">More</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-60 z-50"
          align="end"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setRenameOpen(true);
            }}
          >
            <Pencil className={`${iconSizes[size]} text-muted-foreground`} />
            {tProj("rename")}
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer gap-2">
              <FolderSymlink
                className={`${iconSizes[size]} text-muted-foreground`}
              />
              {tProj("moveTo")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent
              className="w-64"
              onClick={(e) => e.stopPropagation()}
            >
              {moveTargets.length === 0 ? (
                <DropdownMenuItem disabled className="gap-2">
                  <Folder
                    className={`${iconSizes[size]} text-muted-foreground`}
                  />
                  <span>{tToast("noFoldersAvailable")}</span>
                </DropdownMenuItem>
              ) : (
                moveTargets.map((d) => (
                  <DropdownMenuItem
                    key={d.id}
                    className="cursor-pointer gap-2"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      void handleMove(d.id, d.name);
                    }}
                  >
                    <Folder
                      className={`${iconSizes[size]} text-muted-foreground`}
                    />
                    <span className="truncate">{d.name}</span>
                  </DropdownMenuItem>
                ))
              )}

              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer gap-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setCreateOpen(true);
                }}
              >
                <FolderPlus className={`${iconSizes[size]}`} />
                {tProj("createNewFolder")}
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem
            className="cursor-pointer gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void handleDownload();
            }}
          >
            <DownloadIcon
              className={`${iconSizes[size]} text-muted-foreground`}
            />
            {tProj("download")}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            className="cursor-pointer gap-2 text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDeleteOpen(true);
            }}
          >
            <Trash2 className={`${iconSizes[size]} text-red-600`} />
            {tProj("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameProjectDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        projectId={project.id}
        directoryId={project.directoryId}
        defaultTitle={project.title}
        onRenamed={() => {
          onProjectUpdated?.();
          router.refresh(); // Aggiorna la sidebar
        }}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title={tProj("deleteConfirmTitle")}
      />

      <CreateDirectoryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(dir) => {
          setCreateOpen(false);
          void handleMove(dir.id, dir.name);
        }}
      />
    </>
  );
}

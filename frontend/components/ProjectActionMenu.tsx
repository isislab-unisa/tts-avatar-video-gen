"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  MoreHorizontal,
  Pencil,
  FolderSymlink,
  Trash2,
  Download as DownloadIcon,
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
import MoveToMenuContent from "@/components/MoveToMenuContent";
import { CreateDirectoryDialog } from "@/components/CreateDirectoryDialog";
import {
  deleteProjectAction,
  moveProjectAction,
  type ProjectListItem,
} from "@/app/(no-nav)/dashboard/_actions/projects";
import type { DirectoryDTO } from "@/lib/schema/directory";
import { toast } from "sonner";
import { useDownloadProject } from "@/hooks/useDownloadProject";

type Props = {
  project: ProjectListItem;
  directories: DirectoryDTO[];
  currentDirId?: string;
  onProjectUpdated?: () => void;
  className?: string;
  size?: "sm" | "lg" | "default" | "icon";
  variant?: "ghost" | "outline";
  trigger?: React.ReactNode;
};

export default function ProjectActionMenu({
  project,
  directories,
  currentDirId,
  onProjectUpdated,
  className,
  size = "sm",
  variant = "ghost",
  trigger,
}: Props) {
  const t = useTranslations("Project");
  const tm = useTranslations("Toast");
  const router = useRouter();
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const downloadProject = useDownloadProject();
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleRename = () => {
    setRenameOpen(true);
  };

  const handleDelete = () => {
    setDeleteOpen(true);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadProject(project.id, project.title);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleRenameSuccess = () => {
    setRenameOpen(false);
    onProjectUpdated?.();
    router.refresh(); // Aggiorna la sidebar
  };

  const handleDeleteSuccess = () => {
    setDeleteOpen(false);
    onProjectUpdated?.();

    // Emetti evento per aggiornare la cache della sidebar in tempo reale
    const event = new CustomEvent("projectDeleted", {
      detail: {
        projectId: project.id,
        directoryId: project.directoryId,
      },
    });
    window.dispatchEvent(event);

    router.refresh(); // Aggiorna la sidebar

    toast.success(tm("projectDeleted", { title: project.title }));
  };

  const handleMoveSuccess = (newDirectoryId: string, folderName?: string) => {
    setDropdownOpen(false); // Chiudi il dropdown
    onProjectUpdated?.();

    // Emetti evento per aggiornare la sidebar in tempo reale
    const event = new CustomEvent("projectMoved", {
      detail: {
        projectId: project.id,
        oldDirectoryId: project.directoryId,
        newDirectoryId: newDirectoryId,
        projectTitle: project.title,
      },
    });
    window.dispatchEvent(event);

    router.refresh(); // Aggiorna la sidebar

    const folderLabel =
      folderName ||
      directories.find((d) => d.id === newDirectoryId)?.name ||
      "";
    toast.success(
      tm("projectMoved", { title: project.title, folder: folderLabel })
    );
  };

  const defaultTrigger = (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={(e) => e.stopPropagation()}
    >
      <MoreHorizontal className="h-4 w-4" />
      <span className="sr-only">More</span>
    </Button>
  );

  return (
    <>
      <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
        <DropdownMenuTrigger asChild>
          {trigger || defaultTrigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={handleRename}
            className="cursor-pointer gap-2"
          >
            <Pencil className="h-4 w-4" />
            {t("rename")}
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="cursor-pointer gap-2">
              <FolderSymlink className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              {t("moveTo")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <MoveToMenuContent
                targets={directories
                  .filter((d) => !currentDirId || d.id !== currentDirId)
                  .map((d) => ({ id: d.id, name: d.name }))}
                onMove={async (directoryId) => {
                  try {
                    const res = await moveProjectAction(
                      project.id,
                      directoryId
                    );
                    if (res.ok) {
                      const folderName = directories.find(
                        (d) => d.id === directoryId
                      )?.name;
                      handleMoveSuccess(directoryId, folderName);
                    } else {
                      toast.error(res.message || tm("moveFail"));
                    }
                  } catch (error) {
                    console.error("Move failed:", error);
                    toast.error(tm("moveFail"));
                  }
                }}
                onCreateNew={() => {
                  setCreateOpen(true);
                }}
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem
            onClick={handleDownload}
            disabled={isDownloading}
            className="cursor-pointer gap-2"
          >
            <DownloadIcon className="h-4 w-4" />
            {isDownloading ? t("generating") : t("download")}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleDelete}
            className="cursor-pointer gap-2 text-red-700 focus:text-red-700 focus:bg-red-50 dark:text-red-500 dark:focus:text-red-500 dark:focus:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4 text-red-700 dark:text-red-500" />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameProjectDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        projectId={project.id}
        directoryId={project.directoryId}
        defaultTitle={project.title}
        onRenamed={handleRenameSuccess}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          const res = await deleteProjectAction(project.id);
          if (res.ok) {
            handleDeleteSuccess();
          } else {
            toast.error(res.message || tm("deleteFail"));
          }
        }}
        title={`${t("deleteConfirmTitle")} "${project.title}"?`}
      />

      <CreateDirectoryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(dir: { id: string; name: string }) => {
          setCreateOpen(false);
          // Sposta il progetto nella nuova cartella creata
          void moveProjectAction(project.id, dir.id).then((res) => {
            if (res.ok) {
              handleMoveSuccess(dir.id, dir.name);
            } else {
              toast.error(res.message || tm("moveFail"));
            }
          });
        }}
      />
    </>
  );
}

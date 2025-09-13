"use client";

import * as React from "react";
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
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
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
    toast.success(tm("renameSuccess"));
  };

  const handleDeleteSuccess = () => {
    setDeleteOpen(false);
    onProjectUpdated?.();
    toast.success(tm("deleteSuccess"));
  };

  const handleMoveSuccess = () => {
    onProjectUpdated?.();
    toast.success(tm("moveSuccess"));
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {trigger || defaultTrigger}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleRename}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("rename")}
          </DropdownMenuItem>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <FolderSymlink className="mr-2 h-4 w-4 flex-shrink-0" />
              {t("moveTo")}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <MoveToMenuContent
                currentDirectoryId={currentDirId}
                targets={directories.map((d) => ({ id: d.id, name: d.name }))}
                onMove={async (directoryId) => {
                  try {
                    const success = await moveProjectAction(
                      project.id,
                      directoryId
                    );
                    if (success) {
                      handleMoveSuccess();
                    } else {
                      toast.error(tm("moveFail"));
                    }
                  } catch (error) {
                    console.error("Move failed:", error);
                    toast.error(tm("moveFail"));
                  }
                }}
                onCreateNew={() => {
                  // Apri il dialog per creare una nuova cartella
                  // Questo verrà gestito dal componente padre se necessario
                }}
              />
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuItem onClick={handleDownload} disabled={isDownloading}>
            <DownloadIcon className="mr-2 h-4 w-4" />
            {isDownloading ? t("generating") : t("download")}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={handleDelete}
            className="text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
          >
            <Trash2 className="mr-2 h-4 w-4 text-red-600" />
            {t("delete")}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RenameProjectDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        projectId={project.id}
        defaultTitle={project.title}
        onRenamed={handleRenameSuccess}
      />

      <ConfirmDeleteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={async () => {
          const success = await deleteProjectAction(project.id);
          if (success) {
            handleDeleteSuccess();
          } else {
            toast.error(tm("deleteFail"));
          }
        }}
        title={`${t("deleteConfirmTitle")} "${project.title}"?`}
      />
    </>
  );
}

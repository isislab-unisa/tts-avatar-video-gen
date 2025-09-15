"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";
import {
  moveProjectAction,
  deleteProjectAction,
  getProjectVideoUrlAction,
  type ProjectListItem,
} from "@/app/(no-nav)/dashboard/_actions/projects";
import type { DirectoryDTO } from "@/lib/schema/directory";
import { CreateDirectoryDialog } from "@/components/CreateDirectoryDialog";
import RenameProjectDialog from "@/components/RenameProjectDialog";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import MoveToMenu from "@/components/MoveToMenu";
import { useDownloadProject } from "@/hooks/useDownloadProject";
import { Download as DownloadIcon } from "lucide-react";

type Dir = DirectoryDTO;

export default function ProjectDetail({
  project,
  directories,
}: {
  project:
    | (ProjectListItem & {
        downloadUrl?: string;
        text?: string;
        avatar?: string;
      })
    | null;
  directories: Dir[];
}) {
  const t = useTranslations("Project");
  const m = useTranslations("Toast");
  const router = useRouter();
  const downloadProject = useDownloadProject();
  const [isDownloading, setIsDownloading] = React.useState(false);
  const [videoUrl, setVideoUrl] = React.useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = React.useState(false);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);

  const loadVideoUrl = React.useCallback(async () => {
    if (!project) return;
    setIsLoadingVideo(true);
    try {
      const result = await getProjectVideoUrlAction(project.id);
      if (result.ok) {
        setVideoUrl(result.url);
      } else {
        console.error("Failed to load video URL:", result.message);
      }
    } catch (error) {
      console.error("Error loading video URL:", error);
    } finally {
      setIsLoadingVideo(false);
    }
  }, [project]);

  const handleDownload = async () => {
    if (!project) return;
    setIsDownloading(true);
    try {
      await downloadProject(project.id, project.title);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  // Carica l'URL del video quando il componente si monta
  React.useEffect(() => {
    if (project) {
      loadVideoUrl();
    }
  }, [project, loadVideoUrl]);

  if (!project) {
    return (
      <div className="min-h-[calc(100vh-8rem)] grid place-items-center px-4 text-center">
        <p className="text-muted-foreground">{t("notFound")}</p>
      </div>
    );
  }

  const p = project;

  async function onMove(dirId: string) {
    const res = await moveProjectAction(p.id, dirId);
    if (res.ok) {
      const folderName = directories.find((d) => d.id === dirId)?.name || "";
      toast.success(m("projectMoved", { title: p.title, folder: folderName }));

      // Emetti evento per aggiornare la sidebar
      const event = new CustomEvent("projectMoved", {
        detail: {
          projectId: p.id,
          oldDirectoryId: p.directoryId,
          newDirectoryId: dirId,
          projectTitle: p.title,
        },
      });
      window.dispatchEvent(event);

      router.refresh();
    } else {
      toast.error(res.message || m("moveFail"));
    }
  }

  return (
    <section className="min-h-[calc(100vh-10rem)] grid place-content-center px-4">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2 items-center justify-items-center">
        {/* Player */}
        <div className="w-full rounded-2xl overflow-hidden bg-sidebar dark:bg-sidebar">
          <div className="w-full rounded-2xl overflow-hidden ">
            {isLoadingVideo ? (
              <div className="w-full aspect-video bg-sidebar dark:bg-sidebar relative flex items-center justify-center">
                <div className="text-sidebar-foreground text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sidebar-foreground mx-auto mb-2"></div>
                  <div className="text-sm">{t("loadingVideo")}</div>
                </div>
              </div>
            ) : videoUrl ? (
              <video
                className="w-full aspect-video object-cover cursor-pointer"
                controls
                preload="auto"
                src={videoUrl}
                onError={(e) => {
                  console.error("Video load error:", e);
                }}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              <div className="w-full aspect-video bg-sidebar dark:bg-sidebar relative flex items-center justify-center">
                <div className="text-sidebar-foreground text-center">
                  <div className="text-sm">{t("videoNotAvailable")}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="w-full max-w-2xl">
          <div className="space-y-4 text-left">
            <h2 className="text-2xl font-semibold leading-snug break-words">
              {p.title}
            </h2>

            <div className="text-sm text-muted-foreground">
              {t("avatarLabel")}:{" "}
              <span className="capitalize">{p.avatar || "cody"}</span>
            </div>

            <div
              className="rounded-md border border-border/50 bg-background/40 p-3 max-h-[40vh] overflow-y-auto"
              aria-label={t("textLabel")}
            >
              <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
                {p.text}
              </p>
            </div>

            <div className="grid gap-3 max-w-sm">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="cursor-pointer"
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  {isDownloading ? t("generating") : t("download")}
                </Button>
                <MoveToMenu
                  targets={directories.map((d) => ({ id: d.id, name: d.name }))}
                  onMove={(id) => void onMove(id)}
                  onCreateNew={() => setCreateOpen(true)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  onClick={() => setRenameOpen(true)}
                  className="cursor-pointer"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  {t("rename")}
                </Button>

                <Button
                  onClick={() => setConfirmOpen(true)}
                  className="bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white cursor-pointer"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {t("delete")}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <RenameProjectDialog
        open={renameOpen}
        onOpenChange={setRenameOpen}
        projectId={p.id}
        directoryId={p.directoryId}
        defaultTitle={p.title}
        onRenamed={() => router.refresh()}
      />

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={async () => {
          const res = await deleteProjectAction(p.id);
          if (res.ok) {
            // Emetti evento per aggiornare la cache della sidebar in tempo reale
            const event = new CustomEvent("projectDeleted", {
              detail: {
                projectId: p.id,
                directoryId: p.directoryId,
              },
            });
            window.dispatchEvent(event);

            toast.success(m("projectDeleted", { title: p.title }));
            router.back();
          } else {
            toast.error(res.message || m("deleteFail"));
          }
        }}
      />

      <CreateDirectoryDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(dir) => {
          setCreateOpen(false);
          void onMove(dir.id);
        }}
      />
    </section>
  );
}

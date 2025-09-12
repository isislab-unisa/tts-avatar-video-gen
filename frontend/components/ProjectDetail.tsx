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
  type ProjectListItem,
} from "@/app/(no-nav)/dashboard/_actions/projects";
import type { DirectoryDTO } from "@/app/(no-nav)/dashboard/_actions/directories";
import { CreateDirectoryDialog } from "@/components/CreateDirectoryDialog";
import RenameProjectDialog from "@/components/RenameProjectDialog";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import MoveToMenu from "@/components/MoveToMenu";
import DownloadButton from "@/components/DownloadButton";

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

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);

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
      router.refresh();
    } else {
      toast.error(res.message || m("moveFail"));
    }
  }

  return (
    <section className="min-h-[calc(100vh-10rem)] grid place-content-center px-4">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2 items-center justify-items-center">
        {/* Player */}
        <div className="w-full rounded-2xl overflow-hidden bg-black">
          <div className="aspect-video grid place-items-center">
            <video
              src={`/api/projects/${p.id}/download`}
              controls
              className="h-full w-full object-contain rounded-2xl"
            />
          </div>
        </div>

        {/* Info + azioni */}
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
                <DownloadButton
                  url={`/api/projects/${p.id}/download`}
                  filename={`${p.title}.mp4`}
                  label={t("download")}
                />
                <MoveToMenu
                  currentDirectoryId={p.directoryId}
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
                  className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
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
        defaultTitle={p.title}
        onRenamed={() => router.refresh()}
      />

      <ConfirmDeleteDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={async () => {
          const res = await deleteProjectAction(p.id);
          if (res.ok) {
            toast.success(m("projectDeleted", { title: p.title }));
            router.push("/dashboard");
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

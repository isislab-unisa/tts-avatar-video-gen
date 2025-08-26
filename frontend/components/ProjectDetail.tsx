"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  FolderPlus,
  Pencil,
  Trash2,
  Download as DownloadIcon,
  FolderSymlink,
  Folder,
} from "lucide-react";
import {
  moveProjectAction,
  renameProjectAction,
  deleteProjectAction,
  type ProjectListItem,
} from "@/app/(no-nav)/dashboard/_actions/projects";
import type { DirectoryDTO } from "@/app/(no-nav)/dashboard/_actions/directories";
import { CreateDirectoryDialog } from "@/components/CreateDirectoryDialog";
import { projectSchema } from "@/lib/schema/project";
import type { z } from "zod";

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
  const d = useTranslations("Dialog");
  const m = useTranslations("Toast");

  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [renameOpen, setRenameOpen] = React.useState(false);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState(project?.title ?? "");
  const [titleError, setTitleError] = React.useState<string>("");
  const [saving, setSaving] = React.useState(false);

  if (!project) {
    return (
      <div className="min-h-[calc(100vh-8rem)] grid place-items-center px-4 text-center">
        <p className="text-muted-foreground">{t("notFound")}</p>
      </div>
    );
  }
  const p = project as NonNullable<typeof project>;

  async function forceDownload(url: string, filename: string) {
    const res = await fetch(url);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
  }

  // estraggo solo lo schema del titolo per la rinomina
  const titleSchema = projectSchema.shape.title as z.ZodString;

  async function onRenameSubmit() {
    const title = newTitle.trim();

    // ✅ validazione con Zod
    const result = titleSchema.safeParse(title);
    if (!result.success) {
      const msg = result.error.issues[0]?.message ?? m("renameFail");
      setTitleError(msg);
      toast.error(msg);
      return;
    }

    setSaving(true);
    const ok = await renameProjectAction(p.id, title);
    setSaving(false);

    if (ok) {
      toast.success(m("renameSuccess"));
      setRenameOpen(false);
      router.refresh();
    } else {
      toast.error(m("renameFail"));
    }
  }

  async function onMove(dirId: string) {
    const ok = await moveProjectAction(p.id, dirId);
    if (ok) {
      toast.success(m("moveSuccess"));
      router.refresh();
    } else toast.error(m("moveFail"));
  }

  async function onDelete() {
    const ok = await deleteProjectAction(p.id);
    if (ok) {
      toast.success(m("deleteSuccess"));
      router.push("/dashboard");
    } else toast.error(m("deleteFail"));
  }

  const selectableDirs = directories.filter((d) => d.id !== p.directoryId);

  return (
    // ⬇️ wrapper che centra tutto verticalmente e orizzontalmente
    <section className="min-h-[calc(100vh-10rem)] grid place-content-center px-4">
      <div className="grid w-full max-w-6xl gap-8 lg:grid-cols-2 items-center justify-items-center">
        {/* Player */}
        <div className="w-full rounded-2xl overflow-hidden bg-black">
          <div className="aspect-video grid place-items-center">
            <video
              src={p.downloadUrl}
              controls
              className="h-full w-full object-contain rounded-2xl"
            />
          </div>
        </div>

        {/* Pannello: Titolo → Avatar → Testo */}
        <div className="w-full max-w-2xl">
          <div className="space-y-4 text-left">
            <h2 className="text-2xl font-semibold leading-snug break-words">
              {p.title}
            </h2>

            <div className="text-sm text-muted-foreground">
              {t("avatarLabel")}:{" "}
              <span className="capitalize">{p.avatar || "cody"}</span>
            </div>

            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap break-words">
              {p.text}
            </p>

            {/* Azioni */}
            <div className="grid gap-3 max-w-sm">
              <div className="grid grid-cols-2 gap-3">
                <Button
                  className="cursor-pointer"
                  onClick={() =>
                    p.downloadUrl &&
                    forceDownload(p.downloadUrl, `${p.title}.mp4`)
                  }
                >
                  <DownloadIcon className="mr-2 h-4 w-4" />
                  {t("download")}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="cursor-pointer">
                      <FolderSymlink className="mr-2 h-4 w-4" />
                      {t("moveTo")}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="z-50 w-72">
                    {selectableDirs.map((d) => (
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
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer"
                      onSelect={() => setCreateOpen(true)}
                    >
                      <FolderPlus className="mr-2 h-4 w-4" />
                      <span>{t("createNewFolder")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setTitleError("");
                    setNewTitle(p.title);
                    setRenameOpen(true);
                  }}
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

      {/* Dialog rinomina (con validazione titolo) */}
      <AlertDialog
        open={renameOpen}
        onOpenChange={(open) => {
          setRenameOpen(open);
          if (!open) {
            setTitleError("");
            setSaving(false);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{d("renameProjectTitle")}</AlertDialogTitle>
          </AlertDialogHeader>

          <div className="grid gap-2">
            <label
              htmlFor="new-title"
              className="text-sm text-muted-foreground"
            >
              {d("newTitle")}
            </label>
            <Input
              id="new-title"
              value={newTitle}
              onChange={(e) => {
                setNewTitle(e.target.value);
                if (titleError) setTitleError("");
              }}
              aria-invalid={!!titleError}
              aria-describedby={titleError ? "title-error" : undefined}
              autoFocus
            />
            {titleError ? (
              <p id="title-error" className="text-xs text-red-600">
                {titleError}
              </p>
            ) : null}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>
              {d("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction onClick={onRenameSubmit} disabled={saving}>
              {saving ? d("saving") ?? "..." : d("save")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog elimina */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{d("deleteProjectTitle")}</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{d("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={onDelete}
            >
              {t("delete")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

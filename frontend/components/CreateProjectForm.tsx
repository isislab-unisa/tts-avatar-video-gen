// components/CreateProjectForm.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, type ProjectForm } from "@/lib/schema/project";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  generateVideoAction,
  saveProjectAction,
} from "@/app/(no-nav)/dashboard/project/_actions";
import { CreateDirectoryDialog } from "@/components/CreateDirectoryDialog";
import { Folder, Plus } from "lucide-react";

type DirectoryDTO = { id: string; name: string };

const AVATARS = [{ id: "cody", name: "Cody", image: "/cody.png" }] as const;

// base64 -> Blob
function base64ToBlob(base64: string, mime = "video/mp4") {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++)
    byteNumbers[i] = byteChars.charCodeAt(i);
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mime });
}

export default function CreateProjectForm({
  directories,
}: {
  directories: DirectoryDTO[];
}) {
  const router = useRouter();

  const [openCreateDir, setOpenCreateDir] = React.useState(false);
  const [avatar, setAvatar] =
    React.useState<(typeof AVATARS)[number]["id"]>("cody");
  const [bgColor] = React.useState("#000000"); // disabilitato
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [videoBase64, setVideoBase64] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [autoSaveDir, setAutoSaveDir] = React.useState<DirectoryDTO | null>(
    null
  );

  const { register, formState, setValue, getValues } = useForm<ProjectForm>({
    resolver: zodResolver(projectSchema),
    defaultValues: { title: "", text: "", avatar: "cody", bgColor: undefined },
  });

  React.useEffect(() => {
    setValue("avatar", avatar as ProjectForm["avatar"]);
  }, [avatar, setValue]);

  const selected = React.useMemo(
    () => AVATARS.find((a) => a.id === avatar) ?? AVATARS[0],
    [avatar]
  );

  async function onGenerate() {
    const text = getValues("text");
    if (!text?.trim()) return toast.error("Inserisci il testo");

    setIsGenerating(true);
    const res = await generateVideoAction({
      text,
      avatar: avatar as "cody",
      bgColor,
    });
    setIsGenerating(false);

    if (!res.ok) return toast.error(res.message);

    setVideoBase64(res.base64);
    const blob = base64ToBlob(res.base64, "video/mp4");
    setPreviewUrl(URL.createObjectURL(blob));
    toast.success("Video generato");

    if (autoSaveDir) {
      const vals = getValues();
      const save = await saveProjectAction({
        title: vals.title,
        text: vals.text,
        avatar: avatar as "cody",
        avatarImage: selected.image,
        directoryId: autoSaveDir.id,
        base64Video: res.base64,
      });
      if (save.ok) {
        toast.success(`Progetto salvato in “${autoSaveDir.name}”`);
        setAutoSaveDir(null);
        router.push(`/dashboard/project/${save.id}`);
      } else {
        toast.error(save.message);
      }
    }
  }

  function onDownload() {
    if (!videoBase64) return;
    const blob = base64ToBlob(videoBase64, "video/mp4");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${getValues("title") || "video"}.mp4`;
    a.click();
  }

  async function onSaveTo(directoryId: string) {
    if (!videoBase64) return toast.error("Genera prima il video");
    const vals = getValues();
    const res = await saveProjectAction({
      title: vals.title,
      text: vals.text,
      avatar: avatar as "cody",
      avatarImage: selected.image,
      directoryId,
      base64Video: videoBase64,
    });

    if (res.ok) {
      toast.success("Progetto salvato");
      router.push(`/dashboard/project/${res.id}`);
    } else {
      toast.error(res.message);
    }
  }

  return (
    // ⬇️ Centro verticalmente tutta la sezione (no “in alto”)
    <div className="mx-auto max-w-6xl w-full min-h-[calc(100vh-10rem)] grid place-items-center">
      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8 w-full">
        {/* Player: NESSUN bg grigio */}
        <div className="rounded-xl overflow-hidden bg-transparent">
          <div className="w-full aspect-video">
            {!previewUrl ? (
              <Image
                src={selected.image}
                alt={selected.name}
                width={640}
                height={360}
                className="h-full w-full object-contain"
                priority
              />
            ) : (
              <video
                src={previewUrl}
                controls
                className="h-full w-full object-contain"
              />
            )}
          </div>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label className="leading-none">Titolo</Label>
            <Input placeholder="Titolo progetto" {...register("title")} />
            {formState.errors.title && (
              <p className="text-sm text-red-600">
                {formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label className="leading-none">Testo</Label>
            <Textarea
              placeholder="Inserisci il testo…"
              className="min-h-[120px] md:min-h-[140px]"
              {...register("text")}
            />
            {formState.errors.text && (
              <p className="text-sm text-red-600">
                {formState.errors.text.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div className="grid gap-2">
              <Label className="leading-none">Avatar</Label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="justify-between h-10">
                    <span className="flex items-center gap-2">
                      <Image
                        src={selected.image}
                        alt={selected.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                      {selected.name}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {AVATARS.map((a) => (
                    <DropdownMenuItem
                      key={a.id}
                      className="cursor-pointer"
                      onClick={() => setAvatar(a.id)}
                    >
                      <Image
                        src={a.image}
                        alt={a.name}
                        width={20}
                        height={20}
                        className="rounded-full mr-2"
                      />
                      <span>{a.name}</span>
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>
                    Altre voci in arrivo…
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="grid gap-2">
              <Label className="leading-none">Colore background</Label>
              <Input value={bgColor} disabled className="h-10" />
              <p className="text-xs text-muted-foreground mt-1">
                disponibile a breve
              </p>
            </div>
          </div>

          <Separator />

          {/* Bottoni centrati */}
          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={onGenerate}
              disabled={isGenerating}
              className="min-w-[140px]"
            >
              {isGenerating
                ? "Generazione..."
                : autoSaveDir
                ? "Genera & Salva"
                : "Genera"}
            </Button>

            <Button
              variant="outline"
              onClick={onDownload}
              disabled={!videoBase64}
              className="min-w-[140px]"
            >
              Download
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button disabled={!videoBase64} className="min-w-[140px]">
                  Salva
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72">
                {directories.map((d) => (
                  <DropdownMenuItem
                    key={d.id}
                    className="cursor-pointer"
                    onClick={() => onSaveTo(d.id)}
                  >
                    <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{d.name}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setOpenCreateDir(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Crea nuova cartella…</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Dialog crea directory → auto-save alla prossima "Genera" */}
      <CreateDirectoryDialog
        open={openCreateDir}
        onOpenChange={(v: boolean) => setOpenCreateDir(v)}
        onCreated={(dir) => {
          setAutoSaveDir(dir);
          setOpenCreateDir(false);
          toast.success(
            `Cartella “${dir.name}” creata. Alla prossima Genera salvo lì.`
          );
        }}
      />
    </div>
  );
}

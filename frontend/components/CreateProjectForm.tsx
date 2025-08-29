// components/CreateProjectForm.tsx
"use client";

import * as React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getProjectCreateSchema,
  type ProjectCreateForm,
} from "@/lib/schema/project";
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
import { generateVideoAction } from "@/app/(no-nav)/dashboard/project/_actions";
import { useTranslations, useLocale } from "next-intl";
import { CreateDirectoryDialog } from "@/components/CreateDirectoryDialog";
import { Folder, Plus } from "lucide-react";

type DirectoryDTO = { id: string; name: string };

// ⟵ tipo di risposta della server action token
type TokenResp = { ok: true; token: string } | { ok: false; message?: string };

const API = process.env.NEXT_PUBLIC_BACKEND_API_URL!;
const AVATAR_ID = "cody";
const AVATAR_IMG = "/cody.png";

function base64ToBlob(base64: string, mime = "video/mp4") {
  const byteChars = atob(base64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export default function CreateProjectForm({
  directories,
  getApiToken, // ⟵ server action passata dal server
}: {
  directories: DirectoryDTO[];
  getApiToken: () => Promise<TokenResp>;
}) {
  const router = useRouter();
  const tv = useTranslations("Validation");
  const locale = useLocale();
  const schema = React.useMemo(() => getProjectCreateSchema(tv), [tv]);

  const [openCreateDir, setOpenCreateDir] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [videoBase64, setVideoBase64] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [bgColor] = React.useState("#000000");

  const { register, formState, getValues, trigger, reset, clearErrors } =
    useForm<ProjectCreateForm>({
      resolver: zodResolver(schema),
      defaultValues: {
        title: "",
        text: "",
        avatar: AVATAR_ID,
        bgColor: undefined,
      },
      mode: "onSubmit",
    });

  React.useEffect(() => {
    clearErrors();
  }, [locale, clearErrors]);

  async function onGenerate() {
    const ok = await trigger(["title", "text"], { shouldFocus: true });
    if (!ok) {
      toast.error("Correggi i campi evidenziati");
      return;
    }
    const { text } = getValues();
    setIsGenerating(true);
    const res = await generateVideoAction({ text, avatar: AVATAR_ID, bgColor });
    setIsGenerating(false);
    if (!res.ok) return toast.error(res.message);
    setVideoBase64(res.base64);
    setPreviewUrl(URL.createObjectURL(base64ToBlob(res.base64)));
    toast.success("Video generato");
  }

  function onDownload() {
    if (!videoBase64) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(base64ToBlob(videoBase64));
    a.download = `${getValues("title") || "video"}.mp4`;
    a.click();
  }

  async function saveTo(directoryId: string) {
    if (!videoBase64) return toast.error("Genera prima il video");

    const tk = await getApiToken(); // ⟵ uso la prop
    if (!tk.ok) return toast.error(tk.message);

    const vals = getValues();
    const form = new FormData();
    form.set("title", vals.title);
    form.set("text", vals.text);
    form.set("avatar", AVATAR_ID);
    form.set("avatarImage", AVATAR_IMG);
    form.set("directoryId", directoryId);
    form.set("video", base64ToBlob(videoBase64), "output.mp4");

    try {
      const res = await fetch(`${API}/api/projects`, {
        method: "POST",
        headers: { Authorization: `Bearer ${tk.token}` },
        body: form,
      });
      if (!res.ok) {
        const msg = await res.text().catch(() => "");
        throw new Error(msg || `Errore salvataggio (${res.status})`);
      }
      const data = (await res.json()) as { id: string };
      toast.success("Progetto salvato");
      reset();
      router.push(`/dashboard/project/${data.id}`);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <div className="min-h-[calc(100vh-8rem)] grid place-items-center">
      <div className="mx-auto max-w-6xl w-full grid gap-8 lg:grid-cols-2 items-center">
        <div className="rounded-2xl overflow-hidden">
          <div className="w-full aspect-video">
            {!previewUrl ? (
              <Image
                src={AVATAR_IMG}
                alt="Cody"
                width={1280}
                height={720}
                className="h-full w-full object-contain rounded-2xl"
                priority
              />
            ) : (
              <video
                src={previewUrl}
                controls
                className="h-full w-full object-contain rounded-2xl"
              />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Titolo</Label>
            <Input placeholder="Titolo progetto" {...register("title")} />
            {formState.errors.title && (
              <p className="text-sm text-red-600">
                {formState.errors.title.message}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Testo</Label>
            <Textarea
              placeholder="Inserisci il testo…"
              className="min-h-[140px]"
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
              <Label>Avatar</Label>
              <Button
                variant="outline"
                className="justify-start gap-2"
                type="button"
              >
                <Image
                  src={AVATAR_IMG}
                  alt="Cody"
                  width={20}
                  height={20}
                  className="rounded"
                />
                Cody
              </Button>
              <p className="text-xs text-muted-foreground">
                altri avatar presto
              </p>
            </div>

            <div className="grid gap-2">
              <Label>Colore background</Label>
              <Input value={bgColor} disabled />
              <p className="text-xs text-muted-foreground">
                disponibile a breve
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex flex-wrap justify-center gap-3">
            <Button
              onClick={onGenerate}
              disabled={isGenerating}
              className="min-w-[140px]"
              type="button"
            >
              {isGenerating ? "Generazione..." : "Genera"}
            </Button>
            <Button
              variant="outline"
              onClick={onDownload}
              disabled={!videoBase64}
              className="min-w-[140px]"
              type="button"
            >
              Download
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  disabled={!videoBase64}
                  className="min-w-[140px]"
                  type="button"
                >
                  Salva
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 z-50">
                {directories.map((d) => (
                  <DropdownMenuItem
                    key={d.id}
                    className="cursor-pointer"
                    onSelect={(e) => {
                      e.preventDefault();
                      void saveTo(d.id);
                    }}
                  >
                    <Folder className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>{d.name}</span>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setOpenCreateDir(true)}
                  disabled={!videoBase64}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  <span>Crea nuova cartella…</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <CreateDirectoryDialog
        open={openCreateDir}
        onOpenChange={setOpenCreateDir}
        onCreated={(dir) => {
          setOpenCreateDir(false);
          if (videoBase64) void saveTo(dir.id);
          else toast.error("Genera prima il video");
        }}
      />
    </div>
  );
}

"use client";

import * as React from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getCreateDirectorySchema,
  type CreateDirectoryForm,
} from "@/lib/schema/project";
import {
  createDirectoryAction,
  type DirectoryDTO,
} from "@/app/(no-nav)/dashboard/_actions/directories";
import { toast } from "sonner";
import { useTranslations, useLocale } from "next-intl";
import { useTranslations as useToastTranslations } from "next-intl";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: (dir: DirectoryDTO) => void;
};

export function CreateDirectoryDialog({
  open,
  onOpenChange,
  onCreated,
}: Props) {
  const td = useTranslations("Dialog");
  const tm = useToastTranslations("Toast");
  const tv = useTranslations("Validation");
  const locale = useLocale();
  const schema = React.useMemo(() => getCreateDirectorySchema(tv), [tv]);
  const { register, handleSubmit, formState, reset, setError, clearErrors } =
    useForm<CreateDirectoryForm>({
      resolver: zodResolver(schema),
      defaultValues: { name: "" },
      mode: "onSubmit",
    });
  const [pending, start] = React.useTransition();

  React.useEffect(() => {
    clearErrors();
  }, [locale, clearErrors]);

  const onSubmit = (values: CreateDirectoryForm) => {
    const fd = new FormData();
    fd.set("name", values.name);
    start(async () => {
      const res = await createDirectoryAction(fd);
      if (res.ok) {
        toast.success(tm("directoryCreated"));
        if (res.dir) onCreated?.(res.dir);
        reset();
        onOpenChange(false);
      } else if (res.field === "name") {
        setError("name", { type: "server", message: res.message });
      } else {
        toast.error(res.message || "Errore");
      }
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) reset();
      }}
    >
      <AlertDialogContent className="sm:max-w-[420px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{td("createDirTitle")}</AlertDialogTitle>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <div className="grid gap-2">
            <Label
              htmlFor="dir-name"
              className={formState.errors.name ? "text-red-600" : ""}
            >
              {td("nameLabel")}
            </Label>
            <Input
              id="dir-name"
              placeholder="e.g. Playground"
              autoFocus
              aria-invalid={!!formState.errors.name}
              {...register("name")}
            />
            {formState.errors.name && (
              <p className="text-sm text-red-600">
                {formState.errors.name.message}
              </p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={pending}>
              {td("cancel")}
            </AlertDialogCancel>
            <Button type="submit" disabled={pending}>
              {pending ? td("creating") : td("save")}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

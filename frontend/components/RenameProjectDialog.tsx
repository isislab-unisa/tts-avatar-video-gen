"use client";

import * as React from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getProjectRenameSchema,
  type ProjectRenameForm,
} from "@/lib/schema/project";
import { renameProjectAction } from "@/app/(no-nav)/dashboard/_actions/projects";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  defaultTitle: string;
  onRenamed?: (newTitle: string) => void;
};

export default function RenameProjectDialog({
  open,
  onOpenChange,
  projectId,
  defaultTitle,
  onRenamed,
}: Props) {
  const td = useTranslations("Dialog");
  const tv = useTranslations("Validation");
  const locale = useLocale();
  const schema = React.useMemo(() => getProjectRenameSchema(tv), [tv]);

  const { register, handleSubmit, formState, reset, setError, clearErrors } =
    useForm<ProjectRenameForm>({
      resolver: zodResolver(schema),
      mode: "onSubmit",
      defaultValues: { title: defaultTitle },
    });

  React.useEffect(() => {
    clearErrors();
  }, [locale, clearErrors]);

  React.useEffect(() => {
    if (open) {
      reset({ title: defaultTitle });
    }
  }, [open, defaultTitle, reset]);

  const [pending, start] = React.useTransition();

  const onSubmit = (values: ProjectRenameForm) => {
    const nextTitle = values.title.trim();
    if (nextTitle === defaultTitle.trim()) {
      setError("title", { type: "manual", message: tv("sameName") });
      return;
    }
    start(async () => {
      const res = await renameProjectAction(projectId, nextTitle);
      if (typeof res === "object") {
        if (!res.ok && res.field === "title") {
          setError("title", { type: "server", message: res.message });
          return;
        }
        if (res.ok) {
          toast.success(td("save"));
          onRenamed?.(values.title);
          onOpenChange(false);
          return;
        }
        toast.error(res.message || "Error");
        return;
      }
      if (res) {
        toast.success(td("save"));
        onRenamed?.(values.title);
        onOpenChange(false);
      } else {
        toast.error("Error");
      }
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          reset({ title: defaultTitle });
          clearErrors();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{td("renameProjectTitle")}</AlertDialogTitle>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <div className="grid gap-2">
            <label
              htmlFor="new-title"
              className="text-sm text-muted-foreground"
            >
              {td("newTitle")}
            </label>
            <Input
              id="new-title"
              aria-invalid={!!formState.errors.title}
              aria-describedby={
                formState.errors.title ? "title-error" : undefined
              }
              autoFocus
              {...register("title")}
            />
            {formState.errors.title ? (
              <p id="title-error" className="text-xs text-red-600">
                {formState.errors.title.message}
              </p>
            ) : null}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel type="button" disabled={pending}>
              {td("cancel")}
            </AlertDialogCancel>
            <Button type="submit" disabled={pending}>
              {pending ? td("saving") : td("save")}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

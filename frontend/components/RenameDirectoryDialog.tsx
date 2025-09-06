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
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  getCreateDirectorySchema,
  type CreateDirectoryForm,
} from "@/lib/schema/project";
import { renameDirectoryAction } from "@/app/(no-nav)/dashboard/_actions/directories";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  directoryId: string;
  defaultName: string;
  onRenamed?: (newName: string) => void;
};

export default function RenameDirectoryDialog({
  open,
  onOpenChange,
  directoryId,
  defaultName,
  onRenamed,
}: Props) {
  const td = useTranslations("Dialog");
  const tv = useTranslations("Validation");
  const locale = useLocale();
  const schema = React.useMemo(() => getCreateDirectorySchema(tv), [tv]);

  const { register, handleSubmit, formState, reset, setError, clearErrors } =
    useForm<CreateDirectoryForm>({
      resolver: zodResolver(schema),
      mode: "onSubmit",
      defaultValues: { name: defaultName },
    });

  React.useEffect(() => {
    clearErrors();
  }, [locale, clearErrors]);

  React.useEffect(() => {
    if (open) {
      reset({ name: defaultName });
    }
  }, [open, defaultName, reset]);

  const [pending, start] = React.useTransition();

  const onSubmit = (values: CreateDirectoryForm) => {
    const nextName = values.name.trim();
    if (nextName === defaultName.trim()) {
      setError("name", { type: "manual", message: tv("sameName") });
      return;
    }
    start(async () => {
      const res = await renameDirectoryAction(directoryId, nextName);
      if (res.ok) {
        onRenamed?.(nextName);
        onOpenChange(false);
        return;
      }
      if (res.field === "name") {
        setError("name", { type: "server", message: res.message });
      }
    });
  };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          reset({ name: defaultName });
          clearErrors();
        }
      }}
    >
      <AlertDialogContent className="sm:max-w-[420px]">
        <AlertDialogHeader>
          <AlertDialogTitle>{td("renameDirectoryTitle")}</AlertDialogTitle>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <div className="grid gap-2">
            <Label
              htmlFor="dir-new-name"
              className={formState.errors.name ? "text-red-600" : ""}
            >
              {td("nameLabel")}
            </Label>
            <Input
              id="dir-new-name"
              aria-invalid={!!formState.errors.name}
              aria-describedby={
                formState.errors.name ? "name-error" : undefined
              }
              autoFocus
              {...register("name")}
            />
            {formState.errors.name ? (
              <p id="name-error" className="text-sm text-red-600">
                {formState.errors.name.message}
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

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
import { directorySchema, type DirectoryForm } from "@/lib/schema/directory";
import {
  createDirectoryAction,
  type DirectoryDTO,
} from "@/app/(no-nav)/dashboard/_actions/directories";
import { toast } from "sonner";

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
  const { register, handleSubmit, formState, reset, setError } =
    useForm<DirectoryForm>({
      resolver: zodResolver(directorySchema),
      defaultValues: { name: "" },
    });
  const [pending, start] = React.useTransition();

  const onSubmit = (values: DirectoryForm) => {
    const fd = new FormData();
    fd.set("name", values.name);
    start(async () => {
      const res = await createDirectoryAction(fd);
      if (res.ok) {
        toast.success("Directory creata");
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
          <AlertDialogTitle>Create Directory</AlertDialogTitle>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <div className="grid gap-2">
            <Label
              htmlFor="dir-name"
              className={formState.errors.name ? "text-red-600" : ""}
            >
              Name
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
              Cancel
            </AlertDialogCancel>
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create"}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}

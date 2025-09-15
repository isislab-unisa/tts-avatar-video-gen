"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => Promise<void> | void;
  pending?: boolean;
};

export default function ConfirmDeleteDialog({
  open,
  onOpenChange,
  title,
  confirmLabel,
  cancelLabel,
  onConfirm,
  pending: pendingProp,
}: Props) {
  const td = useTranslations("Dialog");
  const [isPending, start] = React.useTransition();
  const pending = pendingProp ?? isPending;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title ?? td("deleteProjectTitle")}
          </AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending} className="cursor-pointer">
            {cancelLabel ?? td("cancel")}
          </AlertDialogCancel>
          <Button
            className="bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white cursor-pointer"
            disabled={pending}
            onClick={() => start(async () => void onConfirm())}
          >
            {confirmLabel ?? td("delete")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

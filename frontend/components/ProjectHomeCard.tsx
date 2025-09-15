"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { type ProjectListItem } from "@/app/(no-nav)/dashboard/_actions/projects";
import { type DirectoryDTO } from "@/lib/schema/directory";
import ProjectActionMenu from "@/components/ProjectActionMenu";
// import { formatDateTime } from "@/lib/date-utils";

// Funzione di formattazione data direttamente nel componente
function formatDateTime(dateString: string, locale: string = "it"): string {
  if (!dateString || dateString === "") {
    return "Data non disponibile";
  }

  // Il database salva le date in UTC, le interpretiamo come locali
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    return "Data non valida";
  }

  // Usa i metodi locali per ottenere i valori corretti
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const hours = date.getHours();
  const minutes = date.getMinutes();

  const seconds = date.getSeconds();

  if (locale === "en") {
    const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    const ampm = hours < 12 ? "AM" : "PM";
    return `${month}/${day}/${year}, ${hour12}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")} ${ampm}`;
  } else {
    return `${day}/${month}/${year}, ${hours
      .toString()
      .padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  }
}

type Props = {
  item: ProjectListItem;
  directories: DirectoryDTO[];
  showFolder?: boolean;
  currentDirId?: string;
};

export default function ProjectHomeCard({
  item,
  directories,
  showFolder,
  currentDirId,
}: Props) {
  const router = useRouter();
  const tProj = useTranslations("Project");
  const locale = useLocale();

  const dirName =
    directories.find((d) => d.id === item.directoryId)?.name ?? "—";

  const goToDetail = React.useCallback(() => {
    router.push(`/dashboard/project/${item.id}`);
  }, [router, item.id]);

  const handleProjectUpdated = () => {
    // Aggiorna solo i dati del server senza ricaricare completamente la pagina
    router.refresh();
  };

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={(e) => {
        if (e.target instanceof Element) {
          const isMenuClick = e.target.closest(
            '[role="menuitem"], [data-radix-collection-item], button, [data-radix-dropdown-menu-trigger], [data-radix-dropdown-menu-content], [role="dialog"], [data-radix-dialog-content], input, textarea, form, [data-radix-dialog-overlay]'
          );
          if (isMenuClick) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }
        goToDetail();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          goToDetail();
        }
      }}
      className="group rounded-xl bg-card hover:bg-muted/40 transition-colors overflow-hidden border cursor-pointer focus:outline-none"
    >
      <div className="aspect-[16/11] w-full bg-muted relative">
        <Image
          src={item.avatarImage || "/cody.png"}
          alt="preview"
          fill
          sizes="(max-width:768px) 100vw, (max-width:1280px) 50vw, 20vw"
          className="object-cover"
          priority={false}
        />
      </div>

      <div className="p-3 relative">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground uppercase">
              {item.avatar || "cody"}
            </div>

            <div
              className="block truncate font-medium text-sm"
              title={item.title}
            >
              {item.title}
            </div>

            {showFolder && (
              <div className="text-xs text-muted-foreground truncate">
                {tProj("folder")}: {dirName}
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              {tProj("createdOn")} {formatDateTime(item.createdAt, locale)}
            </div>
          </div>

          <ProjectActionMenu
            project={item}
            directories={directories}
            currentDirId={currentDirId || item.directoryId}
            onProjectUpdated={handleProjectUpdated}
            className="shrink-0"
            size="default"
            variant="ghost"
          />
        </div>
      </div>
    </div>
  );
}

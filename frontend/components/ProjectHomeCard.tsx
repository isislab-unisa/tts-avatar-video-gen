"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { type ProjectListItem } from "@/app/(no-nav)/dashboard/_actions/projects";
import { type DirectoryDTO } from "@/app/(no-nav)/dashboard/_actions/directories";
import ProjectMenu from "@/components/ProjectMenu";

type Props = {
  item: ProjectListItem;
  directories: DirectoryDTO[];
  showFolder?: boolean;
};

export default function ProjectHomeCard({
  item,
  directories,
  showFolder,
}: Props) {
  const router = useRouter();
  const tProj = useTranslations("Project");

  const dirName =
    directories.find((d) => d.id === item.directoryId)?.name ?? "—";

  const goToDetail = React.useCallback(() => {
    router.push(`/dashboard/project/${item.id}`);
  }, [router, item.id]);

  const handleProjectUpdated = () => {
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
            <div className="text-[11px] text-muted-foreground uppercase">
              {item.avatar || "cody"}
            </div>

            <div
              className="block truncate font-medium text-sm"
              title={item.title}
            >
              {item.title}
            </div>

            {showFolder && (
              <div className="text-[11px] text-muted-foreground truncate">
                {tProj("folder")}: {dirName}
              </div>
            )}

            <div className="text-[11px] text-muted-foreground">
              {new Date(item.createdAt).toLocaleDateString()}
            </div>
          </div>

          <ProjectMenu
            project={item}
            directories={directories}
            currentDirId={item.directoryId}
            onProjectUpdated={handleProjectUpdated}
            className="shrink-0"
            size="md"
            variant="ghost"
          />
        </div>
      </div>
    </div>
  );
}

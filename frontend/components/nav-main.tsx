"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ChevronRight,
  MoreHorizontal,
  Trash2,
  FolderEdit,
  FolderOpen,
} from "lucide-react";
import ProjectActionMenu from "@/components/ProjectActionMenu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { deleteDirectoryAction } from "@/app/(no-nav)/dashboard/_actions/directories";
import { type DirectoryDTO } from "@/lib/schema/directory";
import { listProjectsByDirAction } from "@/app/(no-nav)/dashboard/_actions/projects";
import { CreateDirectoryDialog } from "@/components/CreateDirectoryDialog";
import RenameDirectoryDialog from "@/components/RenameDirectoryDialog";
import { type ProjectListItem } from "@/app/(no-nav)/dashboard/_actions/projects";

const iconCls = "mr-2 h-4 w-4";

export type NavItem = {
  title: string;
  url: string;
  icon?: React.ComponentType<{ className?: string }>;
  isActive?: boolean;
  meta?: { id?: string };
  items?: {
    title: string;
    url: string;
    type?: "project" | "link";
    id?: string;
  }[];
};

export function NavMain({
  items,
  directories = [],
}: {
  items: NavItem[];
  directories?: DirectoryDTO[];
}) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const t = useTranslations("Dialog");
  const tCommon = useTranslations("Common");

  const [confirm, setConfirm] = React.useState<{
    open: boolean;
    dirId?: string;
    dirName?: string;
  }>({ open: false });
  const [rename, setRename] = React.useState<{
    open: boolean;
    dirId?: string;
    name: string;
  }>({ open: false, name: "" });
  const [createOpen, setCreateOpen] = React.useState(false);

  const [openDirs, setOpenDirs] = React.useState<Record<string, boolean>>({});
  const [dirProjects, setDirProjects] = React.useState<
    Record<string, ProjectListItem[]>
  >({});
  const [loadingDirs, setLoadingDirs] = React.useState<Record<string, boolean>>(
    {}
  );
  const [dirUpdates, setDirUpdates] = React.useState<Record<string, number>>(
    {}
  );

  // Listener per aggiornare la cache quando un progetto viene eliminato
  React.useEffect(() => {
    const handleProjectDeleted = (event: CustomEvent) => {
      const { directoryId, projectId } = event.detail;

      // Rimuovi il progetto da tutte le cartelle aperte per evitare duplicati
      setDirProjects((prev) => {
        const updated = { ...prev };

        // Rimuovi il progetto da tutte le cartelle nella cache
        Object.keys(updated).forEach((dirId) => {
          if (updated[dirId]) {
            updated[dirId] = updated[dirId].filter((p) => p.id !== projectId);
          }
        });

        if (!directoryId) {
          setTimeout(() => {
            router.refresh();
          }, 0);
        }

        return updated;
      });
    };

    const handleProjectRenamed = (event: CustomEvent) => {
      const { projectId, newTitle, directoryId } = event.detail;

      // Aggiorna il titolo del progetto solo nella cartella specifica
      setDirProjects((prev) => {
        const updated = { ...prev };

        // Aggiorna solo se la cartella è aperta e contiene il progetto
        if (directoryId && updated[directoryId]) {
          updated[directoryId] = updated[directoryId].map((p) =>
            p.id === projectId ? { ...p, title: newTitle } : p
          );

          // Aggiorna solo questa cartella specifica
          if (openDirs[directoryId]) {
            setDirUpdates((prev) => ({
              ...prev,
              [directoryId]: (prev[directoryId] || 0) + 1,
            }));
          }
        }

        return updated;
      });
    };

    const handleProjectMoved = (event: CustomEvent) => {
      const { projectId, oldDirectoryId, newDirectoryId, projectTitle } =
        event.detail;

      setDirProjects((prev) => {
        const updated = { ...prev };

        // Rimuovi il progetto dalla cartella di partenza (se è aperta)
        if (oldDirectoryId && updated[oldDirectoryId]) {
          updated[oldDirectoryId] = updated[oldDirectoryId].filter(
            (p) => p.id !== projectId
          );
        }

        // Se oldDirectoryId non è specificato o la cartella non è in cache,
        // rimuovi il progetto da tutte le cartelle aperte per evitare duplicati
        if (!oldDirectoryId || !updated[oldDirectoryId]) {
          Object.keys(updated).forEach((dirId) => {
            if (updated[dirId]) {
              updated[dirId] = updated[dirId].filter((p) => p.id !== projectId);
            }
          });
        }

        // Aggiungi il progetto alla directory nuova (se è aperta e non è già presente)
        if (newDirectoryId && openDirs[newDirectoryId]) {
          if (!updated[newDirectoryId]) {
            updated[newDirectoryId] = [];
          }
          // Controlla se il progetto è già presente nella cartella di destinazione
          const isAlreadyPresent = updated[newDirectoryId].some(
            (p) => p.id === projectId
          );
          if (!isAlreadyPresent) {
            const newProject = {
              id: projectId,
              title: projectTitle,
              createdAt: new Date().toISOString(),
              avatar: "cody",
              avatarImage: "/cody.png",
              directoryId: newDirectoryId,
              directoryName: undefined,
              text: "", // Aggiungi campo text vuoto per evitare problemi di rendering
              downloadUrl: "", // Aggiungi campo downloadUrl vuoto
            } as ProjectListItem & { text?: string; downloadUrl?: string };

            updated[newDirectoryId] = [...updated[newDirectoryId], newProject];
          }
        }
        return updated;
      });
    };

    const handleProjectCreated = (event: CustomEvent) => {
      const { directoryId, projectId, projectTitle } = event.detail;

      // Aggiungi il progetto alla cartella se è aperta
      if (directoryId && openDirs[directoryId]) {
        setDirProjects((prev) => {
          const updated = { ...prev };
          if (!updated[directoryId]) {
            updated[directoryId] = [];
          }

          // Controlla se il progetto è già presente
          const isAlreadyPresent = updated[directoryId].some(
            (p) => p.id === projectId
          );
          if (!isAlreadyPresent) {
            const newProject = {
              id: projectId,
              title: projectTitle,
              createdAt: new Date().toISOString(),
              avatar: "cody",
              avatarImage: "/cody.png",
              directoryId: directoryId,
              directoryName: undefined,
              text: "", // Aggiungi campo text vuoto per evitare problemi di rendering
              downloadUrl: "", // Aggiungi campo downloadUrl vuoto
            } as ProjectListItem & { text?: string; downloadUrl?: string };

            updated[directoryId] = [...updated[directoryId], newProject];
          }
          return updated;
        });
      }
    };

    const handleDirectoryCreated = () => {
      // Refresh the page to update the sidebar with new directories
      router.refresh();
    };

    window.addEventListener(
      "projectDeleted",
      handleProjectDeleted as EventListener
    );
    window.addEventListener(
      "projectRenamed",
      handleProjectRenamed as EventListener
    );
    window.addEventListener(
      "projectMoved",
      handleProjectMoved as EventListener
    );
    window.addEventListener(
      "projectCreated",
      handleProjectCreated as EventListener
    );
    window.addEventListener(
      "directoryCreated",
      handleDirectoryCreated as EventListener
    );

    return () => {
      window.removeEventListener(
        "projectDeleted",
        handleProjectDeleted as EventListener
      );
      window.removeEventListener(
        "projectRenamed",
        handleProjectRenamed as EventListener
      );
      window.removeEventListener(
        "projectMoved",
        handleProjectMoved as EventListener
      );
      window.removeEventListener(
        "projectCreated",
        handleProjectCreated as EventListener
      );
      window.removeEventListener(
        "directoryCreated",
        handleDirectoryCreated as EventListener
      );
    };
  }, [openDirs, router, dirUpdates]);

  async function remove(dirId: string) {
    const ok = await deleteDirectoryAction(dirId);
    if (ok) {
      setConfirm({ open: false, dirId: "", dirName: "" });
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function onToggle(dirId: string, open: boolean) {
    setOpenDirs((s) => ({ ...s, [dirId]: open }));
    if (open) {
      // Controlla se abbiamo già i progetti in cache
      if (dirProjects[dirId] && dirProjects[dirId].length > 0) {
        return; // Non ricaricare se abbiamo già i dati
      }

      // Ricarica i progetti quando si apre una cartella
      setLoadingDirs((s) => ({ ...s, [dirId]: true }));
      try {
        const res = await listProjectsByDirAction(dirId, 1, 50, "title", "asc");
        setDirProjects((s) => ({ ...s, [dirId]: res.items || [] }));
      } catch (error) {
        console.error("Error loading projects:", error);
        setDirProjects((s) => ({ ...s, [dirId]: [] }));
      } finally {
        setLoadingDirs((s) => ({ ...s, [dirId]: false }));
      }
    }
  }

  return (
    <>
      <CreateDirectoryDialog
        open={createOpen}
        onOpenChange={(o) => {
          setCreateOpen(o);
          if (!o) router.refresh();
        }}
      />

      <RenameDirectoryDialog
        open={rename.open}
        onOpenChange={(o) => setRename({ ...rename, open: o })}
        directoryId={rename.dirId || ""}
        defaultName={rename.name}
        onRenamed={() => {
          setRename({ open: false, dirId: "", name: "" });
          router.refresh();
        }}
      />

      <AlertDialog
        open={confirm.open}
        onOpenChange={(o) => setConfirm({ ...confirm, open: o })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("deleteDirectoryTitle")}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              {t("deleteDirectoryMessage", { name: confirm.dirName || "" })}
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={() => {
                if (confirm.dirId) {
                  remove(confirm.dirId);
                }
              }}
            >
              {t("delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <SidebarGroup>
        <SidebarMenu>
          {items.map((item) => {
            const dirId = item.meta?.id;
            return (
              <Collapsible
                key={item.title}
                asChild
                open={dirId ? openDirs[dirId] || false : false}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <div className="flex items-center gap-1 group/folder-item">
                    <SidebarMenuButton
                      asChild
                      className="cursor-pointer flex-1 pr-2"
                    >
                      <Link href={item.url}>
                        {dirId && openDirs[dirId] ? (
                          <FolderOpen className="h-4 w-4" />
                        ) : (
                          item.icon && <item.icon className="h-4 w-4" />
                        )}
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>

                    {dirId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction className="shrink-0 opacity-0 group-hover/folder-item:opacity-100 transition-opacity cursor-pointer right-8">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">More</span>
                          </SidebarMenuAction>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          className="w-52 rounded-lg"
                          side={isMobile ? "bottom" : "right"}
                          align={isMobile ? "end" : "start"}
                        >
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={() =>
                              setRename({ open: true, dirId, name: item.title })
                            }
                          >
                            <FolderEdit
                              className={`${iconCls} text-muted-foreground`}
                            />
                            {t("rename")}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-destructive focus:text-destructive"
                            onClick={() =>
                              setConfirm({
                                open: true,
                                dirId,
                                dirName: item.title,
                              })
                            }
                          >
                            <Trash2 className={`${iconCls} text-destructive`} />
                            {t("delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    <CollapsibleTrigger asChild>
                      <button
                        aria-label="Toggle"
                        className={`shrink-0 inline-flex items-center justify-center h-7 w-7 rounded hover:bg-muted/50 relative z-10 cursor-pointer transition-all duration-200 ${
                          dirId && openDirs[dirId] ? "rotate-90" : ""
                        }`}
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!dirId) return;
                          const next = !openDirs[dirId];
                          await onToggle(dirId, next);
                        }}
                      >
                        <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                      </button>
                    </CollapsibleTrigger>
                  </div>

                  <CollapsibleContent className="overflow-hidden data-[state=open]:animate-collapsible-down data-[state=closed]:animate-collapsible-up">
                    <SidebarMenuSub>
                      {dirId && loadingDirs[dirId] ? (
                        <SidebarMenuSubItem>
                          <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground">
                            <div className="animate-spin rounded-full h-3 w-3 border-b border-primary"></div>
                            <span className="text-xs">
                              {tCommon("loadingProjects")}
                            </span>
                          </div>
                        </SidebarMenuSubItem>
                      ) : dirId &&
                        dirProjects[dirId] &&
                        dirProjects[dirId].length > 0 ? (
                        <div
                          key={`projects-${dirId}-${dirUpdates[dirId] || 0}`}
                          className="animate-slide-in"
                        >
                          {dirProjects[dirId].map((sub) => (
                            <SidebarMenuSubItem
                              key={sub.id || sub.title}
                              className="group/project-item"
                            >
                              <div className="flex items-center w-full">
                                <SidebarMenuSubButton
                                  asChild
                                  className="cursor-pointer flex-1"
                                >
                                  <Link href={`/dashboard/project/${sub.id}`}>
                                    <span>{sub.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>

                                <ProjectActionMenu
                                  project={{
                                    id: sub.id || "",
                                    title: sub.title,
                                    directoryId: dirId,
                                    directoryName: item.title,
                                    createdAt:
                                      sub.createdAt || new Date().toISOString(),
                                    avatar: sub.avatar,
                                    avatarImage: sub.avatarImage,
                                  }}
                                  directories={directories
                                    .filter((d) => d.id !== dirId)
                                    .map((d) => ({ id: d.id, name: d.name }))}
                                  currentDirId={dirId}
                                  onProjectUpdated={() => {
                                    // Refresh the projects list when a project is updated
                                    if (dirId && openDirs[dirId]) {
                                      onToggle(dirId, true);
                                    }
                                  }}
                                />
                              </div>
                            </SidebarMenuSubItem>
                          ))}
                        </div>
                      ) : dirId &&
                        dirProjects[dirId] &&
                        dirProjects[dirId].length === 0 ? (
                        <SidebarMenuSubItem>
                          <div className="px-2 py-1 text-sm text-muted-foreground">
                            {tCommon("noProjectsInFolder")}
                          </div>
                        </SidebarMenuSubItem>
                      ) : null}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}

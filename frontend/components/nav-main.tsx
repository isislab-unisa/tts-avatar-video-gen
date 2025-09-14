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
import LoadingSpinner from "@/components/ui/loading-spinner";
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
      const { projectId, newTitle } = event.detail;

      // Aggiorna il titolo del progetto nella cache
      setDirProjects((prev) => {
        const updated = { ...prev };

        // Aggiorna il titolo del progetto in tutte le cartelle aperte
        const updatedDirs: string[] = [];
        Object.keys(updated).forEach((dirId) => {
          if (updated[dirId]) {
            updated[dirId] = updated[dirId].map((p) =>
              p.id === projectId ? { ...p, title: newTitle } : p
            );
            updatedDirs.push(dirId);
          }
        });

        if (updatedDirs.length > 0) {
          const updates: Record<string, number> = {};
          updatedDirs.forEach((dirId) => {
            if (openDirs[dirId]) {
              updates[dirId] = (dirUpdates[dirId] || 0) + 1;
            }
          });
          if (Object.keys(updates).length > 0) {
            setDirUpdates((prev) => ({ ...prev, ...updates }));
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

        // Aggiorna solo le cartelle specifiche, non tutte
        const updates: Record<string, number> = {};
        if (oldDirectoryId && openDirs[oldDirectoryId]) {
          updates[oldDirectoryId] = (dirUpdates[oldDirectoryId] || 0) + 1;
        }
        if (newDirectoryId && openDirs[newDirectoryId]) {
          updates[newDirectoryId] = (dirUpdates[newDirectoryId] || 0) + 1;
        }

        if (Object.keys(updates).length > 0) {
          setDirUpdates((prev) => ({ ...prev, ...updates }));
        }

        return updated;
      });
    };

    const handleProjectCreated = (event: CustomEvent) => {
      const { projectId, directoryId, projectTitle } = event.detail;

      // Aggiungi il progetto alla directory se è aperta e non è già presente
      if (directoryId && openDirs[directoryId]) {
        setDirProjects((prev) => {
          const updated = { ...prev };
          if (!updated[directoryId]) {
            updated[directoryId] = [];
          }
          // Controlla se il progetto è già presente nella cartella
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

    const handleDirectoryCreated = () => {};

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
      // Ricarica sempre i progetti quando si apre una cartella
      setLoadingDirs((s) => ({ ...s, [dirId]: true }));
      try {
        const res = await listProjectsByDirAction(dirId, 1, 50, "title", "asc");

        await new Promise((resolve) => setTimeout(resolve, 500));
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
                            <span>{t("renameFolder")}</span>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                            onClick={() =>
                              setConfirm({
                                open: true,
                                dirId,
                                dirName: item.title,
                              })
                            }
                          >
                            <Trash2 className={`${iconCls} text-red-600`} />
                            <span>{t("deleteFolder")}</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    <CollapsibleTrigger asChild>
                      <button
                        aria-label="Toggle"
                        className={`shrink-0 inline-flex items-center justify-center h-7 w-7 rounded hover:bg-muted/50 relative z-10 cursor-pointer ${
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

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {dirId && loadingDirs[dirId] ? (
                        <SidebarMenuSubItem>
                          <div className="flex items-center gap-2 px-2 py-1 text-sm text-muted-foreground">
                            <LoadingSpinner />
                            <span>{tCommon("loadingProjects")}</span>
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

                                {dirId && (
                                  <div className="opacity-0 group-hover/project-item:opacity-100 transition-opacity ml-auto">
                                    <ProjectActionMenu
                                      project={sub as ProjectListItem}
                                      directories={directories}
                                      currentDirId={dirId}
                                      onProjectUpdated={() => {
                                        // Ricarica i progetti per questa cartella
                                        const loadProjects = async () => {
                                          try {
                                            const res =
                                              await listProjectsByDirAction(
                                                dirId,
                                                1,
                                                50,
                                                "title",
                                                "asc"
                                              );
                                            setDirProjects((s) => ({
                                              ...s,
                                              [dirId]: res.items || [],
                                            }));
                                          } catch (error) {
                                            console.error(
                                              "Error loading projects:",
                                              error
                                            );
                                            setDirProjects((s) => ({
                                              ...s,
                                              [dirId]: [],
                                            }));
                                          }
                                        };
                                        void loadProjects();
                                      }}
                                      className="h-6 w-6"
                                      size="sm"
                                      variant="ghost"
                                    />
                                  </div>
                                )}
                              </div>
                            </SidebarMenuSubItem>
                          ))}
                        </div>
                      ) : (
                        <SidebarMenuSubItem>
                          <div className="px-2 py-1 text-sm text-muted-foreground">
                            {tCommon("noProjectsInFolder")}
                          </div>
                        </SidebarMenuSubItem>
                      )}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>

      <RenameDirectoryDialog
        open={rename.open}
        onOpenChange={(o) => setRename((s) => ({ ...s, open: o }))}
        directoryId={rename.dirId || ""}
        defaultName={directories.find((d) => d.id === rename.dirId)?.name || ""}
        onRenamed={() => {
          setRename({ open: false, dirId: undefined, name: "" });
          router.refresh();
        }}
      />

      <AlertDialog
        open={confirm.open}
        onOpenChange={(open) => setConfirm((s) => ({ ...s, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("deleteFolderConfirm", { name: confirm.dirName || "" })}
            </AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-red-600">{t("deleteFolderWarning")}</p>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              {t("cancel")}
            </AlertDialogCancel>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
              onClick={() => confirm.dirId && remove(confirm.dirId)}
            >
              {t("delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

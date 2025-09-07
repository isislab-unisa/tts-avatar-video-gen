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
  FolderSymlink,
  Folder,
  FolderOpen,
  FolderPlus,
  Download,
} from "lucide-react";
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
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
import {
  deleteDirectoryAction,
  type DirectoryDTO,
} from "@/app/(no-nav)/dashboard/_actions/directories";
import { CreateDirectoryDialog } from "@/components/CreateDirectoryDialog";
import RenameDirectoryDialog from "@/components/RenameDirectoryDialog";
import RenameProjectDialog from "@/components/RenameProjectDialog";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import {
  listProjectsByDirAction,
  moveProjectAction,
  deleteProjectAction,
  getProjectDownloadUrlAction,
  type ProjectListItem,
} from "@/app/(no-nav)/dashboard/_actions/projects";
import { toast } from "sonner";

const iconCls = "mr-2 h-4 w-4";

export type NavItem = {
  title: string;
  url: string; // NON naviga sul trigger; il link vive nei sotto-elementi
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
  const tToast = useTranslations("Toast");
  const tProj = useTranslations("Project");

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
  const [projectRename, setProjectRename] = React.useState<{
    open: boolean;
    project?: ProjectListItem;
  }>({ open: false });
  const [projectDelete, setProjectDelete] = React.useState<{
    open: boolean;
    project?: ProjectListItem;
  }>({ open: false });

  async function remove(dirId: string) {
    const ok = await deleteDirectoryAction(dirId);
    if (ok) {
      // Close the dialog first
      setConfirm({ open: false, dirId: "", dirName: "" });
      router.push("/dashboard");
      router.refresh();
    }
  }

  async function onToggle(dirId: string, open: boolean) {
    setOpenDirs((s) => ({ ...s, [dirId]: open }));
    if (open && !dirProjects[dirId]) {
      try {
        const res = await listProjectsByDirAction(dirId, 1, 50, "title", "asc");
        setDirProjects((s) => ({ ...s, [dirId]: res.items || [] }));
      } catch (error) {
        console.error("Error loading projects:", error);
        setDirProjects((s) => ({ ...s, [dirId]: [] }));
      }
    }
  }

  async function onMove(project: ProjectListItem, directoryId: string) {
    const ok = await moveProjectAction(project.id, directoryId);
    if (ok) {
      const folderName =
        directories.find((d) => d.id === directoryId)?.name || "";
      toast.success(
        tToast("projectMoved", { title: project.title, folder: folderName })
      );
      router.refresh();
    }
  }

  async function onDownload(project: ProjectListItem) {
    const res = await getProjectDownloadUrlAction(project.id);
    if (!res.ok || !res.url) {
      toast.error(tToast("downloadFail"));
      return;
    }
    try {
      const r = await fetch(res.url);
      if (!r.ok) throw new Error(String(r.status));
      const blob = await r.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${project.title || "video"}.mp4`;
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      toast.error(tToast("downloadFail"));
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
                        className={`shrink-0 inline-flex items-center justify-center h-7 w-7 rounded hover:bg-muted/50 relative z-10 ${
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
                      {dirId && dirProjects[dirId] ? (
                        dirProjects[dirId].map((sub) => (
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
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <SidebarMenuAction className="opacity-0 group-hover/project-item:opacity-100 transition-opacity cursor-pointer ml-auto">
                                      <MoreHorizontal className="h-4 w-4" />
                                      <span className="sr-only">More</span>
                                    </SidebarMenuAction>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    className="w-56 rounded-lg"
                                    side="right"
                                    align="start"
                                  >
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        void onDownload(sub as ProjectListItem);
                                      }}
                                    >
                                      <Download
                                        className={`${iconCls} text-muted-foreground`}
                                      />
                                      <span>{tProj("download")}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={() =>
                                        setProjectRename({
                                          open: true,
                                          project: sub as ProjectListItem,
                                        })
                                      }
                                    >
                                      <FolderEdit
                                        className={`${iconCls} text-muted-foreground`}
                                      />
                                      <span>{tProj("rename")}</span>
                                    </DropdownMenuItem>
                                    <DropdownMenuSub>
                                      <DropdownMenuSubTrigger className="cursor-pointer">
                                        <FolderSymlink
                                          className={`${iconCls} text-muted-foreground`}
                                        />
                                        <span>{tProj("moveTo")}</span>
                                      </DropdownMenuSubTrigger>
                                      <DropdownMenuSubContent className="w-56 rounded-lg">
                                        {directories
                                          .filter((d) => d.id !== dirId)
                                          .map((d) => (
                                            <DropdownMenuItem
                                              key={d.id}
                                              className="cursor-pointer"
                                              onClick={() =>
                                                onMove(
                                                  sub as ProjectListItem,
                                                  d.id
                                                )
                                              }
                                            >
                                              <Folder
                                                className={`${iconCls} text-muted-foreground`}
                                              />
                                              <span>{d.name}</span>
                                            </DropdownMenuItem>
                                          ))}
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                          className="cursor-pointer"
                                          onSelect={() => setCreateOpen(true)}
                                        >
                                          <FolderPlus className={iconCls} />
                                          <span>
                                            {tCommon("createDirectory")}
                                          </span>
                                        </DropdownMenuItem>
                                      </DropdownMenuSubContent>
                                    </DropdownMenuSub>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                      onClick={() =>
                                        setProjectDelete({
                                          open: true,
                                          project: sub as ProjectListItem,
                                        })
                                      }
                                    >
                                      <Trash2
                                        className={`${iconCls} text-red-600`}
                                      />
                                      <span>{tProj("delete")}</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              )}
                            </div>
                          </SidebarMenuSubItem>
                        ))
                      ) : (
                        <SidebarMenuSubItem>
                          <div className="px-2 py-1 text-sm text-muted-foreground">
                            {tCommon("noProjects")}
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

      {/* RENAME directory dialog */}
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

      {/* DELETE directory dialog (legacy) */}
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
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => confirm.dirId && remove(confirm.dirId)}
            >
              {t("delete")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {/* Project rename/delete dialogs */}
      <RenameProjectDialog
        open={projectRename.open}
        onOpenChange={(o) => setProjectRename((s) => ({ ...s, open: o }))}
        projectId={projectRename.project?.id || ""}
        defaultTitle={projectRename.project?.title || ""}
        onRenamed={() => {
          setProjectRename({ open: false, project: undefined });
          router.refresh();
        }}
      />

      <ConfirmDeleteDialog
        open={projectDelete.open}
        onOpenChange={(o) => setProjectDelete((s) => ({ ...s, open: o }))}
        onConfirm={async () => {
          const p = projectDelete.project;
          if (!p) return;
          const res = await deleteProjectAction(p.id);
          if ((res as { ok?: boolean })?.ok || res === true) {
            toast.success("Progetto eliminato");
            setProjectDelete({ open: false, project: undefined });
            router.refresh();
          }
        }}
      />
    </>
  );
}

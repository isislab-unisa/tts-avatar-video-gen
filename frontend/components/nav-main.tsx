"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronRight,
  MoreHorizontal,
  Trash2,
  FolderEdit,
  FolderSymlink,
  Folder,
  FolderPlus,
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
  renameDirectoryAction,
  deleteDirectoryAction,
  type DirectoryDTO,
} from "@/app/(no-nav)/dashboard/_actions/directories";
import { CreateDirectoryDialog } from "@/components/CreateDirectoryDialog";

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

  async function doRename() {
    if (!rename.dirId) return;
    const name = rename.name.trim();
    if (!name) return;
    const ok = await renameDirectoryAction(rename.dirId, name);
    if (ok) {
      setRename({ open: false, dirId: undefined, name: "" });
      router.refresh();
    }
  }

  async function remove(dirId: string) {
    const ok = await deleteDirectoryAction(dirId);
    if (ok) {
      router.push("/dashboard");
      router.refresh();
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
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <div className="flex items-center group/folder-item">
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton
                        tooltip={item.title}
                        className="cursor-pointer flex-1"
                      >
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>

                    {dirId && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <SidebarMenuAction className="opacity-0 group-hover/folder-item:opacity-100 transition-opacity cursor-pointer">
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
                            <span>Rinomina Cartella</span>
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
                            <span>Elimina Cartella</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>

                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((sub) => (
                        <SidebarMenuSubItem
                          key={sub.id || sub.title}
                          className="group/project-item"
                        >
                          <div className="flex items-center w-full">
                            <SidebarMenuSubButton
                              asChild
                              className="cursor-pointer flex-1"
                            >
                              <Link href={sub.url}>
                                <span>{sub.title}</span>
                              </Link>
                            </SidebarMenuSubButton>

                            {sub.type === "project" && dirId && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <SidebarMenuAction className="opacity-0 group-hover/project-item:opacity-100 transition-opacity cursor-pointer ml-auto">
                                    <MoreHorizontal className="h-4 w-4" />
                                    <span className="sr-only">More</span>
                                  </SidebarMenuAction>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  className="w-48 rounded-lg"
                                  side="right"
                                  align="start"
                                >
                                  <DropdownMenuSub>
                                    <DropdownMenuSubTrigger className="cursor-pointer">
                                      <FolderSymlink
                                        className={`${iconCls} text-muted-foreground`}
                                      />
                                      <span>Sposta in…</span>
                                    </DropdownMenuSubTrigger>
                                    <DropdownMenuSubContent className="w-56 rounded-lg">
                                      {directories
                                        .filter((d) => d.id !== dirId)
                                        .map((d) => (
                                          <DropdownMenuItem
                                            key={d.id}
                                            className="cursor-pointer"
                                            onClick={() => {
                                              // lo spostamento vero lo fai nella pagina dettaglio
                                              // da qui portiamo l’utente alla pagina, dove c’è il dropdown “Sposta in…”
                                              router.push(sub.url);
                                            }}
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
                                        <span>Crea Directory</span>
                                      </DropdownMenuItem>
                                    </DropdownMenuSubContent>
                                  </DropdownMenuSub>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarGroup>

      {/* RENAME dialog */}
      <AlertDialog
        open={rename.open}
        onOpenChange={(o) => setRename((s) => ({ ...s, open: o }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Rinomina cartella</AlertDialogTitle>
          </AlertDialogHeader>
          <input
            className="w-full border rounded-md px-3 py-2 bg-background"
            value={rename.name}
            onChange={(e) => setRename((s) => ({ ...s, name: e.target.value }))}
            autoFocus
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <Button onClick={doRename}>Salva</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE dialog */}
      <AlertDialog
        open={confirm.open}
        onOpenChange={(open) => setConfirm((s) => ({ ...s, open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Eliminare la cartella “{confirm.dirName}”?
            </AlertDialogTitle>
          </AlertDialogHeader>
          <p className="text-sm text-red-600">
            Attenzione: verranno eliminati <b>anche tutti i progetti</b>{" "}
            contenuti e i relativi video su MinIO.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => confirm.dirId && remove(confirm.dirId)}
            >
              Elimina
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

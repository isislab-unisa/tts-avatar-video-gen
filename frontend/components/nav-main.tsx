"use client";
import { useState } from "react";

import {
  ChevronRight,
  type LucideIcon,
  MoreHorizontal,
  Edit,
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
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
import { CreateDirectoryDialog } from "@/components/CreateDirectoryDialog";

const iconCls = "mr-2 h-4 w-4";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: { title: string; url: string; type?: string }[];
  }[];
}) {
  const { isMobile } = useSidebar();
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <>
      <CreateDirectoryDialog open={createOpen} onOpenChange={setCreateOpen} />

      <SidebarGroup>
        <SidebarMenu>
          {items.map((item) => (
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

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuAction className="opacity-0 group-hover/folder-item:opacity-100 transition-opacity cursor-pointer">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More</span>
                      </SidebarMenuAction>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-48 rounded-lg"
                      side={isMobile ? "bottom" : "right"}
                      align={isMobile ? "end" : "start"}
                    >
                      <DropdownMenuItem className="cursor-pointer">
                        <FolderEdit
                          className={`${iconCls} text-muted-foreground`}
                        />
                        <span>Rinomina Cartella</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20">
                        <Trash2 className={`${iconCls} text-red-600`} />
                        <span>Elimina Cartella</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem
                        key={subItem.title}
                        className="group/project-item"
                      >
                        <div className="flex items-center w-full">
                          <SidebarMenuSubButton
                            asChild
                            className="cursor-pointer flex-1"
                          >
                            <a href={subItem.url}>
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>

                          {subItem.type === "project" && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <SidebarMenuAction className="opacity-0 group-hover/project-item:opacity-100 transition-opacity cursor-pointer ml-auto">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">More</span>
                                </SidebarMenuAction>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent
                                className="w-48 rounded-lg"
                                side={isMobile ? "bottom" : "right"}
                                align={isMobile ? "end" : "start"}
                              >
                                <DropdownMenuItem className="cursor-pointer">
                                  <Edit
                                    className={`${iconCls} text-muted-foreground`}
                                  />
                                  <span>Modifica Progetto</span>
                                </DropdownMenuItem>

                                <DropdownMenuSub>
                                  <DropdownMenuSubTrigger className="cursor-pointer">
                                    <FolderSymlink
                                      className={`${iconCls} text-muted-foreground`}
                                    />
                                    <span>Sposta in…</span>
                                  </DropdownMenuSubTrigger>
                                  <DropdownMenuSubContent className="w-56 rounded-lg">
                                    {items
                                      .filter((grp) => grp.title !== item.title)
                                      .map((grp) => (
                                        <DropdownMenuItem
                                          key={grp.title}
                                          className="cursor-pointer"
                                          onClick={() =>
                                            console.log(
                                              `Move "${subItem.title}" -> "${grp.title}"`
                                            )
                                          }
                                        >
                                          <Folder
                                            className={`${iconCls} text-muted-foreground`}
                                          />
                                          <span>{grp.title}</span>
                                        </DropdownMenuItem>
                                      ))}
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onSelect={() => setCreateOpen(true)}
                                    >
                                      <FolderPlus className={iconCls} />
                                      <span>Create Directory</span>
                                    </DropdownMenuItem>
                                  </DropdownMenuSubContent>
                                </DropdownMenuSub>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20">
                                  <Trash2
                                    className={`${iconCls} text-red-600`}
                                  />
                                  <span>Elimina Progetto</span>
                                </DropdownMenuItem>
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
          ))}
        </SidebarMenu>
      </SidebarGroup>
    </>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { FolderPlus, CirclePlus, Folder } from "lucide-react";
import { NavMain, type NavItem } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import { CreateDirectoryDialog } from "@/components/CreateDirectoryDialog";

export type DirectoryDTO = { id: string; name: string };

export function AppSidebar(
  props: React.ComponentProps<typeof Sidebar> & { directories?: DirectoryDTO[] }
) {
  const { directories = [], ...rest } = props;
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [openCreateDir, setOpenCreateDir] = React.useState(false);
  const router = useRouter();

  const directoryGroups: NavItem[] = directories.map((d) => ({
    title: d.name,
    url: `/dashboard/folder/${d.id}`,
    icon: Folder,
    items: [], // se vuoi popolare i progetti, passa qui i subitems
    meta: { id: d.id },
  }));

  return (
    <TooltipProvider delayDuration={150}>
      <Sidebar collapsible="icon" {...rest}>
        <SidebarHeader>
          <div className="flex items-center justify-center gap-2 p-2">
            {isCollapsed ? (
              <Link href="/dashboard">
                <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity p-1">
                  <span className="text-[9px] tracking-widest font-bold text-white dark:text-black">
                    DUBME
                  </span>
                </div>
              </Link>
            ) : (
              <Link href="/dashboard">
                <span className="cursor-pointer text-lg font-bold md:text-2xl hover:opacity-80 transition-opacity">
                  DUBME
                </span>
              </Link>
            )}
          </div>

          <div className="flex flex-col items-center gap-y-2 p-2">
            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-9 h-9 p-0 cursor-pointer"
                    aria-label="Create Directory"
                    onClick={() => setOpenCreateDir(true)}
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Create Directory</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start gap-2 cursor-pointer"
                onClick={() => setOpenCreateDir(true)}
              >
                <FolderPlus className="h-4 w-4" />
                Create Directory
              </Button>
            )}

            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/dashboard/project/create">
                    <Button
                      variant="outline"
                      className="w-9 h-9 p-0 cursor-pointer"
                      aria-label="Create Project"
                    >
                      <CirclePlus className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">Create Project</TooltipContent>
              </Tooltip>
            ) : (
              <Link href="/dashboard/project/create" className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 cursor-pointer"
                >
                  <CirclePlus className="h-4 w-4" />
                  Create Project
                </Button>
              </Link>
            )}
          </div>

          {!isCollapsed && <Separator className="my-1" />}
        </SidebarHeader>

        <SidebarContent className="overflow-y-auto">
          {!isCollapsed && (
            <NavMain items={directoryGroups} directories={directories} />
          )}
        </SidebarContent>

        <SidebarFooter>
          <NavUser
            user={{ name: "Cody", email: "m@example.com", avatar: "/cody.png" }}
          />
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <CreateDirectoryDialog
        open={openCreateDir}
        onOpenChange={(o) => {
          setOpenCreateDir(o);
          if (!o) router.refresh();
        }}
      />
    </TooltipProvider>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
import { DirectoryDTO } from "@/lib/schema/directory";

export function AppSidebar(
  props: React.ComponentProps<typeof Sidebar> & {
    directories?: DirectoryDTO[];
    user?: { name: string; email: string; image?: string | null };
    isDev?: boolean;
  }
) {
  const { directories = [], user, isDev = false, ...rest } = props;
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [openCreateDir, setOpenCreateDir] = React.useState(false);
  const router = useRouter();
  const t = useTranslations("Common");

  const directoryGroups: NavItem[] = directories.map((d) => ({
    title: d.name,
    url: `/dashboard/folder/${d.id}`,
    icon: Folder,
    items: [],
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
                    className="w-9 h-9 p-0 cursor-pointer hover:scale-105 transition-transform duration-200"
                    aria-label={t("createDirectory")}
                    onClick={() => setOpenCreateDir(true)}
                  >
                    <FolderPlus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {t("createDirectory")}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start gap-2 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                onClick={() => setOpenCreateDir(true)}
              >
                <FolderPlus className="h-4 w-4" />
                {t("createDirectory")}
              </Button>
            )}

            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/dashboard/project/create">
                    <Button
                      variant="outline"
                      className="w-9 h-9 p-0 cursor-pointer hover:scale-105 transition-transform duration-200"
                      aria-label={t("createProject")}
                    >
                      <CirclePlus className="h-4 w-4" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  {t("createProject")}
                </TooltipContent>
              </Tooltip>
            ) : (
              <Link href="/dashboard/project/create" className="w-full">
                <Button
                  variant="outline"
                  className="w-full justify-start gap-2 cursor-pointer hover:scale-[1.02] transition-transform duration-200"
                >
                  <CirclePlus className="h-4 w-4" />
                  {t("createProject")}
                </Button>
              </Link>
            )}
          </div>

          {!isCollapsed && <Separator className="my-0.5" />}
        </SidebarHeader>

        <SidebarContent className="overflow-y-auto">
          {!isCollapsed && (
            <div className="animate-slide-in">
              <NavMain items={directoryGroups} directories={directories} />
            </div>
          )}
        </SidebarContent>

        <SidebarFooter>
          <NavUser
            user={{
              name: user?.name || "User",
              email: user?.email || "user@example.com",
              avatar: user?.image || "/cody.png",
            }}
            isDev={isDev}
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

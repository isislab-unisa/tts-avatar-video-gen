"use client";
import * as React from "react";
import { FolderPlus, CirclePlus, Folder } from "lucide-react";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
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

// Sample data
const data = {
  user: {
    name: "Cody",
    email: "m@example.com",
    avatar: "/cody.png",
  },
  navMain: [
    {
      title: "Playground",
      url: "#",
      icon: Folder,
      isActive: true,
      items: [
        { title: "History", url: "#", type: "project" },
        { title: "Starred", url: "#", type: "project" },
        { title: "Settings", url: "#", type: "project" },
      ],
    },
    {
      title: "Models",
      url: "#",
      icon: Folder,
      items: [
        { title: "Genesis", url: "#", type: "project" },
        { title: "Explorer", url: "#", type: "project" },
        { title: "Quantum", url: "#", type: "project" },
      ],
    },
    {
      title: "Documentation",
      url: "#",
      icon: Folder,
      items: [
        { title: "Introduction", url: "#", type: "project" },
        { title: "Get Started", url: "#", type: "project" },
        { title: "Tutorials", url: "#", type: "project" },
        { title: "Changelog", url: "#", type: "project" },
      ],
    },
    {
      title: "Settings",
      url: "#",
      icon: Folder,
      items: [
        { title: "General", url: "#", type: "project" },
        { title: "Team", url: "#", type: "project" },
        { title: "Billing", url: "#", type: "project" },
        { title: "Limits", url: "#", type: "project" },
      ],
    },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <TooltipProvider delayDuration={150}>
      <Sidebar collapsible="icon" {...props}>
        <SidebarHeader>
          {/* Logo */}
          <div className="flex items-center justify-center gap-2 p-2">
            {isCollapsed ? (
              <div className="w-10 h-10 rounded-full bg-black dark:bg-white flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity p-1">
                <span className="text-[9px] tracking-widest font-bold text-white dark:text-black">
                  DUBME
                </span>
              </div>
            ) : (
              <span className="cursor-pointer text-lg font-bold md:text-2xl hover:opacity-80 transition-opacity">
                DUBME
              </span>
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
              >
                <FolderPlus className="h-4 w-4" />
                Create Directory
              </Button>
            )}

            {isCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-9 h-9 p-0 cursor-pointer"
                    aria-label="Create Project"
                  >
                    <CirclePlus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Create Project</TooltipContent>
              </Tooltip>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start gap-2 cursor-pointer"
              >
                <CirclePlus className="h-4 w-4" />
                Create Project
              </Button>
            )}
          </div>

          {!isCollapsed && <Separator className="my-1" />}
        </SidebarHeader>

        <SidebarContent className="overflow-y-auto">
          {!isCollapsed && <NavMain items={data.navMain} />}
        </SidebarContent>

        <SidebarFooter>
          <NavUser user={data.user} />
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>
    </TooltipProvider>
  );
}

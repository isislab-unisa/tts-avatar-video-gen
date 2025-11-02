import React from "react";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { listDirectoriesForUser } from "./_actions/directories";
import { getSessionOrDev } from "@/lib/dev-auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const sessionOrDev = await getSessionOrDev();
  if (!sessionOrDev) redirect("/login");

  const directories = await listDirectoriesForUser();

  return (
    <SidebarProvider>
      <AppSidebar directories={directories} user={sessionOrDev.user} isDev={sessionOrDev.isDev} />
      <SidebarInset>
        <header className="flex h-16 items-center px-4 justify-between">
          <div className="flex items-center">
            <SidebarTrigger className="-ml-1" />
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </header>
        <div className="flex-1 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}

import React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { listDirectoriesForUser } from "./_actions/directories";
import { cloneRequestHeaders } from "@/lib/headers";

async function getSessionServer() {
  const h = await cloneRequestHeaders();
  return auth.api.getSession({ headers: h });
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSessionServer();
  if (!session) redirect("/login");

  const directories = await listDirectoriesForUser();

  return (
    <SidebarProvider>
      <AppSidebar directories={directories} user={session.user} />
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

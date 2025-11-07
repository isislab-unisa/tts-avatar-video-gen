"use client";
import { ChevronsUpDown, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";

export function NavUser({
  user,
  isDev = false,
}: {
  user: {
    name: string;
    email: string;
    avatar?: string;
    image?: string;
  };
  isDev?: boolean;
}) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const t = useTranslations("Toast");

  const userImage = user.avatar || user.image;
  const hasUserImage = userImage && !imageError;

  useEffect(() => {
    if (userImage) {
      const img = new window.Image();
      img.onload = () => {
        setImageLoaded(true);
      };
      img.onerror = () => {
        setImageError(true);
      };
      img.src = userImage;
    }
  }, [userImage, user.avatar, user.image]);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      toast.success(t("signOutSuccess"));
      router.push("/login");
    } catch {
      toast.error(t("signOutError"));
    } finally {
      setIsSigningOut(false);
    }
  };
  const { isMobile } = useSidebar();

  // In dev mode, show a simple non-interactive user display
  if (isDev) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" className="cursor-default" disabled>
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarFallback className="rounded-lg p-0">
                <Image
                  src="/cody-avatar.png"
                  alt="Fallback Cody"
                  width={32}
                  height={32}
                  className="h-full w-full object-cover rounded-lg"
                  priority
                  unoptimized
                />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{user.name}</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                {hasUserImage && imageLoaded ? (
                  <AvatarImage
                    src={userImage}
                    alt={user.name}
                    className="object-cover"
                  />
                ) : (
                  <AvatarFallback className="rounded-lg p-0">
                    <Image
                      src="/cody-avatar.png"
                      alt="Fallback Cody"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover rounded-lg"
                      priority
                      unoptimized
                    />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  {hasUserImage && imageLoaded ? (
                    <AvatarImage
                      src={userImage}
                      alt={user.name}
                      className="object-cover"
                    />
                  ) : (
                    <AvatarFallback className="rounded-lg p-0">
                      <Image
                        src="/cody-avatar.png"
                        alt="Fallback Cody"
                        width={32}
                        height={32}
                        className="h-full w-full object-cover rounded-lg"
                        priority
                        unoptimized
                      />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
              onClick={handleSignOut}
            >
              {isSigningOut ? (
                <>
                  <LogOut className="text-red-600 animate-spin mr-2" />
                  {t("loggingOut")}
                </>
              ) : (
                <>
                  <LogOut className="text-red-600 mr-2" />
                  {t("logOut")}
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

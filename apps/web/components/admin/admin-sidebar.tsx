"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Key,
  FolderOpen,
  Settings,
  Flag,
  ChevronLeft,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@repo/ui/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@repo/ui/components/ui/avatar";
import { cn } from "@repo/ui/lib/utils";
import SignOutButton from "../auth-atoms/SignOut";

const navigation = [
  {
    title: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Management",
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Sessions",
        href: "/admin/sessions",
        icon: Key,
      },
      {
        title: "Files",
        href: "/admin/files",
        icon: FolderOpen,
      },
    ],
  },
  {
    title: "Configuration",
    items: [
      {
        title: "Feature Flags",
        href: "/admin/feature-flags",
        icon: Flag,
      },
    ],
  },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-border/50 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
    >
      <SidebarHeader className="h-16 border-b border-border/50">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="hover:bg-transparent data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground group"
            >
              <Link href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-linear-to-br from-primary to-primary/80 text-primary-foreground shadow-sm shadow-primary/20 transition-all group-hover:shadow-primary/40 group-hover:scale-105">
                  <Shield className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight ml-2 group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-semibold tracking-tight">
                    Admin Console
                  </span>
                  <span className="truncate text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                    Management
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2  pt-4">
        {navigation.map((group) => (
          <SidebarGroup key={group.title} className="mb-4">
            <SidebarGroupLabel className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider px-2 mb-2 group-data-[collapsible=icon]:hidden">
              {group.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin" && pathname.startsWith(item.href));

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.title}
                        className={cn(
                          "transition-all duration-200 ease-in-out h-9 rounded-md group",
                          isActive
                            ? "bg-primary/10 text-primary font-medium hover:bg-primary/15 hover:text-primary shadow-sm"
                            : "hover:bg-muted/50 hover:text-foreground text-muted-foreground",
                        )}
                      >
                        <Link
                          href={item.href}
                          className="flex items-center gap-3"
                        >
                          <item.icon
                            className={cn(
                              "size-4 transition-colors",
                              isActive
                                ? "text-primary"
                                : "text-muted-foreground group-hover:text-foreground",
                            )}
                          />
                          <span className="flex-1 group-data-[collapsible=icon]:hidden">
                            {item.title}
                          </span>
                          {isActive && (
                            <ChevronRight className="size-3 text-primary/50 group-data-[collapsible=icon]:hidden" />
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-2 lg:p-4">
        <SidebarSeparator className="mb-4 bg-border/50 group-data-[collapsible=icon]:hidden" />
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip="Admin User"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground hover:bg-muted/50 transition-colors rounded-xl border border-transparent hover:border-border/50"
                >
                  <Avatar className="size-8 rounded-lg border border-border/50">
                    <AvatarFallback className="rounded-lg bg-primary/5 text-primary text-xs font-medium">
                      AD
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight ml-2 group-data-[collapsible=icon]:hidden">
                    <span className="truncate font-medium text-foreground">
                      Admin
                    </span>
                    <span className="truncate text-xs text-muted-foreground">
                      admin@example.com
                    </span>
                  </div>
                  <ChevronRight className="ml-auto size-4 text-muted-foreground/50 group-data-[collapsible=icon]:hidden" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="start"
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl border-border/50 shadow-xl bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80"
              >
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/">
                    <ChevronLeft className="mr-2 size-4" />
                    Back to App
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  asChild
                  className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                >
                  <SignOutButton />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

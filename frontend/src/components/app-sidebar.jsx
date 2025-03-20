"use client";

import * as React from "react";
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  LogOut,
  Settings,
  User,
  ChevronsUpDown,
  MapIcon,
  PieChart,
  Settings2,
  SquareTerminal,
  ChevronRight,
  Home,
  CircleHelp,
  FileUser,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "next-view-transitions";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { User2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Skeleton } from "./ui/skeleton";
import { cn } from "@/lib/utils";
export function AppSidebar({ ...props }) {
  const pathname = usePathname();
  const firstname = useAuthStore((state) => state.firstname);
  const lastname = useAuthStore((state) => state.lastname);
  const email = useAuthStore((state) => state.email);
  const typelowercase = useAuthStore((state) => state.type);
  const type =
    String(typelowercase)?.charAt(0)?.toUpperCase() +
    String(typelowercase)?.slice(1);
  const { isMobile, open } = useSidebar();

  const InfoDisplay = ({ data, className }) => {
    if (
      !data ||
      data === "" ||
      (Array.isArray(data) && data.length === 0) ||
      data === " "
    ) {
      return (
        <Skeleton className={cn("h-full w-full bg-gray-300", className)} />
      );
    }
    return data;
  };

  return (
    <Sidebar collapsible="icon" {...props} variant="floating">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEnd className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  Satsankalpa Advocacy
                </span>
                <span className="truncate text-xs h-4 w-16 ">
                  <InfoDisplay data={type} />
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
          <SidebarMenu>
            {/* <Collapsible
              key="Playground"
              asChild
              className="group/collapsible"
            > */}
            {/* <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton tooltip="Playground">
                    <SquareTerminal />
                    <span>Playground</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub>
                    <SidebarMenuSubItem key="History">
                      <SidebarMenuSubButton asChild>
                        <a href="/app">
                          <span>History</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem key="Starred">
                      <SidebarMenuSubButton asChild>
                        <a href="/app">
                          <span>Starred</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem key="Settings">
                      <SidebarMenuSubButton asChild>
                        <a href="/app">
                          <span>Settings</span>
                        </a>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible> */}
            {!type ||
            type === "" ||
            (Array.isArray(type) && type.length === 0) ||
            type === " " ? (
              <>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Skeleton className="h-full w-4 rounded-md bg-gray-300" />
                    {open && (
                      <Skeleton className="h-full w-full rounded-md bg-gray-300" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Skeleton className="h-full w-4 rounded-md bg-gray-300" />
                    {open && (
                      <Skeleton className="h-full w-3/4 rounded-md bg-gray-300" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton>
                    <Skeleton className="h-full w-4 rounded-md bg-gray-300" />
                    {open && (
                      <Skeleton className="h-full w-1/2 rounded-md bg-gray-300" />
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </>
            ) : (
              <>
                <Link href="/app">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="Home"
                      isActive={pathname === "/app"}
                    >
                      <Home />
                      <span>Home</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
                {type === "Admin" ? (
                  <>
                    <Link href="/app/applicants">
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          tooltip="Applicants"
                          isActive={pathname === "/app/applicants"}
                        >
                          <FileUser />
                          <span>Applicants</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </Link>
                    <Link href="/app/users">
                      <SidebarMenuItem>
                        <SidebarMenuButton
                          tooltip="Users"
                          isActive={pathname === "/app/users"}
                        >
                          <User2 />
                          <span>Users</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </Link>
                  </>
                ) : (
                  <>
                  {/* <Link href="/app/chat">
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        tooltip="Chat"
                        isActive={pathname === "/app/chat"}
                      >
                        <span>Chat</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Link> */}
                    </>
                )}
                <Link href="/app/help">
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      tooltip="Help"
                      isActive={pathname === "/app/help"}
                    >
                      <CircleHelp />
                      <span>Help</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
              </>
            )}
          </SidebarMenu>{" "}
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={`https://avatar.vercel.sh/${firstname?.[0]}${lastname?.[0]}`}
                      alt="Avatar"
                    />
                    <AvatarFallback className="rounded-lg">
                      {firstname?.[0] && lastname?.[0]
                        ? `${firstname[0]}${lastname[0]}`
                        : "EB"}
                    </AvatarFallback>
                  </Avatar>{" "}
                  <div className="grid flex-1 text-left text-sm leading-tight gap-1">
                    <span className="truncate font-semibold h-4 w-full ">
                      <InfoDisplay data={`${firstname} ${lastname}`} />
                    </span>
                    <span className="truncate text-xs h-4">
                      <InfoDisplay data={email} className="w-1/2" />
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarImage
                        src={`https://avatar.vercel.sh/${firstname?.[0]}${lastname?.[0]}`}
                        alt="Avatar"
                      />
                      <AvatarFallback className="rounded-lg">
                        {firstname?.[0] && lastname?.[0]
                          ? `${firstname[0]}${lastname[0]}`
                          : "EB"}
                      </AvatarFallback>{" "}
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold h-4 w-full ">
                        <InfoDisplay data={`${firstname} ${lastname}`} />
                      </span>
                      <span className="truncate text-xs h-4">
                        <InfoDisplay data={email} className="w-1/2" />
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <Settings />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut />
                  Log out
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

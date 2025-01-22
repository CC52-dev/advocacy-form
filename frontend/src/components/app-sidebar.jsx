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
import { usePathname } from 'next/navigation';


export function AppSidebar({ ...props }) {
  const pathname = usePathname();

  const { isMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props} variant="inset">
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
                <span className="truncate text-xs">Admin</span>
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
            </Link>{" "}
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
                      src="https://avatar.vercel.sh/eshwarbalajiyogesh"
                      alt="Eshwar Balaji Yogesh"
                    />
                    <AvatarFallback className="rounded-lg">EB</AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      Eshwar Balaji Yogesh
                    </span>
                    <span className="truncate text-xs">
                      balaji.yogesh@gmail.com
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
                        src="https://avatar.vercel.sh/eshwarbalajiyogesh"
                        alt="Eshwar Balaji Yogesh"
                      />
                      <AvatarFallback className="rounded-lg">EB</AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        Eshwar Balaji Yogesh
                      </span>
                      <span className="truncate text-xs">
                        balaji.yogesh@gmail.com
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

import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toaster";
import ReactQueryProvider from "@/lib/ReactQueryProvider";
import { ViewTransitions } from "next-view-transitions";
import {
    TooltipProvider,
  } from "@/components/ui/tooltip"
  
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cookies, headers } from "next/headers";
import AppHeader from "@/components/app-header";

export default async function Layout({ children }) {


  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
    <ReactQueryProvider>
      <ViewTransitions>
        <TooltipProvider>
        <SidebarProvider defaultOpen={defaultOpen}>
          <AppSidebar />
          <SidebarInset>
            <AppHeader />

            <main className="w-screen md:w-full">{children}</main>
          </SidebarInset>
        </SidebarProvider>
        </TooltipProvider>

        <Toaster />
      </ViewTransitions>
    </ReactQueryProvider>
  );
}

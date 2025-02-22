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
import { TooltipProvider } from "@/components/ui/tooltip";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { cookies, headers } from "next/headers";
import AppHeader from "@/components/app-header";
import AuthStoreProvider from "@/lib/authMiddleware";

export default async function Layout({ children }) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value === "true";

  return (
          <AuthStoreProvider>
            <SidebarProvider defaultOpen={defaultOpen}>
              <AppSidebar />
              <SidebarInset>
                <div className="w-full absolute">
                  <AppHeader />
                  {/* <div className="max-h-screen overflow-y-auto"> */}

                  <main>{children}</main>
                  {/* </div> */}
                </div>
              </SidebarInset>
            </SidebarProvider>
          </AuthStoreProvider>

  );
}

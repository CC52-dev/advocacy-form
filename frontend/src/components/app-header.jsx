"use client";
import React from 'react';
import { Separator } from "@/components/ui/separator";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList } from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar"; // Assuming this component exists
import { usePathname } from 'next/navigation';

const AppHeader = ({ headersList }) => {
    const pathname = usePathname().replace("/app/", "");
    let formattedPath = pathname.charAt(0).toUpperCase() + pathname.slice(1);

    if (pathname === "/app") {
        formattedPath = "Home";
    } else {
    formattedPath = pathname.charAt(0).toUpperCase() + pathname.slice(1);
    }

    return (
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink >
                                {`${formattedPath}`}
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>
        </header>
    );
};

export default AppHeader;
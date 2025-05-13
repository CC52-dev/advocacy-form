import React from "react";
import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Nav({ activeItem = "home" }) {
  return (
    <nav className="fixed top-0 left-0 right-0 p-4 z-20 select-none backdrop-blur-sm bg-white/70 dark:bg-gray-900/70">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Image
            src="https://satsankalpa.org/wp-content/uploads/2025/01/cropped-SatSankalpa_Logo_retina_0523.png"
            alt="Satsankalpa Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
        </div>

        <div className="flex-1 text-center">
          <span className="font-bold text-lg">Satsankalpa Foundation Inc</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <Link
            href="https://satsankalpa.org"
            className={cn(
              "text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 pb-1 bg-none",
              activeItem === "home" && "border-b-2 border-black dark:border-white"
            )}
          >
            Home
          </Link>
          <Link
            href="/signup"
            className={cn(
              "text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 pb-1 bg-none",
              activeItem === "signup" && "border-b-2 border-black dark:border-white"
            )}
          >
            Signup
          </Link>
        </div>

        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="text-black dark:text-white hover:text-black/70 dark:hover:text-white/70" type="button">
                <Menu />
              </button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-4">
                <Link
                  href="https://satsankalpa.org"
                  className={cn(
                    "text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 pb-1 bg-none",
                    activeItem === "home" && "border-b-2 border-black dark:border-white"
                  )}
                >
                  Home
                </Link>
                <Link
                  href="/"
                  className={cn(
                    "text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 pb-1 bg-none",
                    activeItem === "signup" && "border-b-2 border-black dark:border-white"
                  )}
                >
                  Signup
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
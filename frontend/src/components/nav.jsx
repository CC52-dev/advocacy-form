import React from "react";
import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";
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
    <nav className="fixed top-0 left-0 right-0 p-4 z-20 select-none">
      <div className="container mx-auto flex justify-center items-center flex-row">
        <div className={cn("rounded-full px-6 py-2 space-x-8 backdrop-blur-3xl bg-gray-100/0 dark:bg-gray-900/0 filter lg border dark:border-gray-700 flex items-center w-full md:w-auto justify-between md:justify-normal")}>
          <Link
            href="/"
            className={cn(
              "text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 bg-none font-bold md:pb-1"
            )}
          >
            Advocacy
          </Link>
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
                    href="/"
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
                  <Link
                    href="/login"
                    className={cn(
                      "text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 pb-1 bg-none",
                      activeItem === "login" && "border-b-2 border-black dark:border-white"
                    )}
                  >
                    Log In
                  </Link>
                  <Link
                    href="https://satsankalpa.org"
                    className={cn(
                      "text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 p-2 bg-none",
                    )}
                  >
                    Satsankalpa.org ↗
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>
          <div className="hidden md:flex md:space-x-8">
            <Link
              href="/"
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
            <Link
              href="/login"
              className={cn(
                "text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 pb-1 bg-none",
                activeItem === "login" && "border-b-2 border-black dark:border-white"
              )}
            >
              Log In
            </Link>
            <Link
              href="https://satsankalpa.org"
              className={cn(
                "text-black dark:text-white hover:text-black/70 dark:hover:text-white/70 p-2 bg-none hidden",
              )}
            >
              Satsankalpa.org ↗
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
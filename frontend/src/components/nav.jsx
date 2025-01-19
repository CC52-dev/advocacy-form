import React from "react";
import { Link } from "next-view-transitions";
import { cn } from "@/lib/utils";
import { MoveUpRight } from "lucide-react";

export default function Nav({ activeItem = "home" }) {
  return (
    <nav className="fixed top-0 left-0 right-0 p-4 z-20 select-none">
      <div className="container mx-auto flex justify-center items-center flex-row">
        <div className="rounded-full px-6 py-2 space-x-8 backdrop-blur-3xl bg-gray-100/0 filter lg border">
          <Link
            href="/"
            className={cn(
              "text-black hover:text-black/70 pb-1 bg-none",
              activeItem === "home" && "border-b-2  border-black"
            )}
          >
            Home
          </Link>
          <Link
            href="/signup"
            className={cn(
              "text-black hover:text-black/70 pb-1 bg-none",
              activeItem === "signup" && "border-b-2  border-black"
            )}
          >
            Signup
          </Link>
          <Link
            href="/login"
            className={cn(
              "text-black hover:text-black/70 pb-1 bg-none",
              activeItem === "login" && "border-b-2  border-black"
            )}
          >
            Log In
          </Link>
          <Link
            href="https://satsankalpa.org"
            className={cn(
              "text-black hover:text-black/70 p-2 bg-none hidden",
            )}
          >
            Satsankalpa.org ↗
          </Link>
        </div>
      </div>
    </nav>
  );
}
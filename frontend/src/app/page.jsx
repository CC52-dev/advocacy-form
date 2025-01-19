"use client";
import Image from "next/image";
import Nav from "@/components/nav";
import { Link } from 'next-view-transitions'
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Footer from "@/components/footer";

export default function Home() {

  return (
    <>
      <Nav />
      <section className="flex min-h-screen items-center justify-center space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
        <div className="container flex max-w-7xl flex-col items-center gap-4 text-center px-5">
          <Link
            href="https://www.facebook.com/satsankalpafoundation/"
            className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium"
            target="_blank"
          >
            Follow along on Facebook
          </Link>
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl lg:text-7xl">
Sign Up For Satsankalpa Advocacy          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
          Advocacy membership program's objective is to build a strong network of global supporters to further both the Foundations' vision, mission and activities. 
          </p>
          <div className="space-x-4">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
Signup            </Link> 

            <Link
              href="/login"
              // target="_blank"
              // rel="noreferrer"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Log In
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}

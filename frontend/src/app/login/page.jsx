"use client";
import { Lock } from "lucide-react";

import Nav from "@/components/nav";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from 'next-view-transitions'
export default function LoginPage() {
  return (
    <>
      <Nav activeItem="login"/>
      <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
        {/* <Nav /> */}
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link
            href="#"
            className="flex items-center gap-2 self-center font-medium"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Lock className="size-4" />{" "}
            </div>
            Satsankalpa Advocacy
          </Link>
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-xl">Welcome back</CardTitle>
                <CardDescription>Enter your email to login</CardDescription>
              </CardHeader>
              <CardContent>
                <form>
                  <div className="grid gap-6">
                    <div className="grid gap-6">
                      <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="m@example.com"
                          required
                        />
                      </div>
                      <Button type="submit" className="w-full">
                        Login
                      </Button>
                    </div>
                    <div className="text-center text-sm">
                      Don't have an account?{" "}
                      <Link href="/signup" className="underline underline-offset-4">
                        Sign up
                      </Link>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
          {/* <Footer /> */}
        </div>
      </div>
      <Footer />
    </>
  );
}

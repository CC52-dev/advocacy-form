"use client";
import Image from "next/image";
import Nav from "@/components/nav";
import { Link } from "next-view-transitions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Footer from "@/components/footer";
import { ArrowRight, Users, Globe, Heart, Zap, Award } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import StarCircles from "@/components/ui/star-circles";

export default function Home() {
  return (
    <>
      <Nav />

      <section className="relative flex min-h-screen min-w-screen items-center justify-center space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32 bg-gradient-to-t from-gray-100 to-white dark:from-gray-950 dark:to-gray-900 overflow-hidden">
      {/* <svg xmlns="http://www.w3.org/2000/svg" width="551" height="295" viewBox="0 0 551 295" fill="none" className="pointer-events-none absolute -right-80 bottom-0 h-full w-full" aria-hidden="true"><path d="M118.499 0H532.468L635.375 38.6161L665 194.625L562.093 346H0L24.9473 121.254L118.499 0Z" fill="url(#paint0_radial_254_132)" /><defs><radialGradient id="paint0_radial_254_132" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(412.5 346) rotate(-91.153) scale(397.581 423.744)"><stop stopColor="#E6E9F7" /><stop offset="0.25" stopColor="#D8DDF2" /><stop offset="0.573634" stopColor="#F0F1F9" /><stop offset="1" stopOpacity="0" /></radialGradient></defs></svg> */}
      {/* <svg xmlns="http://www.w3.org/2000/svg" width="807" height="797" viewBox="0 0 807 797" fill="none" className="pointer-events-none absolute -left-96 top-0 h-full w-full" aria-hidden="true"><path d="M807 110.119L699.5 -117.546L8.5 -154L-141 246.994L-7 952L127 782.111L279 652.114L513 453.337L807 110.119Z" fill="url(#paint0_radial_254_135)" /><path d="M807 110.119L699.5 -117.546L8.5 -154L-141 246.994L-7 952L127 782.111L279 652.114L513 453.337L807 110.119Z" fill="url(#paint1_radial_254_135)" /><defs><radialGradient id="paint0_radial_254_135" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(77.0001 15.8894) rotate(90.3625) scale(869.41 413.353)"><stop stopColor="#E6E9F7" /><stop offset="0.25" stopColor="#D8DDF2" /><stop offset="0.573634" stopColor="#F0F1F9" /><stop offset="1" stopOpacity="0" /></radialGradient><radialGradient id="paint1_radial_254_135" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(127.5 -31) rotate(1.98106) scale(679.906 715.987)"><stop stopColor="#E6E9F7" /><stop offset="0.283363" stopColor="#D8DDF2" /><stop offset="0.573634" stopColor="#F0F1F9" /><stop offset="1" stopOpacity="0" /></radialGradient></defs></svg> */}
      <svg width="1382" height="370" viewBox="0 0 1382 370" fill="none" xmlns="http://www.w3.org/2000/svg" className="pointer-events-none absolute inset-0 z-30 h-full w-full dark:opacity-20" aria-hidden="true"><path d="M268 115L181.106 6.97176C178.069 3.19599 173.485 1 168.639 1H0" stroke="url(#paint0_linear_337_46)" strokeOpacity="0.3" strokeWidth="1.5" /><path d="M1114 115L1200.89 6.97176C1203.93 3.19599 1208.52 1 1213.36 1H1382" stroke="url(#paint1_linear_337_46)" strokeOpacity="0.3" strokeWidth="1.5" /><path d="M268 255L181.106 363.028C178.069 366.804 173.485 369 168.639 369H0" stroke="url(#paint2_linear_337_46)" strokeOpacity="0.3" strokeWidth="1.5" /><path d="M1114 255L1200.89 363.028C1203.93 366.804 1208.52 369 1213.36 369H1382" stroke="url(#paint3_linear_337_46)" strokeOpacity="0.3" strokeWidth="1.5" /><defs><linearGradient id="paint0_linear_337_46" x1="26.4087" y1="1.00001" x2="211.327" y2="175.17" gradientUnits="userSpaceOnUse"><stop offset="0.481613" stopColor="#333333" /><stop offset="1" stopColor="#333333" stopOpacity="0" /></linearGradient><linearGradient id="paint1_linear_337_46" x1="1355.59" y1="1.00001" x2="1170.67" y2="175.17" gradientUnits="userSpaceOnUse"><stop offset="0.481613" stopColor="#333333" /><stop offset="1" stopColor="#333333" stopOpacity="0" /></linearGradient><linearGradient id="paint2_linear_337_46" x1="26.4087" y1="369" x2="211.327" y2="194.83" gradientUnits="userSpaceOnUse"><stop offset="0.481613" stopColor="#333333" /><stop offset="1" stopColor="#333333" stopOpacity="0" /></linearGradient><linearGradient id="paint3_linear_337_46" x1="1355.59" y1="369" x2="1170.67" y2="194.83" gradientUnits="userSpaceOnUse"><stop offset="0.481613" stopColor="#333333" /><stop offset="1" stopColor="#333333" stopOpacity="0" /></linearGradient></defs></svg>
      <svg width="445" height="418" viewBox="0 0 445 418" fill="none" xmlns="http://www.w3.org/2000/svg" className="aspect-square pointer-events-none absolute inset-x-0 -bottom-20 z-20 h-[150px] w-full md:h-[300px] dark:opacity-20" aria-hidden="true"><line x1="139.5" y1="418" x2="139.5" y2="12" stroke="url(#paint0_linear_0_1)" /><line x1="172.5" y1="418" x2="172.5" y2="12" stroke="url(#paint1_linear_0_1)" /><line x1="205.5" y1="418" x2="205.5" y2="12" stroke="url(#paint2_linear_0_1)" /><line x1="238.5" y1="418" x2="238.5" y2="12" stroke="url(#paint3_linear_0_1)" /><line x1="271.5" y1="418" x2="271.5" y2="12" stroke="url(#paint4_linear_0_1)" /><line x1="304.5" y1="418" x2="304.5" y2="12" stroke="url(#paint5_linear_0_1)" /><path d="M1 149L109.028 235.894C112.804 238.931 115 243.515 115 248.361V417" stroke="url(#paint6_linear_0_1)" strokeOpacity="0.3" strokeWidth="1.5" /><path d="M444 149L335.972 235.894C332.196 238.931 330 243.515 330 248.361V417" stroke="url(#paint7_linear_0_1)" strokeOpacity="0.3" strokeWidth="1.5" /><defs><linearGradient id="paint0_linear_0_1" x1="140.5" y1="418" x2="140.5" y2="13" gradientUnits="userSpaceOnUse"><stop stopColor="#333333" /><stop offset="1" stopOpacity="0" /></linearGradient><linearGradient id="paint1_linear_0_1" x1="173.5" y1="418" x2="173.5" y2="13" gradientUnits="userSpaceOnUse"><stop stopColor="#333333" /><stop offset="1" stopOpacity="0" /></linearGradient><linearGradient id="paint2_linear_0_1" x1="206.5" y1="418" x2="206.5" y2="13" gradientUnits="userSpaceOnUse"><stop stopColor="#333333" /><stop offset="1" stopOpacity="0" /></linearGradient><linearGradient id="paint3_linear_0_1" x1="239.5" y1="418" x2="239.5" y2="13" gradientUnits="userSpaceOnUse"><stop stopColor="#333333" /><stop offset="1" stopOpacity="0" /></linearGradient><linearGradient id="paint4_linear_0_1" x1="272.5" y1="418" x2="272.5" y2="13" gradientUnits="userSpaceOnUse"><stop stopColor="#333333" /><stop offset="1" stopOpacity="0" /></linearGradient><linearGradient id="paint5_linear_0_1" x1="305.5" y1="418" x2="305.5" y2="13" gradientUnits="userSpaceOnUse"><stop stopColor="#333333" /><stop offset="1" stopOpacity="0" /></linearGradient><linearGradient id="paint6_linear_0_1" x1="115" y1="390.591" x2="-59.1703" y2="205.673" gradientUnits="userSpaceOnUse"><stop offset="0.481613" stopColor="#333333" /><stop offset="1" stopColor="#333333" stopOpacity="0" /></linearGradient><linearGradient id="paint7_linear_0_1" x1="330" y1="390.591" x2="504.17" y2="205.673" gradientUnits="userSpaceOnUse"><stop offset="0.481613" stopColor="#333333" /><stop offset="1" stopColor="#333333" stopOpacity="0" /></linearGradient></defs></svg>
      <svg width="166" height="298" viewBox="0 0 166 298" fill="none" xmlns="http://www.w3.org/2000/svg" className="aspect-square pointer-events-none absolute inset-x-0 top-0 h-[100px] w-full md:h-[200px] dark:opacity-20" aria-hidden="true"><line y1="-0.5" x2="406" y2="-0.5" transform="matrix(0 1 1 0 1 -108)" stroke="url(#paint0_linear_254_143)" /><line y1="-0.5" x2="406" y2="-0.5" transform="matrix(0 1 1 0 34 -108)" stroke="url(#paint1_linear_254_143)" /><line y1="-0.5" x2="406" y2="-0.5" transform="matrix(0 1 1 0 67 -108)" stroke="url(#paint2_linear_254_143)" /><line y1="-0.5" x2="406" y2="-0.5" transform="matrix(0 1 1 0 100 -108)" stroke="url(#paint3_linear_254_143)" /><line y1="-0.5" x2="406" y2="-0.5" transform="matrix(0 1 1 0 133 -108)" stroke="url(#paint4_linear_254_143)" /><line y1="-0.5" x2="406" y2="-0.5" transform="matrix(0 1 1 0 166 -108)" stroke="url(#paint5_linear_254_143)" /><defs><linearGradient id="paint0_linear_254_143" x1="-7.42412e-06" y1="0.500009" x2="405" y2="0.500009" gradientUnits="userSpaceOnUse"><stop stopColor="#333333" /><stop offset="1" stopOpacity="0" /></linearGradient><linearGradient id="paint1_linear_254_143" x1="-7.42412e-06" y1="0.500009" x2="405" y2="0.500009" gradientUnits="userSpaceOnUse"><stop stopColor="#333333" /><stop offset="1" stopOpacity="0" /></linearGradient><linearGradient id="paint2_linear_254_143" x1="-7.42412e-06" y1="0.500009" x2="405" y2="0.500009" gradientUnits="userSpaceOnUse"><stop stopColor="#333333" /><stop offset="1" stopOpacity="0" /></linearGradient><linearGradient id="paint3_linear_254_143" x1="-7.42412e-06" y1="0.500009" x2="405" y2="0.500009" gradientUnits="userSpaceOnUse"><stop stopColor="#333333" /><stop offset="1" stopOpacity="0" /></linearGradient><linearGradient id="paint4_linear_254_143" x1="-7.42412e-06" y1="0.500009" x2="405" y2="0.500009" gradientUnits="userSpaceOnUse"><stop stopColor="#333333" /><stop offset="1" stopOpacity="0" /></linearGradient><linearGradient id="paint5_linear_254_143" x1="-7.42412e-06" y1="0.500009" x2="405" y2="0.500009" gradientUnits="userSpaceOnUse"><stop stopColor="#333333" /><stop offset="1" stopOpacity="0" /></linearGradient></defs></svg>        <div className="container relative z-10 flex max-w-7xl flex-col items-center gap-4 text-center px-5">
          {" "}
          <Link
            href="https://www.facebook.com/satsankalpafoundation/"
            className="rounded-2xl px-4 py-1.5 text-sm font-medium border-border text-white bg-primary hover:bg-primary/90"
            target="_blank"
          >
            Follow along on Facebook
          </Link>
          <h1 className="font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-gray-900 dark:text-gray-50">
            Satsankalpa Advocacy
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Join our global network of supporters and make a lasting impact.
            Together, we can further our vision, mission, and activities for a
            better world.
          </p>
          <div className="space-x-4">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
              Join Now
            </Link>
            <Link
              href="/learn-more"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
      {/* About Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-6 dark:text-gray-50">
                About We Are - You Are
              </h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8">
                Satsankalpa Advocacy is more than just a membership program.
                It's a global movement of passionate individuals committed to
                making a real difference in the world. Our diverse network of
                supporters brings unique skills, perspectives, and resources to
                further our mission.
              </p>
              <Link
                href="/about"
                className={cn(buttonVariants({ size: "lg" }))}
              >
                Our Story <ArrowRight className="ml-2" />
              </Link>
            </div>
            <div className="flex-1">
              <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse">
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-white dark:bg-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative md:max-w-[1150px] mt-16 mx-auto px-[16px] md:px-0"
        >
          <h2 className="text-center font-heading text-3xl font-extrabold leading-[1.1] sm:text-xl md:text-4xl mb-4 dark:text-gray-50">
            Over 16,000 Volunteers{" "}
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center flex-grow space-y-5 md:space-y-0 md:space-x-5">
            <Card className="w-full md:flex-1">
              <CardHeader>
                <CardTitle>
                  <NumberTicker value={16000} />
                </CardTitle>
                <CardDescription className="whitespace-pre-wrap font-medium tracking-tighter text-black dark:text-white">
                  Volunteers
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="w-full md:flex-1">
              <CardHeader>
                <CardTitle>
                  <NumberTicker value={19} />
                </CardTitle>
                <CardDescription className="whitespace-pre-wrap font-medium tracking-tighter text-black dark:text-white">
                  Countries
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="w-full md:flex-1">
              <CardHeader>
                <CardTitle>
                  <NumberTicker value={124} />
                </CardTitle>
                <CardDescription className="whitespace-pre-wrap font-medium tracking-tighter text-black dark:text-white">
                  Partners
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="w-full md:flex-1">
              <CardHeader>
                <CardTitle>
                  <NumberTicker value={32} />
                </CardTitle>
                <CardDescription className="whitespace-pre-wrap font-medium tracking-tighter text-black dark:text-white">
                  Awards
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="w-full md:flex-1">
              <CardHeader>
                <CardTitle>
                  <NumberTicker value={2123} />
                </CardTitle>
                <CardDescription className="whitespace-pre-wrap font-medium tracking-tighter text-black dark:text-white">
                  Projects
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </motion.div>
      </section>

      <Footer />
    </>
  );
}

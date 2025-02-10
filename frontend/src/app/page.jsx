"use client";
import Image from "next/image";
import Nav from "@/components/nav";
import { Link } from "next-view-transitions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Footer from "@/components/footer";
import { ArrowRight, Users, Globe, Bolt, Zap, Award } from "lucide-react";
import { NumberTicker } from "@/components/ui/number-ticker";
import { TextAnimate } from "@/components/ui/text-animate";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardFooter,
  CardTitle,
} from "@/components/ui/card";
import reviews from "@/data/reviews";
import { ReviewCard } from "@/components/reviewCard";
import { Marquee } from "@/components/ui/marquee";

import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import WorldMap from "@/components/ui/world-map";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { Badge } from "@/components/ui/badge";

const Svg1 = () => (
  <svg
    width="1382"
    height="370"
    viewBox="0 0 1382 370"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="pointer-events-none absolute inset-0 z-30 h-full w-full"
    aria-hidden="true"
  >
    <path
      d="M268 115L181.106 6.97176C178.069 3.19599 173.485 1 168.639 1H0"
      stroke="url(#paint0_linear_337_46)"
      strokeOpacity="0.6"
      strokeWidth="2"
    />
    <path
      d="M1114 115L1200.89 6.97176C1203.93 3.19599 1208.52 1 1213.36 1H1382"
      stroke="url(#paint1_linear_337_46)"
      strokeOpacity="0.6"
      strokeWidth="2"
    />
    <path
      d="M268 255L181.106 363.028C178.069 366.804 173.485 369 168.639 369H0"
      stroke="url(#paint2_linear_337_46)"
      strokeOpacity="0.6"
      strokeWidth="2"
    />
    <path
      d="M1114 255L1200.89 363.028C1203.93 366.804 1208.52 369 1213.36 369H1382"
      stroke="url(#paint3_linear_337_46)"
      strokeOpacity="0.6"
      strokeWidth="2"
    />
    <defs>
      <linearGradient
        id="paint0_linear_337_46"
        x1="26.4087"
        y1="1.00001"
        x2="211.327"
        y2="175.17"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_337_46"
        x1="1355.59"
        y1="1.00001"
        x2="1170.67"
        y2="175.17"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_337_46"
        x1="26.4087"
        y1="369"
        x2="211.327"
        y2="194.83"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
      <linearGradient
        id="paint3_linear_337_46"
        x1="1355.59"
        y1="369"
        x2="1170.67"
        y2="194.83"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
    </defs>
  </svg>
);
const Svg2 = () => (
  <svg
    width="445"
    height="418"
    viewBox="0 0 445 418"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="aspect-square pointer-events-none absolute inset-x-0 -bottom-20 z-20 h-[200px] w-full md:h-[300px]"
    aria-hidden="true"
  >
    <line
      x1="139.5"
      y1="418"
      x2="139.5"
      y2="12"
      stroke="url(#paint0_linear_0_1)"
    />
    <line
      x1="172.5"
      y1="418"
      x2="172.5"
      y2="12"
      stroke="url(#paint1_linear_0_1)"
    />
    <line
      x1="205.5"
      y1="418"
      x2="205.5"
      y2="12"
      stroke="url(#paint2_linear_0_1)"
    />
    <line
      x1="238.5"
      y1="418"
      x2="238.5"
      y2="12"
      stroke="url(#paint3_linear_0_1)"
    />
    <line
      x1="271.5"
      y1="418"
      x2="271.5"
      y2="12"
      stroke="url(#paint4_linear_0_1)"
    />
    <line
      x1="304.5"
      y1="418"
      x2="304.5"
      y2="12"
      stroke="url(#paint5_linear_0_1)"
    />
    <path
      d="M1 149L109.028 235.894C112.804 238.931 115 243.515 115 248.361V417"
      stroke="url(#paint6_linear_0_1)"
      strokeOpacity="0.3"
      strokeWidth="1.5"
    />
    <path
      d="M444 149L335.972 235.894C332.196 238.931 330 243.515 330 248.361V417"
      stroke="url(#paint7_linear_0_1)"
      strokeOpacity="0.3"
      strokeWidth="1.5"
    />
    <defs>
      <linearGradient
        id="paint0_linear_0_1"
        x1="140.5"
        y1="418"
        x2="140.5"
        y2="13"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_0_1"
        x1="173.5"
        y1="418"
        x2="173.5"
        y2="13"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_0_1"
        x1="206.5"
        y1="418"
        x2="206.5"
        y2="13"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
      <linearGradient
        id="paint3_linear_0_1"
        x1="239.5"
        y1="418"
        x2="239.5"
        y2="13"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
      <linearGradient
        id="paint4_linear_0_1"
        x1="272.5"
        y1="418"
        x2="272.5"
        y2="13"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
      <linearGradient
        id="paint5_linear_0_1"
        x1="305.5"
        y1="418"
        x2="305.5"
        y2="13"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
      <linearGradient
        id="paint6_linear_0_1"
        x1="115"
        y1="390.591"
        x2="-59.1703"
        y2="205.673"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.6" stopColor="#9c40ff" />
        <stop offset="1" stopColor="#ffaa40" />
      </linearGradient>
      <linearGradient
        id="paint7_linear_0_1"
        x1="330"
        y1="390.591"
        x2="504.17"
        y2="205.673"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.6" stopColor="#9c40ff" />
        <stop offset="1" stopColor="#ffaa40" />
      </linearGradient>
    </defs>
  </svg>
);
const Svg3 = () => (
  <svg
    width="166"
    height="298"
    viewBox="0 0 166 298"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="aspect-square pointer-events-none absolute inset-x-0 top-0 h-[150px] w-full md:h-[200px]"
    aria-hidden="true"
  >
    <line
      y1="-0.5"
      x2="406"
      y2="-0.5"
      transform="matrix(0 1 1 0 1 -108)"
      stroke="url(#paint0_linear_254_143)"
    />
    <line
      y1="-0.5"
      x2="406"
      y2="-0.5"
      transform="matrix(0 1 1 0 34 -108)"
      stroke="url(#paint1_linear_254_143)"
    />
    <line
      y1="-0.5"
      x2="406"
      y2="-0.5"
      transform="matrix(0 1 1 0 67 -108)"
      stroke="url(#paint2_linear_254_143)"
    />
    <line
      y1="-0.5"
      x2="406"
      y2="-0.5"
      transform="matrix(0 1 1 0 100 -108)"
      stroke="url(#paint3_linear_254_143)"
    />
    <line
      y1="-0.5"
      x2="406"
      y2="-0.5"
      transform="matrix(0 1 1 0 133 -108)"
      stroke="url(#paint4_linear_254_143)"
    />
    <line
      y1="-0.5"
      x2="406"
      y2="-0.5"
      transform="matrix(0 1 1 0 166 -108)"
      stroke="url(#paint5_linear_254_143)"
    />
    <defs>
      <linearGradient
        id="paint0_linear_254_143"
        x1="-7.42412e-06"
        y1="0.500009"
        x2="405"
        y2="0.500009"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_254_143"
        x1="-7.42412e-06"
        y1="0.500009"
        x2="405"
        y2="0.500009"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_254_143"
        x1="-7.42412e-06"
        y1="0.500009"
        x2="405"
        y2="0.500009"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
      <linearGradient
        id="paint3_linear_254_143"
        x1="-7.42412e-06"
        y1="0.500009"
        x2="405"
        y2="0.500009"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
      <linearGradient
        id="paint4_linear_254_143"
        x1="-7.42412e-06"
        y1="0.500009"
        x2="405"
        y2="0.500009"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
      <linearGradient
        id="paint5_linear_254_143"
        x1="-7.42412e-06"
        y1="0.500009"
        x2="405"
        y2="0.500009"
        gradientUnits="userSpaceOnUse"
      >
        <stop offset="0.2" stopColor="#ffaa40" />
        <stop offset="0.5" stopColor="#9c40ff" />
        <stop offset="0.8" stopColor="#ffaa40" />
      </linearGradient>
    </defs>
  </svg>
);
const firstRow = reviews.slice(0, reviews.length / 2);
const secondRow = reviews.slice(reviews.length / 2);
export default function Home() {
  return (
    <>
      <Nav />

      <section className="relative flex min-h-screen min-w-screen items-center justify-center  pb-8 pt-6 md:pb-12 md:pt-10 lg:pb-32  overflow-hidden">
        <Svg1 />
        <Svg2 />
        <Svg3 />

        <div className="container relative z-10 flex max-w-7xl flex-col items-center gap-4 text-center px-5 ">
          {" "}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1.1 }}
            transition={{
              duration: 0.8,
              ease: [0, 0.71, 0.2, 1.01],
            }}
          >
            <Link
              href="https://www.facebook.com/satsankalpafoundation/"
              className="rounded-2xl px-4 py-1.5 text-sm font-medium border-border text-white bg-primary hover:bg-primary/90"
              target="_blank"
            >
              Follow along on Facebook
            </Link>
          </motion.div>
          <TextAnimate
            animation="blurInUp"
            by="character"
            className="font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-gray-900 dark:text-gray-50"
          >
            Satsankalpa Advocacy
          </TextAnimate>
          <TextAnimate
            animation="blurIn"
            by="character"
            className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8"
          >
            Join our global network of supporters and make a lasting impact.
            Together, we can further our vision, mission, and activities for a
            better world.
          </TextAnimate>
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

      <section className="py-20 bg-white dark:bg-gray-900 overflow-hidden border-t min-h-screen">
        <h2 className="text-center font-heading text-4xl font-extrabold leading-[1.1] mb-12 dark:text-gray-50">
          Our Global Impact
        </h2>

        <div className="relative flex flex-col items-center justify-center mb-16">
          <Marquee pauseOnHover className="[--duration:20s]">
            {firstRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:20s]">
            {secondRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-white dark:from-background" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-white dark:from-background" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="container mx-auto px-4"
        >
          <div className="flex flex-col-reverse md:flex-row gap-6 ">
            <Card className="md:w-1/6">
              {" "}
              <CardHeader>
                <CardTitle className="">Achievements</CardTitle>
                <CardDescription>
                  Members of Satsankalpa Advocacy have made a lasting global
                  impact with numerous feats.
                </CardDescription>
              </CardHeader>
              <CardContent />
              <CardFooter className="">
                <Link
                  href="/signup"
                  className={cn(buttonVariants({ size: "lg" }))}
                >
                  Join Now
                </Link>
              </CardFooter>
            </Card>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 flex-1">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <NumberTicker value={16209} />
                  </CardTitle>
                  <CardDescription className="font-medium tracking-tighter text-black dark:text-white">
                    Volunteers
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <NumberTicker value={19} />
                  </CardTitle>
                  <CardDescription className="font-medium tracking-tighter text-black dark:text-white">
                    Countries
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <NumberTicker value={124} />
                  </CardTitle>
                  <CardDescription className="font-medium tracking-tighter text-black dark:text-white">
                    Partners
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <NumberTicker value={32} />
                  </CardTitle>
                  <CardDescription className="font-medium tracking-tighter text-black dark:text-white">
                    Awards
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <NumberTicker value={2123} />
                  </CardTitle>
                  <CardDescription className="font-medium tracking-tighter text-black dark:text-white">
                    Projects
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <NumberTicker value={5432} />
                  </CardTitle>
                  <CardDescription className="font-medium tracking-tighter text-black dark:text-white">
                    Donors
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <NumberTicker value={87} />
                  </CardTitle>
                  <CardDescription className="font-medium tracking-tighter text-black dark:text-white">
                    Events
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <NumberTicker value={456} />
                  </CardTitle>
                  <CardDescription className="font-medium tracking-tighter text-black dark:text-white">
                    Communities
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <NumberTicker value={12} />
                  </CardTitle>
                  <CardDescription className="font-medium tracking-tighter text-black dark:text-white">
                    Programs
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    <NumberTicker value={789} />
                  </CardTitle>
                  <CardDescription className="font-medium tracking-tighter text-black dark:text-white">
                    Initiatives
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>{" "}
          {/* <WorldMap
        dots={[
          {
            start: {
              lat: 64.2008,
              lng: -149.4937,
            }, // Alaska (Fairbanks)
            end: {
              lat: 34.0522,
              lng: -118.2437,
            }, // Los Angeles
          },
          {
            start: { lat: 64.2008, lng: -149.4937 }, // Alaska (Fairbanks)
            end: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
          },
          {
            start: { lat: -15.7975, lng: -47.8919 }, // Brazil (Brasília)
            end: { lat: 38.7223, lng: -9.1393 }, // Lisbon
          },
          {
            start: { lat: 51.5074, lng: -0.1278 }, // London
            end: { lat: 28.6139, lng: 77.209 }, // New Delhi
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: 43.1332, lng: 131.9113 }, // Vladivostok
          },
          {
            start: { lat: 28.6139, lng: 77.209 }, // New Delhi
            end: { lat: -1.2921, lng: 36.8219 }, // Nairobi
          },
        ]}
      /> */}
        </motion.div>
      </section>
      {/* About Section */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <div className="w-full aspect-video bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
            </div>
            <div className="flex-1">
              <h2 className="text-left font-heading text-4xl font-extrabold leading-[1.1] mb-12 dark:text-gray-50 flex flex-col">
                <Badge variant="outline" className="max-w-fit text-sm">
                  About Us
                </Badge>
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
          </div>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <h2 className="text-left font-heading text-4xl font-extrabold leading-[1.1] mb-12 dark:text-gray-50 flex flex-col">
            <Badge variant="outline" className="max-w-fit text-sm">
              Our Values
            </Badge>
            Why Join Us
          </h2>
          <BentoGrid className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <BentoCard
              key="community"
              className="col-span-1 row-span-1"
              Icon={Users}
              name="Community"
              description="Join a global network of passionate individuals."
              cta="Learn More"
              background={
              <div className="absolute inset-0 flex justify-center">
              <Image src={"/assets/community.svg"} layout="" className=" scale-150" objectFit="cover" width={800} height={600} style={{ width: "auto", height: "76%" }} alt="UserFriendlyImg"/>
            </div>}
            />
            <BentoCard
              key="global-impact"
              className="col-span-1 md:col-span-2 row-span-1"
              Icon={Globe}
              name="Global Impact"
              description="Make a lasting difference worldwide."
              cta="Learn More"
              background={
                <div className="absolute inset-0">
                  <WorldMap />
                </div>
              }
            />
            <BentoCard
              key="resources"
              className="col-span-1 row-span-1"
              Icon={Bolt}
              name="Resources"
              description="Access resources and support to further our mission."
              cta="Learn More"
              background={
                <div className="absolute inset-0 flex justify-center">
                  <Image src={"/assets/designer.svg"} layout="" objectFit="cover" className="scale-125" width={800} height={600} style={{ width: "auto", height: "76%" }} alt="UserFriendlyImg"/>
                </div>
              }
      
            />
            <BentoCard
              key="empowerment"
              className="col-span-1 row-span-1"
              Icon={Zap}
              name="Empowerment"
              description="Empower yourself and others to create change."
              cta="Learn More"
              background={
                <div className="absolute inset-0 flex justify-center">
                  <Image src={"/assets/pilot.png"} layout="" objectFit="cover" width={800} height={600} style={{ width: "auto", height: "76%" }} alt="UserFriendlyImg"/>
                </div>
              }
            />
            <BentoCard
              key="recognition"
              className="col-span-1 row-span-1"
              Icon={Award}
              name="Recognition"
              description="Be recognized for your contributions and achievements."
              cta="Learn More"
              background={
                <div className="absolute inset-0 flex justify-center">
                  <Image src={"/assets/recognition.svg"} layout="" objectFit="cover" className="scale-125" width={800} height={600} style={{ width: "auto", height: "76%" }} alt="UserFriendlyImg"/>
                </div>
              }
            />
          </BentoGrid>
        </div>
      </section>
      <Footer />
    </>
  );
}

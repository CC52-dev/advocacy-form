"use client"
import Image from "next/image"
import Nav from "@/components/nav"
import { Link } from "next-view-transitions"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Footer from "@/components/footer"
import { ArrowRight, Users, Globe, Heart, Zap, Award } from "lucide-react"
import {NumberTicker} from "@/components/ui/number-ticker";
import { useRef, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardDescription, CardFooter, CardTitle } from "@/components/ui/card"
import { StarCircles } from "@/components/ui/star-circles"


export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const statsRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => {
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
    };
  }, []);
  return (
    <>
      <Nav />

      <section className="relative flex min-h-screen min-w-screen items-center justify-center space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32 bg-gradient-to-t from-gray-100 to-white overflow-hidden">
        <StarCircles className="absolute inset-0" color="black">       
        </StarCircles>
        <div className="container relative z-10 flex max-w-7xl flex-col items-center gap-4 text-center px-5">
          <Link
            href="https://www.facebook.com/satsankalpafoundation/"
            className="rounded-2xl px-4 py-1.5 text-sm font-medium border-border text-white bg-primary hover:bg-primary/90"
            target="_blank"
          >
            Follow along on Facebook
          </Link>
          <h1 className="font-bold text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-tight tracking-tight text-gray-900">
            Satsankalpa Advocacy
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Join our global network of supporters and make a lasting impact. Together, we can further our vision,
            mission, and activities for a better world.
          </p>
          <div className="space-x-4">
            <Link href="/signup" className={cn(buttonVariants({ size: "lg" }))}>
              Join Now
            </Link>
            <Link href="/learn-more" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Learn More
            </Link>
          </div>
        </div>
</section>


      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-4xl font-bold mb-6">About We Are - You Are</h2>
              <p className="text-lg text-gray-700 mb-8">
                Satsankalpa Advocacy is more than just a membership program. It's a global movement of passionate
                individuals committed to making a real difference in the world. Our diverse network of supporters brings
                unique skills, perspectives, and resources to further our mission.
              </p>
              <Link href="/about" className={cn(buttonVariants({ size: "lg" }))}>
                Our Story <ArrowRight className="ml-2" />
              </Link>
            </div>
            <div className="flex-1">
              {/* Placeholder for about image or video */}
              <div className="w-full aspect-video bg-gray-200 rounded-lg animate-pulse">
                {/* Comment: This should be replaced with an inspiring image or video about Satsankalpa's work */}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Join Us Section
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Join Satsankalpa Advocacy?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Globe className="w-12 h-12 text-primary" />,
                title: "Global Impact",
                description: "Be part of a worldwide network making positive changes across borders.",
              },
              {
                icon: <Users className="w-12 h-12 text-primary" />,
                title: "Community",
                description: "Connect with like-minded individuals passionate about social change.",
              },
              {
                icon: <Zap className="w-12 h-12 text-primary" />,
                title: "Empowerment",
                description: "Gain skills and knowledge to become a more effective advocate.",
              },
              {
                icon: <Heart className="w-12 h-12 text-primary" />,
                title: "Meaningful Contribution",
                description: "Directly contribute to projects that align with your values.",
              },
              {
                icon: <Award className="w-12 h-12 text-primary" />,
                title: "Recognition",
                description: "Get acknowledged for your efforts and achievements in advocacy.",
              },
              {
                icon: <ArrowRight className="w-12 h-12 text-primary" />,
                title: "Personal Growth",
                description: "Develop leadership skills and expand your professional network.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                <div className="mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
*/}
      <section className="py-20 bg-white">
      <div
          ref={statsRef}
          className="relative md:max-w-[1150px] mt-16 mx-auto px-[16px] md:px-0"
        >
          <h2 className="text-center font-heading text-3xl  font-extrabold leading-[1.1] sm:text-xl md:text-4xl mb-4">
            Over 16,000 Volunteers{" "}
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-center flex-grow space-y-5 md:space-y-0 md:space-x-5">
            <Card className="w-full md:flex-1">
              <CardHeader>
                <CardTitle>
                  {isVisible && <NumberTicker value={isVisible ? 16000 : 0} key={isVisible} />}
                </CardTitle>
                <CardDescription className="whtespace-pre-wrap font-medium tracking-tighter text-black dark:text-white">
                  Volunteers
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="w-full md:flex-1">
              <CardHeader>
                <CardTitle>
                  {isVisible && <NumberTicker value={isVisible ? 19 : 0} key={isVisible} />}
                </CardTitle>
                <CardDescription className="whitespace-pre-wrap font-medium tracking-tighter text-black dark:text-white">
                  Countries
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="w-full md:flex-1">
              <CardHeader>
                <CardTitle>
                  {isVisible && <NumberTicker value={isVisible ? 124 : 0} key={isVisible} />}
                </CardTitle>
                <CardDescription className="whitespace-pre-wrap font-medium tracking-tighter text-black dark:text-white">
                  Partners
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="w-full md:flex-1">
              <CardHeader>
                <CardTitle>
                  {isVisible && <NumberTicker value={isVisible ? 32 : 0} key={isVisible} />}
                </CardTitle>
                <CardDescription className="whitespace-pre-wrap font-medium tracking-tighter text-black dark:text-white">
                  Awards
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="w-full md:flex-1">
              <CardHeader>
                <CardTitle>
                  {isVisible && <NumberTicker value={isVisible ? 2123 : 0} key={isVisible} />}
                </CardTitle>
                <CardDescription className="whitespace-pre-wrap font-medium tracking-tighter text-black dark:text-white">
                  Projects
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>
       

      {/* Our Impact
      <section className="py-20 bg-primary text-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { number: "10,000+", label: "Advocates Worldwide" },
              { number: "50+", label: "Countries Reached" },
              { number: "100+", label: "Successful Projects" },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-xl">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section> */}


{/* 
      // <section className="py-20 bg-gradient-to-r from-primary to-primary text-white">
      //   <div className="container mx-auto px-4 text-center">
      //     <h2 className="text-4xl font-bold mb-6">Ready to Make a Difference?</h2>
      //     <p className="text-xl mb-8 max-w-2xl mx-auto">
      //       Join Satsankalpa Advocacy today and become part of a global movement working towards positive change. Your
      //       voice matters, your actions count.
      //     </p>
      //     <div className="space-x-4">
      //       <Link href="/signup" className={cn(buttonVariants({ size: "lg", variant: "secondary" }))}>
      //         Join Now
      //       </Link>
      //       <Link href="/contact" className={cn(buttonVariants({ size: "lg", variant: "secondary" }), "text-black")}>
      //         Contact Us
      //       </Link>
      //     </div>
      //   </div>
      // </section> */}

      <Footer />
    </>
  )
}


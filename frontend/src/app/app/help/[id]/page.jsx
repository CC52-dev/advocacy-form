'use client'

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ChevronLeft } from 'lucide-react'
import { Button, buttonVariants } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MDXRemote } from 'next-mdx-remote'
import { cn } from "@/lib/utils"
import { format } from 'date-fns'

export default function BlogPost({ title, description, date, slug, image, content }) {
  return (
    <article className="container max-w-3xl px-6 py-6 lg:py-12 ">
      <div className="space-y-8">
      <Link
        href="/blog"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          ""
        )}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        See all posts
      </Link>
        {/* Post Header */}
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Published on {format(new Date(date), 'MMMM d, yyyy')}
          </div>
          <h1 className="text-4xl font-bold">{title}</h1>
          <p className="text-xl text-muted-foreground">{description}</p>
          <div className="flex items-center space-x-2">
            <Image
              src="https://avatar.vercel.sh/cc52-dev"
              alt="Author avatar"
              width={40}
              height={40}
              className="rounded-full"
            />
            <div className="text-sm">
              <div className="font-medium">Eshwar Balaji Yogesh</div>
              <div className="text-muted-foreground">@CC52-dev</div>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <Image
          src={image}
          alt="Blog post illustration"
          width={800}
          height={400}
          className="rounded-lg border bg-muted"
          priority
        />

        {/* Content */}
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <MDXRemote 
            {...content}
            components={{
              h1: (props) => <h1 {...props} className="text-3xl font-bold mt-8 mb-4" />,
              h2: (props) => <h2 {...props} className="text-2xl font-semibold mt-6 mb-3" />,
              h3: (props) => <h3 {...props} className="text-xl font-semibold mt-5 mb-2" />,
              h4: (props) => <h4 {...props} className="text-lg font-semibold mt-4 mb-2" />,
              p: (props) => <p {...props} className="my-4" />,
              a: (props) => <a {...props} className="text-blue-600 hover:underline" />,
              code: (props) => <code {...props} className="bg-gray-100 rounded p-1" />,
              pre: (props) => <pre {...props} className="bg-gray-100 rounded p-4 overflow-x-auto" />,
              ul: (props) => <ul {...props} className="list-disc pl-6 my-4" />,
              ol: (props) => <ol {...props} className="list-decimal pl-6 my-4" />,
              li: (props) => <li {...props} className="my-1" />,
              blockquote: (props) => <blockquote {...props} className="border-l-4 border-gray-300 pl-4 italic my-4" />,
              Image: (props) => <img {...props} className="rounded-lg my-6" />,
              table: (props) => <table {...props} className="min-w-full border-collapse my-6" />,
              th: (props) => <th {...props} className="border border-gray-300 px-4 py-2 bg-gray-50" />,
              td: (props) => <td {...props} className="border border-gray-300 px-4 py-2" />,
              hr: (props) => <hr {...props} className="my-8 border-gray-200" />,
              Callout: (props) => (
                <div className="my-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r">
                  <div className="flex items-center space-x-2">
                    {/* <InfoIcon className="h-5 w-5 text-blue-500" /> */}
                    <div>{props.children}</div>
                  </div>
                </div>
              ),
            }}          />
        </div>
      </div>
    </article>
  )
}

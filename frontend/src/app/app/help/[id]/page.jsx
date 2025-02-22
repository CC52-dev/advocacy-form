"use client";
import articles from "@/data/articles.json";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import remarkGfm from "remark-gfm";

export default function Page({ params }) {
  const [id, setId] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mdxSource, setMdxSource] = useState(null);
  const [article, setArticle] = useState(null);
  useEffect(() => {
    const fetchSlug = async () => {
      const slug = (await params).id;
      setId(Number.parseInt(slug));
      const foundArticle = await articles.find(
        (article) => article.id === Number.parseInt(slug)
      );
      setArticle(foundArticle);
      if (foundArticle) {
        const serializedContent = await serialize(foundArticle.content, {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        });
        setMdxSource(serializedContent);
      }
      setLoading(false);
    };
    fetchSlug();
  }, [params]);

  if (loading || !mdxSource) {
    return (
      <div className="container max-w-3xl px-6 py-6 lg:py-12">
        <div className="animate-pulse space-y-8">
          {/* Back button skeleton */}
          <div className="h-9 w-24 bg-gray-200 rounded" />
          
          {/* Header section skeleton */}
          <div className="space-y-4">
            <div className="h-5 w-40 bg-gray-200 rounded" /> {/* Date */}
            <div className="h-12 w-3/4 bg-gray-200 rounded" /> {/* Title */}
            <div className="h-8 w-2/3 bg-gray-200 rounded" /> {/* Description */}
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 bg-gray-200 rounded-full" /> {/* Avatar */}
              <div className="space-y-2">
                <div className="h-4 w-32 bg-gray-200 rounded" /> {/* Author name */}
                <div className="h-4 w-40 bg-gray-200 rounded" /> {/* Author email */}
              </div>
            </div>
          </div>

          {/* Featured image skeleton */}
          <div className="h-[400px] w-full bg-gray-200 rounded-lg" />

          {/* Content skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="h-8 w-2/3 bg-gray-200 rounded" /> {/* Heading */}
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
            </div>

            <div className="space-y-3">
              <div className="h-6 w-1/2 bg-gray-200 rounded" /> {/* Subheading */}
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-4/5 bg-gray-200 rounded" />
            </div>

            <div className="h-[200px] w-full bg-gray-200 rounded-lg" /> {/* Image placeholder */}

            <div className="space-y-3">
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }
  if (!article) {
    return <div>Article not found</div>;
  }
  const title = article?.title;
  const description = article?.description;
  const date = article?.date;
  const image = article?.image;
  const author = article?.author;
  return (
    <div className="container max-w-3xl px-6 py-6 lg:py-12 space-y-8">
      {/* Post Header */}
      <div className="space-y-4">
        <Button className="" size="sm" asChild>
          <Link href="/app/help">
            <ChevronLeft />
            Back
          </Link>
        </Button>
        <div className="text-sm text-muted-foreground">
          Published on {format(new Date(date), "MMMM d, yyyy")}
        </div>
        <h1 className="text-4xl font-bold">{title}</h1>
        <p className="text-xl text-muted-foreground">{description}</p>
        <div className="flex items-center space-x-2">
          <Image
            src={`https://avatar.vercel.sh/${author.name}`}
            alt="Author avatar"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div className="text-sm">
            <div className="font-medium">{author.name}</div>
            <div className="text-muted-foreground">{author.email}</div>
          </div>
        </div>
      </div>

      <Image
        src={image}
        alt="Blog post illustration"
        width={800}
        height={400}
        className="rounded-lg border bg-muted aspect-video"
        priority
      />

      {/* Content */}
      <div className="prose prose-gray dark:prose-invert max-w-none">
        <MDXRemote
          {...mdxSource}
          components={{
            h1: (props) => (
              <h1 {...props} className="text-3xl font-bold mt-8 mb-4" />
            ),
            h2: (props) => (
              <h2 {...props} className="text-2xl font-semibold mt-6 mb-3" />
            ),
            h3: (props) => (
              <h3 {...props} className="text-xl font-semibold mt-5 mb-2" />
            ),
            h4: (props) => (
              <h4 {...props} className="text-lg font-semibold mt-4 mb-2" />
            ),
            p: (props) => <p {...props} className="my-4" />,
            a: (props) => (
              <a {...props} className="text-blue-600 hover:underline" />
            ),
            code: (props) => (
              <code {...props} className="bg-gray-100 rounded p-1" />
            ),
            pre: (props) => (
              <pre
                {...props}
                className="bg-gray-100 rounded p-4 overflow-x-auto"
              />
            ),
            ul: (props) => <ul {...props} className="list-disc pl-6 my-4" />,
            ol: (props) => <ol {...props} className="list-decimal pl-6 my-4" />,
            li: (props) => <li {...props} className="my-1" />,
            blockquote: (props) => (
              <blockquote
                {...props}
                className="border-l-4 border-gray-300 pl-4 italic my-4"
              />
            ),
            Image: (props) => (
              <img
                {...props}
                className="rounded-lg my-6 aspect-video max-w-[800px] max-h-[400px]"
                alt={props.alt || "Article image"}
              />
            ),
            table: (props) => (
              <table {...props} className="min-w-full border-collapse my-6" />
            ),
            th: (props) => (
              <th
                {...props}
                className="border border-gray-300 px-4 py-2 bg-gray-50"
              />
            ),
            td: (props) => (
              <td {...props} className="border border-gray-300 px-4 py-2" />
            ),
            hr: (props) => <hr {...props} className="my-8 border-gray-200" />,
            Callout: (props) => (
              <div className="my-6 p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r">
                <div className="flex items-center space-x-2">
                  {/* <InfoIcon className="h-5 w-5 text-blue-500" /> */}
                  <div>{props.children}</div>
                </div>
              </div>
            ),
          }}
        />
      </div>
    </div>
  );
}

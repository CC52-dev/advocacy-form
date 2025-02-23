"use client";
import { useState } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import articles from "@/data/articles.json";

export default function Page() {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                <div className="flex items-start justify-start flex-col">
                    <code className="text-2xl md:text-5xl lg:text-6xl font-bold text-left py-4 md:py-6 lg:py-8">
                        Help
                    </code>
                    <article className="container py-6 lg:py-12">
                        <div className="space-y-8">
                            <div className="relative">
                                <Input
                                    type="text"
                                    placeholder="Search help articles..."
                                    className="w-full"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredArticles.map((article) => (
                                    <Link href={article.link} key={article.id}>
                                        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                                            <CardHeader>
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <CardTitle>{article.title}</CardTitle>
                                                        <CardDescription className="mt-2">{article.description}</CardDescription>
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">{article.category}</span>
                                                </div>
                                                {article.image && (
                                                    <div className="mt-4">
                                                        <Image
                                                            src={article.image}
                                                            alt={article.title}
                                                            width={400}
                                                            height={400}
                                                            className="rounded-lg aspect-video object-scale-down"
                                                        />
                                                    </div>
                                                )}
                                            </CardHeader>
                                            <CardContent>
                                                <div className="text-sm text-muted-foreground">
                                                    Published on {new Date(article.date).toLocaleDateString()}
                                                </div>
                                            </CardContent>
                                            <CardFooter>
                                                <div className="flex items-center text-sm text-primary">
                                                    Open article <ArrowRight className="ml-2 h-4 w-4" />
                                                </div>
                                            </CardFooter>
                                        </Card>
                                    </Link>
                                ))}
                            </div>                        </div>
                    </article>
                </div>
            </div>
        </>
    );
}
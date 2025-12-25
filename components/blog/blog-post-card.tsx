'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock } from 'lucide-react';
import type { BlogPost } from '@/components/blog/post-card';

interface BlogPostCardProps {
  post: BlogPost;
  locale: string;
}

export function BlogPostCard({ post, locale }: BlogPostCardProps) {
  return (
    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group cursor-pointer flex flex-col">
      <Link href={post.slug.startsWith('/') ? post.slug : `/blog/${post.slug}`}>
        <div className="relative aspect-video overflow-hidden">
          {post.attachments && post.attachments.length > 0 ? (
            <img
              src={post.attachments[0].url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          {post.categories && post.categories.length > 0 && (
            <div className="absolute top-4 left-4">
              <Badge className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                {post.categories[0]}
              </Badge>
            </div>
          )}
          {post.readingTime && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">{post.readingTime} min</span>
            </div>
          )}
        </div>
        <div className="px-6 pt-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4 flex-grow">
            {post.excerpt}
            <span className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm mt-2 group-hover:gap-2 transition-all">
              {locale === 'es' ? 'Leer más' : 'Read more'}
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform ml-1" />
            </span>
          </p>
          
          {/* Author */}
          <div className="flex items-center pt-2 pb-6 border-t border-border/30">
            <div className="flex items-center gap-2">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="rounded-full size-8 object-cover"
                />
              ) : (
                <div className="rounded-full size-8 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                  {post.author.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2)}
                </div>
              )}
              <span className="text-xs font-medium text-foreground">
                {post.author.name}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </Card>
  );
}


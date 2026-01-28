'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock } from 'lucide-react';
import type { BlogPost } from '@/components/blog/post-card';
import { getBlogCategoryLabel } from '@/config/categories';

interface BlogPostCardProps {
  post: BlogPost;
  locale: string;
}

export function BlogPostCard({ post, locale }: BlogPostCardProps) {
  return (
    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group cursor-pointer flex flex-col w-full">
      <Link href={post.slug.startsWith('/') ? post.slug : `/blog/${post.slug}`} className="flex flex-col h-full">
        <div className="relative aspect-video overflow-hidden flex-shrink-0">
          {post.attachments && post.attachments.length > 0 ? (
            <img
              src={post.attachments[0].url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-muted" />
          )}
          {/* Gradient overlay at bottom for better readability */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />
          {post.categories && post.categories.length > 0 && (
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-2 max-w-[calc(100%-80px)]">
              {post.categories.map((categoryKey, idx) => {
                const categoryLabel = getBlogCategoryLabel(categoryKey, locale as 'en' | 'es');
                return (
                  <Badge 
                    key={idx}
                    className="bg-white/75 dark:bg-gray-900/75 text-gray-900 dark:text-gray-100 backdrop-blur-sm shadow-lg border-0"
                  >
                    {categoryLabel}
                  </Badge>
                );
              })}
            </div>
          )}
          {post.readingTime && (
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-2 py-1 rounded-full">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">{post.readingTime} min</span>
            </div>
          )}
        </div>
        <div className="px-6 pt-6 flex flex-col flex-grow min-h-0">
          <h3 className="text-xl font-bold mb-2 line-clamp-2">
            {post.title}
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {post.excerpt}
          </p>
          <div className="mb-4">
            <span className="flex items-center text-indigo-600 dark:text-indigo-400 font-medium text-sm group-hover:gap-2 transition-all">
              {locale === 'es' ? 'Leer más' : 'Read more'}
              <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform ml-1" />
            </span>
          </div>
          
          {/* Author - Always at bottom */}
          <div className="flex items-center pt-2 pb-6 border-t border-border/30 mt-auto">
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


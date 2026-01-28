'use client';

import { useState } from 'react';
import Link from 'next/link';
import moment from 'moment';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Eye, 
  Share2,
  Play,
  Clock
} from 'lucide-react';
import { getBlogCategoryLabel } from '@/config/categories';

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  viewCount: number;
  author: {
    name: string;
    avatar?: string;
  };
  categories: string[];
  attachments: Array<{
    id: number;
    url: string;
    type: 'image' | 'video';
  }>;
  likes: number;
  comments: number;
  hasVideo?: boolean;
  readingTime?: number;
}

interface PostCardProps {
  post: BlogPost;
  locale?: 'en' | 'es';
}

export function PostCard({ post, locale = 'es' }: PostCardProps) {
  const formatDate = (dateString: string) => {
    return moment(dateString).fromNow();
  };

  const getAuthorInitials = () => {
    const names = post.author.name.split(' ');
    return names.map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };

  return (
    <div className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full flex flex-col group bg-background rounded-2xl">
      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* 1. Title - First */}
        <Link href={post.slug.startsWith('/') ? post.slug : `/blog/${post.slug}`}>
          <h2 className="text-lg font-bold text-foreground leading-snug cursor-pointer line-clamp-2 mb-3">
            {post.title}
          </h2>
        </Link>

        {/* 2. Date + Reading Time - Second */}
        <div className="flex items-center gap-3 mb-4">
          <p className="text-xs text-muted-foreground">{formatDate(post.publishedAt)}</p>
          {post.readingTime && (
            <>
              <span className="text-xs text-muted-foreground/50">•</span>
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-xs">{post.readingTime} min</span>
              </div>
            </>
          )}
        </div>

        {/* 3. Image/Video - Third */}
        {post.attachments.length > 0 && (
          <Link href={post.slug.startsWith('/') ? post.slug : `/blog/${post.slug}`}>
            <div className="relative w-full aspect-video overflow-hidden bg-muted rounded-xl mb-4 group/image cursor-pointer">
            {post.hasVideo ? (
                <>
                  {/* Video thumbnail with play button */}
                  <div className="relative w-full h-full bg-gradient-to-br from-indigo-600/10 via-purple-600/10 to-pink-600/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20">
                    {/* Subtle pattern background */}
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                    }} />
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover/image:bg-black/30 transition-all duration-500 ease-out">
                      <div className="flex flex-col items-center gap-3">
                        <div className="size-20 rounded-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-md flex items-center justify-center shadow-2xl group-hover/image:scale-110 group-hover/image:shadow-indigo-500/50 transition-all duration-500 ease-out">
                          <Play className="h-10 w-10 text-indigo-600 dark:text-indigo-400 fill-current ml-1 group-hover/image:scale-110 transition-transform duration-300" />
                        </div>
                        <span className="text-sm font-semibold text-white backdrop-blur-sm px-4 py-1.5 rounded-full bg-black/40 border border-white/20 group-hover/image:bg-black/50 transition-all duration-300">
                          Ver video
                        </span>
                      </div>
                    </div>
                  </div>
                </>
            ) : (
              <img
                src={post.attachments[0].url}
                alt={post.title}
                  className="w-full h-full object-cover group-hover/image:scale-110 transition-transform duration-500 ease-out"
              />
            )}
              {/* Overlay gradient for images */}
              {!post.hasVideo && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300" />
              )}
              {/* Gradient overlay at bottom for better readability of categories */}
              <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none" />
            {/* Category Badges on Image - Bottom */}
            {post.categories.length > 0 && (
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5 max-w-[calc(100%-24px)]">
                  {post.categories.slice(0, 2).map((categoryKey, idx) => {
                    const categoryLabel = getBlogCategoryLabel(categoryKey, locale);
                    return (
                      <Badge 
                        key={idx}
                        className="text-xs font-semibold bg-white/75 dark:bg-gray-900/75 text-gray-900 dark:text-gray-100 backdrop-blur-sm shadow-lg border-0"
                      >
                        {categoryLabel}
                      </Badge>
                    );
                  })}
                  {post.categories.length > 2 && (
                    <Badge className="text-xs font-semibold bg-white/75 dark:bg-gray-900/75 text-gray-900 dark:text-gray-100 backdrop-blur-sm shadow-lg border-0">
                      +{post.categories.length - 2}
                    </Badge>
                  )}
              </div>
            )}
          </div>
          </Link>
        )}
        
        {/* 4. Description - Fourth */}
        {post.excerpt && (
          <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
            {post.excerpt}
          </p>
        )}

        {/* 5. Author Info + Categories - Fifth */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <div className="relative">
              {post.author.avatar ? (
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="rounded-full size-7 object-cover"
                />
              ) : (
                <div className="rounded-full size-7 bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                  {getAuthorInitials()}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{post.author.name}</p>
            </div>
          </div>
          {post.categories.length > 0 && (
            <div className="flex items-center gap-1">
              {post.categories.slice(0, 2).map((category) => (
                <Badge 
                  key={category} 
                  variant="outline" 
                  className="text-xs px-2 py-0.5"
                >
                  {category}
                </Badge>
              ))}
              {post.categories.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0.5">
                  +{post.categories.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


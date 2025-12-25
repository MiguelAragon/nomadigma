'use client';

import { memo } from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { SafeHtmlContent } from '@/components/editor/safe-html-content';
import { Calendar, Clock } from 'lucide-react';
import moment from 'moment';

interface BlogPostViewProps {
  title: string;
  description?: string;
  content: string;
  coverImage?: string;
  date: string;
  readingTime: number;
  hashtags: string[];
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  slug?: string;
  locale: string;
  animate?: boolean;
}

function BlogPostViewComponent({
  title,
  description,
  content,
  coverImage,
  date,
  readingTime,
  hashtags,
  author,
  slug,
  locale,
  animate = true,
}: BlogPostViewProps) {
  const MotionDiv = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  } : {};

  return (
    <div>
      {/* Post Header */}
      <MotionDiv
        {...animationProps}
        {...(animate && { transition: { duration: 0.6 } })}
        className="mb-8"
      >
        {/* Slug (opcional) */}
        {slug && (
          <div className="flex justify-end mb-2">
            <p className="text-sm text-muted-foreground/70">
              /{locale}/blog/{slug}
            </p>
          </div>
        )}

        {/* Título */}
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-none">
          {title}
        </h1>

        {/* Descripción */}
        {description && (
          <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
            {description}
          </p>
        )}

        {/* Fecha y Reading Time */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
          <div className="flex items-center gap-1">
            <Calendar className="size-4" />
            {moment(date).format('MMMM DD, YYYY')}
          </div>
          <div className="flex items-center gap-1">
            <Clock className="size-4" />
            {readingTime} min
          </div>
        </div>
      </MotionDiv>

      {/* Cover Image */}
      {coverImage && (
        <MotionDiv
          {...animationProps}
          {...(animate && { transition: { duration: 0.6, delay: 0.2 } })}
          className="mb-8"
        >
          <img
            src={coverImage}
            alt={title}
            className="w-full h-96 object-cover rounded-xl shadow-lg"
          />
        </MotionDiv>
      )}

      {/* Post Content */}
      <MotionDiv
        {...animationProps}
        {...(animate && { transition: { duration: 0.6, delay: 0.4 } })}
        className="mb-8 w-full"
      >
        {content ? (
          <div className="w-full">
            <SafeHtmlContent content={content} />
          </div>
        ) : (
          <p className="text-muted-foreground italic">
            {locale === 'es' ? 'No hay contenido disponible' : 'No content available'}
          </p>
        )}
      </MotionDiv>

      {/* Tags y Author Info */}
      <MotionDiv
        {...animationProps}
        {...(animate && { transition: { duration: 0.6, delay: 0.6 } })}
        className="pt-8 pb-8 border-t border-border/50"
      >
        {/* Tags */}
        {hashtags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {hashtags.map((hashtag) => (
              <Badge 
                key={hashtag} 
                className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-200 dark:border-purple-700"
              >
                {hashtag}
              </Badge>
            ))}
          </div>
        )}

        {/* Author Info */}
        <div className="flex items-center gap-4">
          {author.avatar ? (
            <img
              src={author.avatar}
              alt={author.name}
              className="size-20 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="size-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xl font-semibold flex-shrink-0">
              {author.name[0]?.toUpperCase() || 'U'}
            </div>
          )}
          <div className="flex-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
              {locale === 'es' ? 'El Autor' : 'The Author'}
            </p>
            <h3 className="font-bold text-xl">
              {author.name}
            </h3>
            {author.bio && (
              <p className="text-foreground text-lg leading-relaxed font-medium mt-4">
                {author.bio}
              </p>
            )}
          </div>
        </div>
      </MotionDiv>
    </div>
  );
}

export const BlogPostView = memo(BlogPostViewComponent);


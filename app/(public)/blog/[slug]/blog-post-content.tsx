'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { BlogPostView } from '@/components/blog/blog-post-view';
import { Container } from '@/components/ui/container';

interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  viewCount: number;
  author: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  categories: string[];
  hashtags: string[];
  attachments: Array<{
    id: number;
    url: string;
    type: 'image' | 'video';
  }>;
  likes: number;
  comments: number;
  readingTime?: number;
}

interface BlogPostContentProps {
  post: BlogPost;
  locale: string;
  translations: {
    'blog.back_to_blog': string;
    'blog.post_not_found': string;
    'blog.preview.no_content': string;
  };
}

export function BlogPostContent({ post, locale, translations }: BlogPostContentProps) {
  const [readingProgress, setReadingProgress] = useState(0);
  const authorRef = useRef<HTMLDivElement>(null);

  const calculateReadingTime = (content: string): number => {
    if (!content) return 0;
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).filter(word => word.length > 0);
    return Math.ceil(words.length / 200);
  };

  const readingTime = useMemo(
    () => post.readingTime || calculateReadingTime(post.content),
    [post.readingTime, post.content]
  );

  // Calcular progreso de lectura
  useEffect(() => {
    let rafId: number;

    const handleScroll = () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }

      rafId = requestAnimationFrame(() => {
        if (!authorRef.current) return;

        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const authorBottom = authorRef.current.offsetTop + authorRef.current.offsetHeight;
        const startPoint = 0;
        const endPoint = authorBottom - windowHeight;
        const totalDistance = endPoint - startPoint;

        let progress = 0;

        if (totalDistance <= 0) {
          progress = 100;
        } else if (scrollY <= startPoint) {
          progress = 0;
        } else if (scrollY >= endPoint) {
          progress = 100;
        } else {
          progress = ((scrollY - startPoint) / totalDistance) * 100;
        }

        setReadingProgress(Math.min(100, Math.max(0, progress)));
      });
    };

    const handleResize = () => {
      handleScroll();
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });
    handleScroll();

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <Container className="min-h-screen pt-20">
      {/* Reading Progress Bar */}
      <div 
        className="fixed top-[60px] left-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 z-50 transition-none"
        style={{ 
          width: `${readingProgress}%`,
        }}
      />

      <div className="py-8">
        <article 
          itemScope 
          itemType="https://schema.org/BlogPosting"
          className="prose prose-lg dark:prose-invert max-w-none"
        >
          {/* Hidden metadata for schema */}
          <meta itemProp="headline" content={post.title} />
          <meta itemProp="description" content={post.excerpt} />
          <meta itemProp="datePublished" content={post.publishedAt} />
          <meta itemProp="author" content={post.author.name} />
          {post.attachments[0]?.url && (
            <meta itemProp="image" content={post.attachments[0].url} />
          )}

          <BlogPostView
            title={post.title}
            description={post.excerpt}
            content={post.content}
            coverImage={post.attachments[0]?.url}
            date={post.publishedAt}
            readingTime={readingTime}
            hashtags={post.hashtags}
            author={{
              name: post.author.name,
              avatar: post.author.avatar,
              bio: post.author.bio,
            }}
            locale={locale}
            animate={false}
          />

          {/* Ref for author section to calculate reading progress */}
          <div ref={authorRef} className="h-0" />
        </article>
      </div>
    </Container>
  );
}

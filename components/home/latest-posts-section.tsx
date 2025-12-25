'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock } from 'lucide-react';
import type { BlogPost } from '@/components/blog/post-card';

export function LatestPostsSection() {
  const { t, locale } = useTranslation();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/posts?page=1&limit=5&locale=${locale}`);
        if (!response.ok) {
          throw new Error('Failed to fetch posts');
        }

        const data = await response.json();
        const newPosts = data.posts || [];
        
        // Map posts to include full slug path
        const mappedPosts = newPosts.map((post: BlogPost) => ({
          ...post,
          slug: `/${locale}/blog/${post.slug}`,
          id: parseInt(post.id.toString()) || Math.random(),
        }));

        setPosts(mappedPosts);
      } catch (error) {
        console.error('Error fetching latest posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestPosts();
  }, [locale]);

  const sectionTitle = locale === 'es' ? 'Últimos posts' : 'Latest posts';
  const viewMoreText = locale === 'es' ? 'Ver más' : 'View more';

  return (
    <section className="py-16 bg-background border-t border-border/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex-1">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                {sectionTitle}
              </h2>
            </div>
            <Button
              variant="ghost"
              className="gap-2"
              asChild
            >
              <Link href={`/${locale}/blog`}>
                {viewMoreText}
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Horizontal Scroll Container */}
        <div className="relative">
          <div className="overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6">
            <div className="flex gap-6 min-w-max">
              {loading ? (
                // Show 5 skeletons while loading
                Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="w-[380px] flex-shrink-0">
                    <Card className="overflow-hidden h-full">
                      <div className="relative aspect-video bg-muted animate-pulse" />
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded animate-pulse" />
                        <div className="h-4 bg-muted rounded w-3/4 animate-pulse" />
                      </div>
                    </Card>
                  </div>
                ))
              ) : posts.length > 0 ? (
                posts.map((post, index) => (
                  <motion.div
                    key={`${post.id}-${index}`}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="w-[380px] flex-shrink-0"
                  >
                    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow group cursor-pointer flex flex-col">
                      <Link href={post.slug}>
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
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <p>{locale === 'es' ? 'No hay posts disponibles' : 'No posts available'}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}


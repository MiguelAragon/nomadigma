'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { BlogPostCard } from '@/components/blog/blog-post-card';
import { BlogPostCardSkeleton } from '@/components/blog/blog-post-card-skeleton';
import type { BlogPost } from '@/components/blog/post-card';
import { CompactFilters, type CompactFiltersState } from '@/components/blog/compact-filters';
import { Container } from '@/components/ui/container';

export default function BlogPage() {
  const { t, locale } = useTranslation();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<CompactFiltersState>({
    search: '',
    categories: [],
  });
  
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch posts from API
  const fetchPosts = useCallback(async (pageNum: number, reset: boolean = false) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await fetch(`/api/posts?page=${pageNum}&limit=12&locale=${locale}`);
      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const data = await response.json();
      const newPosts = data.posts || [];
      
      // Map posts to include full slug path
      const mappedPosts = newPosts.map((post: BlogPost) => ({
        ...post,
        slug: `/blog/${post.slug}`,
        id: parseInt(post.id.toString()) || Math.random(), // Ensure numeric ID
      }));

      if (reset) {
        setPosts(mappedPosts);
      } else {
        setPosts(prev => [...prev, ...mappedPosts]);
      }

      setHasMore(data.pagination?.hasMore || false);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [locale]);

  // Initial load
  useEffect(() => {
    fetchPosts(1, true);
  }, [locale]); // Reload when locale changes

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loadingMore, loading, page, fetchPosts]);

  // Filter posts based on selected filters
  const filteredPosts = posts.filter(post => {
    const matchesSearch = !filters.search || 
      post.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesCategories = filters.categories.length === 0 ||
      filters.categories.some(cat => post.categories.includes(cat));
    
    return matchesSearch && matchesCategories;
  });

  // Sort posts by date (newest first)
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });

  const hasActiveFilters = Boolean(
    filters.search || 
    filters.categories.length > 0
  );

  return (
    <Container className="bg-background">
      {/* Filters Section - Top */}
      <section className="pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <CompactFilters filters={filters} onFiltersChange={setFilters} />
        </motion.div>
      </section>
      
      {/* Main Section */}
      <section className="py-8 flex-1">
          {/* Content */}
          <div>
              {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <BlogPostCardSkeleton key={index} />
                  ))}
                </div>
              )}

              {!loading && sortedPosts.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-20"
                >
                  <p className="text-2xl font-semibold text-muted-foreground mb-2">
                    {t('blog.no_posts')}
                  </p>
                  <p className="text-muted-foreground mb-6">
                    {t('blog.no_posts_description')}
                  </p>
                </motion.div>
              )}

              {!loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                  {sortedPosts.map((post, index) => (
                    <motion.div
                      key={`${post.id}-${index}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <BlogPostCard post={post} locale={locale} />
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Infinite Scroll Trigger & Loader */}
            {!loading && sortedPosts.length > 0 && (
                <div ref={observerTarget} className="mt-8">
                  {loadingMore && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <BlogPostCardSkeleton key={`loading-${index}`} />
                      ))}
                    </div>
                  )}
              </div>
            )}
          </div>
      </section>
    </Container>
  );
}



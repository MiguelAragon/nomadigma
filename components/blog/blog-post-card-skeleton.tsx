'use client';

import { Card } from '@/components/ui/card';

export function BlogPostCardSkeleton() {
  return (
    <Card className="overflow-hidden h-full">
      <div className="relative aspect-video bg-muted animate-pulse" />
      <div className="p-6 space-y-4">
        {/* Title skeleton */}
        <div className="h-6 bg-muted rounded animate-pulse" />
        {/* Description skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded w-5/6 animate-pulse" />
          <div className="h-4 bg-muted rounded w-4/6 animate-pulse" />
        </div>
        {/* Author and Reading Time skeleton */}
        <div className="flex items-center justify-between pt-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-full bg-muted animate-pulse" />
            <div className="h-3 w-20 bg-muted rounded animate-pulse" />
          </div>
          <div className="h-3 w-12 bg-muted rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
}


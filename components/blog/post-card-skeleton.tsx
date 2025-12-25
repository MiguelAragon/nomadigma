'use client';

export function PostCardSkeleton() {
  return (
    <div className="overflow-hidden h-full flex flex-col bg-background rounded-2xl">
      {/* Content */}
      <div className="p-6 flex flex-col flex-grow">
        {/* Title skeleton */}
        <div className="mb-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-3/4 mb-2 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
          </div>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-md w-1/2 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
          </div>
        </div>

        {/* Date + Reading Time skeleton */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
          </div>
        </div>

        {/* Image skeleton */}
        <div className="relative w-full aspect-video overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-xl mb-4">
          <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
        </div>

        {/* Description skeleton */}
        <div className="mb-4 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
          </div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 relative overflow-hidden">
            <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
          </div>
        </div>

        {/* Author Info + Categories skeleton */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
            </div>
            <div className="space-y-1">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded w-16 relative overflow-hidden">
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
            </div>
            <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-14 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/30">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
            </div>
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8 relative overflow-hidden">
              <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/60 dark:via-white/20 to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


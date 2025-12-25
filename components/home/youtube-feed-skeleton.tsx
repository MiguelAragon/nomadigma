'use client';

export function YouTubeFeedSkeleton() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="h-10 bg-muted rounded w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-muted rounded w-96 mx-auto animate-pulse" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Video grande skeleton */}
          <div className="lg:col-span-2">
            <div className="relative aspect-video rounded-lg overflow-hidden bg-muted animate-pulse" />
          </div>

          {/* Videos pequeños skeleton */}
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, index) => (
              <div key={index} className="relative aspect-video rounded-lg overflow-hidden bg-muted animate-pulse" />
            ))}
          </div>
        </div>

        {/* Botón skeleton */}
        <div className="text-center mt-12">
          <div className="h-12 bg-muted rounded w-48 mx-auto animate-pulse" />
        </div>
      </div>
    </section>
  );
}


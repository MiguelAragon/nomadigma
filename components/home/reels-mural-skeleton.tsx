'use client';

export function ReelsMuralSkeleton() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <div className="h-10 bg-muted rounded w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-muted rounded w-96 mx-auto animate-pulse" />
        </div>

        <div className="overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide">
          <div className="flex gap-4" style={{ width: 'max-content' }}>
            {Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="relative w-[280px] h-[500px] rounded-2xl overflow-hidden bg-muted animate-pulse flex-shrink-0"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}


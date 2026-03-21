export function AccountSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="app-shell rounded-[30px] p-5">
        <div className="space-y-4">
          <div className="h-6 w-28 animate-pulse rounded-full bg-white/10" />
          <div className="h-16 animate-pulse rounded-[24px] bg-white/6" />
          <div className="grid gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                className="h-20 animate-pulse rounded-[22px] bg-white/6"
                key={`sidebar-skeleton-${index}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="app-shell rounded-[34px] p-6">
          <div className="h-6 w-40 animate-pulse rounded-full bg-white/10" />
          <div className="mt-4 h-28 animate-pulse rounded-[26px] bg-white/6" />
        </div>
        <div className="app-shell rounded-[32px] p-6">
          <div className="h-6 w-48 animate-pulse rounded-full bg-white/10" />
          <div className="mt-4 grid gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                className="h-24 animate-pulse rounded-[24px] bg-white/6"
                key={`content-skeleton-${index}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

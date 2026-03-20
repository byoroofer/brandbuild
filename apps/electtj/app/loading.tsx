import { SurfaceCard } from "@/components/ui/surface-card";

export default function Loading() {
  return (
    <div className="page-shell flex flex-col gap-6 py-8">
      <SurfaceCard className="animate-pulse p-8 sm:p-10">
        <div className="space-y-4">
          <div className="h-4 w-32 rounded-full bg-white/10" />
          <div className="h-12 w-full max-w-3xl rounded-2xl bg-white/10" />
          <div className="h-5 w-full max-w-2xl rounded-full bg-white/8" />
          <div className="h-5 w-full max-w-xl rounded-full bg-white/8" />
        </div>
      </SurfaceCard>
      <div className="grid gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <SurfaceCard className="animate-pulse p-8" key={index}>
            <div className="space-y-4">
              <div className="h-4 w-28 rounded-full bg-white/10" />
              <div className="h-8 rounded-2xl bg-white/10" />
              <div className="h-4 rounded-full bg-white/8" />
              <div className="h-4 w-5/6 rounded-full bg-white/8" />
            </div>
          </SurfaceCard>
        ))}
      </div>
    </div>
  );
}

import { MediaFrame, type MediaFrameTone } from "@/components/marketing/media-frame";

type MarqueeItem = {
  badge: string;
  description: string;
  slotId: string;
  title: string;
  tone: MediaFrameTone;
};

type MediaMarqueeProps = {
  items: MarqueeItem[];
};

export function MediaMarquee({ items }: MediaMarqueeProps) {
  const trackItems = [...items, ...items];

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-[#040507] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-[#040507] to-transparent" />

      <div className="brandbuild-marquee-track flex w-max gap-4">
        {trackItems.map((item, index) => (
          <MediaFrame
            badge={item.badge}
            className="h-[240px] min-w-[280px] max-w-[280px]"
            description={item.description}
            key={`${item.slotId}-${index}`}
            slotId={item.slotId}
            title={item.title}
            tone={item.tone}
          />
        ))}
      </div>
    </div>
  );
}

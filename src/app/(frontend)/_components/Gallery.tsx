import Image from "next/image";
import type { GalleryItem } from "@/lib/types";

export function Gallery({ items }: { items: GalleryItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={item._id}
          className="relative aspect-2/3 overflow-hidden rounded-[15px] border border-card-border"
        >
          <Image
            src={item.image.src}
            alt={item.alt}
            width={item.image.width}
            height={item.image.height}
            className="h-full w-full object-cover"
            sizes="(min-width: 1024px) 25vw, 50vw"
          />
        </div>
      ))}
    </div>
  );
}

import type { Metadata } from "next";
import { PageTransition } from "../_components/PageTransition";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Galerie",
  description:
    "Photos et vidéos du studio et des cours.",
  path: "/galerie",
});

// Photos retirées volontairement pour l'instant (à réintégrer en fin de
// projet) - voir <Gallery> dans src/components et getGalleryItems() dans
// src/data/queries, toujours en place et prêtes à être rebranchées.
export default function GaleriePage() {
  return (
    <PageTransition>
      <div className="container-page pt-[var(--vr-104)] pb-8.5">
        <h1 className="mb-9 text-5xl font-black uppercase tracking-tight sm:text-6xl">
          Galerie
        </h1>
        <p className="max-w-lg text-tertiary">
          À implémenter - photos et vidéos à venir.
        </p>
      </div>
    </PageTransition>
  );
}

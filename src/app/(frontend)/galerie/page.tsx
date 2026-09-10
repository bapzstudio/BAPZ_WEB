import type { Metadata } from "next";
import Link from "next/link";
import { Gallery } from "../_components/Gallery";
import { PageTransition } from "../_components/PageTransition";
import { Reveal } from "../_components/Reveal";
import { getGalleryItems, getSiteSettings } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Galerie",
  description: "Photos du studio et des cours de BAPZ Studio, studio de danse à Metz.",
  path: "/galerie",
});

/**
 * Les photos de la rubrique Galerie de l'admin, dans leur ordre d'affichage.
 *
 * Pas de maquette pour cette page : titre et boutons reprennent ceux des autres
 * pages. Tant qu'aucune photo n'est saisie, la page renvoie vers Instagram
 * plutôt que d'annoncer un chantier.
 */
export default async function GaleriePage() {
  const [items, settings] = await Promise.all([getGalleryItems(), getSiteSettings()]);
  const instagram = settings.instagramHandle;

  return (
    <PageTransition>
      <div className="container-page pt-[var(--vr-104)] pb-8.5">
        <h1 className="text-[clamp(38px,3.1vw,59px)] font-black uppercase leading-none tracking-tight">
          Galerie
        </h1>

        {items.length > 0 ? (
          <Reveal className="mt-[var(--vr-64)]">
            <Gallery items={items} />
          </Reveal>
        ) : (
          <>
            <p className="mt-6 max-w-160 text-base leading-[1.3] text-secondary">
              Les photos du studio arrivent bientôt.
              {instagram && " En attendant, les coulisses sont sur Instagram."}
            </p>
            <div className="mt-[var(--vr-64)] flex flex-wrap gap-7">
              {instagram && (
                <a
                  href={`https://www.instagram.com/${instagram.replace(/^@/, "")}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill pill-light"
                >
                  Voir {instagram}
                </a>
              )}
              <Link href="/cours" className="pill pill-outline">
                Voir le calendrier
              </Link>
            </div>
          </>
        )}
      </div>
    </PageTransition>
  );
}

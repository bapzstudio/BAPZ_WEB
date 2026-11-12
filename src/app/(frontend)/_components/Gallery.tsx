import Image from "next/image";
import type { GalleryItem } from "@/lib/types";

/**
 * Une photo plus large que haute occupe deux colonnes au lieu d'une.
 *
 * Seuil à 1 : c'est la définition de « paysage », et le rapport vient du
 * fichier, pas d'une saisie.
 */
const estPaysage = ({ width, height }: GalleryItem["image"]) => width > height;

/**
 * Grille de photos, chacune dans son propre rapport.
 *
 * La page n'a pas de maquette. Jusqu'au 2026-11-12, toute photo était
 * enfermée dans une boîte 2:3 et recadrée par `object-cover` : les photos
 * d'équipe, prises en paysage, perdaient leurs côtés — « on ne voit pas
 * toute la team » (cliente). Elles étaient en plus floues, et pour la même
 * raison : `sizes` décrit la largeur de la BOÎTE, alors que couvrir une
 * boîte 2:3 avec une source paysage demande de l'agrandir d'une fois et
 * demie. Le navigateur chargeait donc un fichier 1,4 à 2 fois trop petit
 * pour ce qu'il peignait (mesuré de 390 à 1920 px : 256 px chargés pour
 * 507 px rendus à 1024 px).
 *
 * En donnant à la boîte le rapport de la photo, les deux défauts tombent
 * ensemble : plus rien n'est coupé, et `sizes` redevient exact.
 */
export function Gallery({ items }: { items: GalleryItem[] }) {
  return (
    <div className="grid grid-cols-2 items-start gap-3.5 lg:grid-cols-4">
      {items.map((item) => {
        const paysage = estPaysage(item.image);
        return (
          <div
            key={item._id}
            // `items-start` sur la grille empêche la rangée d'étirer une
            // photo basse à la hauteur de sa voisine : sans quoi la hauteur
            // de la rangée l'emporterait sur le rapport et la photo serait
            // déformée.
            className={`relative overflow-hidden rounded-[15px] border border-card-border ${
              paysage ? "col-span-2" : ""
            }`}
            style={{ aspectRatio: `${item.image.width} / ${item.image.height}` }}
          >
            <Image
              src={item.image.src}
              alt={item.alt}
              width={item.image.width}
              height={item.image.height}
              // Même qualité que les portraits des profs : la galerie est
              // faite pour être regardée.
              quality={90}
              className="h-full w-full object-cover"
              // La boîte a le rapport de la photo : la largeur annoncée est
              // donc celle que le navigateur peint réellement. Une photo
              // paysage occupe deux colonnes sur quatre (la moitié de la
              // largeur), ou les deux colonnes du téléphone.
              sizes={
                paysage
                  ? "(min-width: 1024px) 50vw, 100vw"
                  : "(min-width: 1024px) 25vw, 50vw"
              }
            />
          </div>
        );
      })}
    </div>
  );
}

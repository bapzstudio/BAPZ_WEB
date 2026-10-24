import Image from "next/image";

/**
 * La planète du logo, en élément décoratif : menu mobile, page
 * 404, galerie vide, confirmation de demande. Le hero, lui, utilise le logo
 * vectoriel qui se dessine (`PlaneteDessinee`). Invisible pour les lecteurs
 * d'écran.
 *
 * Tailles et placement viennent de `className` : il n'y a pas de maquette pour
 * ces emplacements, la planète reste donc discrète (faible opacité : 0,06 à
 * 0,07 en filigrane, moitié moins qu'avec l'ancienne planète en fil de fer,
 * le globe au pinceau portant 4,5 fois plus d'encre) et ne
 * modifie jamais la mise en page — toujours positionnée en absolu, sauf sur la
 * confirmation où elle remplace le ✓.
 */
export function Planete({
  className = "",
  sizes,
}: {
  className?: string;
  sizes: string;
}) {
  return (
    <Image
      src="/images/marque/planete.png"
      alt=""
      aria-hidden
      width={1400}
      height={1400}
      sizes={sizes}
      className={`pointer-events-none select-none ${className}`}
    />
  );
}

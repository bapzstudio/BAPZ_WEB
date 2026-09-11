import Image from "next/image";

/**
 * La planète en fil de fer du logo, en élément décoratif : menu mobile, page
 * 404, galerie vide, confirmation de demande. Le hero, lui, utilise le logo
 * vectoriel qui se dessine (`PlaneteDessinee`). Invisible pour les lecteurs
 * d'écran.
 *
 * Tailles et placement viennent de `className` : il n'y a pas de maquette pour
 * ces emplacements, la planète reste donc discrète (faible opacité) et ne
 * modifie jamais la mise en page — toujours positionnée en absolu, sauf sur la
 * confirmation où elle remplace le ✓.
 */
export function Planete({ className = "", sizes }: { className?: string; sizes: string }) {
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

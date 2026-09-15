import Link from "next/link";
import { Reveal } from "../_components/Reveal";

/**
 * En-tête des sections de l'accueil : un titre h2 et, à droite, le lien vers la
 * page complète. Même dessin que « Prochains cours », pour qu'aucune section
 * n'introduise un style de titre de plus.
 *
 * Le libellé du lien dit où il mène (« Les profs », « Tous les tarifs ») plutôt
 * qu'un « Tout voir » répété : c'est aussi le texte que Google associe à la page
 * visée.
 */
export function EnteteSection({
  id,
  titre,
  lien,
  libelleLien,
}: {
  /** Identifiant du h2, repris par l'`aria-labelledby` de la section. */
  id: string;
  titre: string;
  lien?: string;
  libelleLien?: string;
}) {
  return (
    <Reveal className="mb-7 flex items-end justify-between gap-4">
      <h2
        id={id}
        className="text-[clamp(18px,5.2vw,28px)] font-black uppercase leading-none tracking-tight sm:text-[clamp(28px,2.05vw,39px)]"
      >
        {titre}
      </h2>
      {lien && libelleLien && (
        <Link
          href={lien}
          className="-my-2 shrink-0 py-2 font-mono text-xs uppercase text-tertiary transition-colors hover:text-foreground"
        >
          {libelleLien} →
        </Link>
      )}
    </Reveal>
  );
}

/** Écart entre deux sections de l'accueil, repris du rythme vertical du site. */
export const ESPACE_SECTION = "pt-[var(--vr-104)]";

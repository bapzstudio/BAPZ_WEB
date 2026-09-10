import type { ReactNode } from "react";
import { ProximityGlow } from "../_components/ProximityGlow";

/** Champs de saisie, repris du formulaire de contact. */
export const CHAMP =
  "w-full rounded-xl border border-card-border bg-white/[0.06] p-3.5 text-[15px] text-foreground placeholder:text-tertiary";

/** Petit libellé en Space Mono, comme partout sur le site. */
export const LIBELLE = "font-mono text-[11px] uppercase tracking-widest text-secondary";

/**
 * Titre d'étape. `tabIndex={-1}` : le parcours y place le focus à chaque
 * changement d'étape, sans quoi le focus clavier retombait en haut du document
 * — le bouton qui venait d'être activé disparaît avec son étape.
 */
export function Titre({ children }: { children: ReactNode }) {
  return (
    <h1
      tabIndex={-1}
      className="text-center text-[clamp(28px,2.6vw,44px)] font-black uppercase leading-none tracking-tight outline-none"
    >
      {children}
    </h1>
  );
}

export function Champ({
  label,
  erreur,
  children,
}: {
  label: string;
  erreur?: string;
  children: ReactNode;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className={LIBELLE}>{label}</span>
      {children}
      {erreur && (
        <span role="alert" className="text-[13px] text-white/70">
          {erreur}
        </span>
      )}
    </label>
  );
}

/** Liste de choix : un seul écouteur de halo pour toutes les lignes. */
export function ListeChoix({ children }: { children: ReactNode }) {
  return <ProximityGlow className="flex flex-col gap-3">{children}</ProximityGlow>;
}

/**
 * Ligne de choix d'une étape : avance au clic, comme les lignes du tunnel de
 * chuttt. Même carte que le reste du site, et le choix déjà fait porte le halo
 * bleu des formules mises en avant.
 */
export function LigneChoix({
  titre,
  detail,
  precision,
  aside,
  actif,
  onClick,
}: {
  titre: string;
  detail?: string;
  precision?: string;
  aside?: string;
  actif?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={actif}
      data-glow-card
      className={`group cal-card cal-glow relative flex w-full items-center justify-between gap-5 p-5 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/60 ${
        actif ? "cal-card-avant" : ""
      }`}
    >
      <span className="min-w-0">
        <span className="block text-lg font-black uppercase leading-tight">{titre}</span>
        {detail && <span className={`mt-1.5 block ${LIBELLE}`}>{detail}</span>}
        {precision && (
          <span className="mt-1 block text-[13px] text-tertiary">{precision}</span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-4">
        {aside && <span className="whitespace-nowrap text-lg font-black">{aside}</span>}
        <span
          aria-hidden
          className="text-tertiary transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-foreground"
        >
          →
        </span>
      </span>
    </button>
  );
}

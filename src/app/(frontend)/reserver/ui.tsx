import type { ReactNode } from "react";
import { ProximityGlow } from "../_components/ProximityGlow";

/** Petit libellé en Space Mono, comme partout sur le site. */
export const LIBELLE =
  "font-mono text-label uppercase tracking-widest text-secondary";

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

/*
 * Un champ et son message. Le message n'est pas un `role="alert"` : il vit
 * dans le `<label>`, donc les lecteurs d'écran le lisent déjà avec le nom du
 * champ. L'annonce, elle, revient au récapitulatif ci-dessous, une seule fois
 * pour tous les champs.
 */
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
      {erreur && <span className="text-petit text-erreur">{erreur}</span>}
    </label>
  );
}

export type ErreurChamp = {
  /** `id` de l'input, pour y amener le focus depuis le récapitulatif. */
  id: string;
  label: string;
  message: string;
  /** Champ laissé vide, par opposition à une saisie à corriger. */
  vide: boolean;
};

/**
 * Récapitulatif des champs à reprendre, en tête d'étape (demandé le
 * 2026-09-16 : « savoir ce qu'il manque comme informations »). Le bouton
 * « Suivant » est hors de l'étape, en bas de la colonne : sans ce bloc, une
 * validation refusée ne se voyait qu'en parcourant les champs un à un, et les
 * messages étaient du même gris que le reste de la page.
 */
export function ResumeErreurs({ erreurs }: { erreurs: ErreurChamp[] }) {
  if (erreurs.length === 0) return null;

  const manquants = erreurs.filter((e) => e.vide).length;
  const titre =
    manquants === erreurs.length
      ? erreurs.length > 1
        ? `Il manque ${erreurs.length} informations`
        : "Il manque une information"
      : erreurs.length > 1
        ? `${erreurs.length} informations sont à corriger`
        : "Une information est à corriger";

  return (
    <div role="alert" className="bloc-erreur flex flex-col gap-2">
      <p className="font-mono text-label uppercase tracking-widest">{titre}</p>
      <ul className="flex flex-col gap-1">
        {erreurs.map((erreur) => (
          <li key={erreur.id}>
            {/* Amène au champ concerné : sur téléphone, il peut être hors écran. */}
            <button
              type="button"
              onClick={() => document.getElementById(erreur.id)?.focus()}
              className="text-left text-petit underline decoration-1 underline-offset-4 opacity-90 transition-opacity hover:opacity-100"
            >
              <span className="font-semibold">{erreur.label}</span> —{" "}
              {erreur.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Liste de choix : un seul écouteur de halo pour toutes les lignes. */
export function ListeChoix({ children }: { children: ReactNode }) {
  return (
    <ProximityGlow className="flex flex-col gap-3">{children}</ProximityGlow>
  );
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
      className={`group cal-card cal-glow relative flex w-full items-center justify-between gap-5 p-5 text-left ${
        actif ? "cal-card-avant" : ""
      }`}
    >
      <span className="min-w-0">
        <span className="block text-lg font-black uppercase leading-tight">
          {titre}
        </span>
        {detail && <span className={`mt-1.5 block ${LIBELLE}`}>{detail}</span>}
        {precision && (
          <span className="mt-1 block text-petit text-tertiary">
            {precision}
          </span>
        )}
      </span>
      <span className="flex shrink-0 items-center gap-4">
        {aside && (
          <span className="whitespace-nowrap text-lg font-black">{aside}</span>
        )}
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

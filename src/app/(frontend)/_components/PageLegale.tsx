import type { ReactNode } from "react";
import { FoldText } from "./FoldText";

/**
 * Gabarit des pages légales. Pas de maquette : titre, écarts et petits libellés
 * repris des autres pages, texte limité à une colonne lisible.
 */
export function PageLegale({
  titre,
  miseAJour,
  children,
}: {
  titre: string;
  miseAJour: string;
  children: ReactNode;
}) {
  return (
    <div className="container-page pt-[var(--vr-104)] pb-8.5">
      <h1 className="titre-page">
        <FoldText text={titre} />
      </h1>
      <p className="eyebrow mt-6">MISE À JOUR : {miseAJour.toUpperCase()}</p>
      <div className="mt-[var(--vr-64)] flex max-w-190 flex-col gap-10">{children}</div>
    </div>
  );
}

export function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-bold uppercase">{titre}</h2>
      <div className="mt-3 flex flex-col gap-3 text-courant leading-relaxed text-secondary">
        {children}
      </div>
    </section>
  );
}

/** Liste « libellé : valeur », comme l'identité de l'éditeur. */
export function Infos({ lignes }: { lignes: { label: string; valeur: ReactNode }[] }) {
  return (
    <dl className="grid gap-x-6 gap-y-2 sm:grid-cols-[220px_minmax(0,1fr)]">
      {lignes.map((ligne) => (
        <div key={ligne.label} className="contents">
          <dt className="pt-1 font-mono text-label uppercase tracking-widest text-tertiary">
            {ligne.label}
          </dt>
          <dd className="mb-2 whitespace-pre-line text-foreground sm:mb-0">{ligne.valeur}</dd>
        </div>
      ))}
    </dl>
  );
}

/**
 * Valeur saisie dans les Réglages, ou « À compléter » tant qu'elle manque :
 * une mention obligatoire absente doit se voir avant la mise en ligne, pas
 * disparaître en silence.
 */
export function ACompleter({ valeur }: { valeur?: string }) {
  return valeur ? <>{valeur}</> : <span className="text-tertiary">À compléter</span>;
}

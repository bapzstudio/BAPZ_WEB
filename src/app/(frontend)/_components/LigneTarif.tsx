"use client";

import Link from "next/link";
import { useRef } from "react";
import { lienReservation } from "@/lib/reservation/liens";
import type { PricingPlan } from "@/lib/types";
import { BandeFluide, useBandeFluide } from "./BandeFluide";
import { PriceCounter } from "./PriceCounter";

/**
 * Prix ramené au cours, à partir du prix affiché et du nombre de cours inclus.
 *
 * C'est ce qui rend une carte et un abonnement comparables : 160 € et 310 €
 * ne se comparent pas, 16 € et 8,60 € le cours si. Le prix est saisi avec sa
 * devise (« 160 € »), d'où l'extraction.
 */
function prixParCours(plan: PricingPlan) {
  if (!plan.sessionsIncluded || plan.sessionsIncluded < 1) return null;
  const montant = Number(plan.price.replace(/[^\d,.]/g, "").replace(",", "."));
  if (!Number.isFinite(montant) || montant <= 0) return null;

  const unitaire = montant / plan.sessionsIncluded;
  // Pas de décimales quand elles ne servent à rien : « 16 € » plutôt que
  // « 16,00 € ».
  const formate = unitaire.toLocaleString("fr-FR", {
    minimumFractionDigits: Number.isInteger(unitaire) ? 0 : 2,
    maximumFractionDigits: 2,
  });
  return `Soit ${formate} € le cours`;
}

/**
 * Une formule de la page Tarifs, en ligne plutôt qu'en carte.
 *
 * Neuf cartes identiques (libellé, prix, nom, « Choisir ») rendaient la page
 * lourde : tout pesait pareil, rien ne guidait l'œil, et les abonnements, qui
 * ne diffèrent que par un chiffre, laissaient chacun 300 px de vide. En
 * lignes, les formules se lisent comme une échelle et le prix reste la seule
 * chose en grand. Écart avec la maquette TARIFS, choisi le 2026-09-15.
 *
 * Toute la ligne est un lien vers le parcours de réservation, formule déjà
 * choisie. Au survol, la bande de la FAQ (`BandeFluide`) glisse dessus et le
 * nom y défile ; le prix et la flèche restent au-dessus, en sombre, et le
 * texte défilant s'arrête avant eux.
 *
 * À partir de `lg`, quatre colonnes : nom, description, prix, flèche. En
 * dessous, le nom et le prix se partagent la ligne, la description passe
 * dessous ; la flèche n'apparaît qu'à partir de `sm`.
 */
export function LigneTarif({ plan }: { plan: PricingPlan }) {
  const ligneRef = useRef<HTMLAnchorElement>(null);
  const prixRef = useRef<HTMLDivElement>(null);
  const { bandeRef, pisteRef, entrer, sortir } = useBandeFluide(
    ligneRef,
    prixRef,
  );
  const unitaire = prixParCours(plan);

  return (
    <li className="border-b border-rule-faint">
      <Link
        ref={ligneRef}
        href={lienReservation(
          plan.group === "essai"
            ? { type: "essai" }
            : { type: "inscription", formule: plan.slug },
        )}
        onPointerEnter={entrer}
        onPointerLeave={sortir}
        className="group relative grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2 overflow-hidden py-5 pr-4 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:py-7 sm:pr-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)_auto_auto] lg:gap-x-10"
      >
        <div className="col-start-1 row-start-1 min-w-0">
          {plan.label && (
            // Le libellé d'une formule mise en avant passe en blanc : en gris,
            // il se confondait avec les autres et ne mettait rien en avant.
            <div
              className={`mb-2 font-mono text-label uppercase tracking-widest ${
                plan.highlighted ? "text-foreground" : "text-discret"
              }`}
            >
              {plan.label}
            </div>
          )}
          <h3 className="text-lg font-black uppercase leading-tight sm:text-2xl lg:text-[clamp(22px,1.75vw,32px)]">
            {plan.name}
          </h3>
        </div>

        {plan.description && (
          <p className="col-span-full row-start-2 text-courant leading-snug text-secondary lg:col-span-1 lg:col-start-2 lg:row-start-1">
            {plan.description}
          </p>
        )}

        {/* Au-dessus de la bande (`z-20`) : le prix reste lu pendant le survol. */}
        <div
          ref={prixRef}
          className="relative z-20 col-start-2 row-start-1 text-right transition-colors duration-300 group-data-[survol]:text-background lg:col-start-3"
        >
          <div className="flex items-baseline justify-end gap-1.5">
            <span className="text-[clamp(30px,2.6vw,48px)] font-black leading-none tracking-tight">
              <PriceCounter value={plan.price} />
            </span>
            {plan.period && (
              <span className="text-base font-bold leading-none text-tertiary transition-colors duration-300 group-data-[survol]:text-background sm:text-lg">
                {plan.period}
              </span>
            )}
          </div>
          {unitaire && (
            <div className="mt-2 font-mono text-label uppercase tracking-widest text-glow transition-colors duration-300 group-data-[survol]:text-background">
              {unitaire}
            </div>
          )}
        </div>

        <span
          aria-hidden
          className="relative z-20 hidden text-2xl leading-none text-tertiary transition-[color,translate] duration-300 group-hover:translate-x-1 group-data-[survol]:text-background sm:col-start-3 sm:row-start-1 sm:block lg:col-start-4"
        >
          →
        </span>

        <BandeFluide
          texte={plan.name}
          bandeRef={bandeRef}
          pisteRef={pisteRef}
          tailleTexte="text-lg sm:text-2xl"
        />
      </Link>
    </li>
  );
}

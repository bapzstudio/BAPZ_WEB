import Link from "next/link";
import { lienReservation } from "@/lib/reservation/liens";
import type { PricingPlan } from "@/lib/types";
import { PriceCounter } from "./PriceCounter";

/**
 * Cours d'essai en bandeau, avant les formules.
 *
 * Noyé dans la rangée « à la carte », il se lisait comme une option parmi
 * trois ; c'est pourtant la porte d'entrée. En pleine largeur il devient une
 * invitation. Même carte que le reste de la page (`.cal-card`), et le seul
 * bouton plein de la page — le même que « Cours d'essai » dans le hero.
 */
export function TrialBanner({ plan }: { plan: PricingPlan }) {
  return (
    <Link
      href={lienReservation({ type: "essai" })}
      className="group block rounded-[15px]"
    >
      <div
        data-glow-card
        className="cal-card cal-glow relative flex flex-col gap-7 p-7.5 md:flex-row md:items-center md:justify-between"
      >
        <div>
          {plan.label && (
            <div className="font-mono text-label uppercase tracking-widest text-foreground">
              {plan.label}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <span className="text-[clamp(40px,3.4vw,64px)] font-black leading-none tracking-tight">
              <PriceCounter value={plan.price} />
            </span>
            <span className="text-lg font-bold uppercase">{plan.name}</span>
          </div>

          {plan.description && (
            <p className="mt-3 text-courant leading-snug text-secondary">
              {plan.description}
            </p>
          )}
        </div>

        {/* Pastille décorative : c'est le lien parent qui porte l'interaction. */}
        <span className="pill pill-light shrink-0 gap-2 self-start transition-colors group-hover:bg-white md:self-auto">
          Réserver mon essai
          <span
            aria-hidden
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        </span>
      </div>
    </Link>
  );
}

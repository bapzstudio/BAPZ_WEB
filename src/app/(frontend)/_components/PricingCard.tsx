import Link from "next/link";
import type { CSSProperties } from "react";
import type { PricingPlan } from "@/lib/types";

export function PricingCard({ plan }: { plan: PricingPlan }) {
  return (
    <div
      className="cal-card flex h-full flex-col p-7.5"
      // Réutilise le réglage d'opacité du contour : la formule mise en avant
      // se distingue par une bordure plus franche, sans couleur supplémentaire.
      style={
        plan.highlighted
          ? ({ "--cal-card-border-alpha": 0.9 } as CSSProperties)
          : undefined
      }
    >
      {plan.label && (
        <div className="font-mono text-[11px] uppercase tracking-widest text-rule">
          {plan.label}
        </div>
      )}

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="text-[clamp(40px,3.4vw,64px)] font-black leading-none tracking-tight">
          {plan.price}
        </span>
        {plan.period && (
          <span className="text-xl font-bold leading-none text-tertiary">
            {plan.period}
          </span>
        )}
      </div>

      <div className="mt-5 text-lg font-bold uppercase">{plan.name}</div>

      {plan.description && (
        <p className="mt-3 text-[15px] leading-snug text-secondary">
          {plan.description}
        </p>
      )}

      {/* mt-auto pousse le bouton en bas pour que tous s'alignent d'une carte à
          l'autre ; pt-8 garantit un écart minimal quand la carte est pleine. */}
      <div className="mt-auto pt-8">
        <Link
          href="/contact"
          className="block rounded-full border border-rule py-2.5 text-center text-[13px] font-bold uppercase tracking-widest transition-colors hover:bg-white/10"
        >
          Choisir
        </Link>
      </div>
    </div>
  );
}

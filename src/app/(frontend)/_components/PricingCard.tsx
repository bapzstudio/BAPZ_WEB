import Link from "next/link";
import type { CSSProperties } from "react";
import type { PricingPlan } from "@/lib/types";
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
  const montant = Number(
    plan.price.replace(/[^\d,.]/g, "").replace(",", ".")
  );
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

export function PricingCard({ plan }: { plan: PricingPlan }) {
  const unitaire = prixParCours(plan);

  return (
    <div
      data-glow-card
      className={`cal-card cal-glow relative flex h-full flex-col p-7.5 ${
        plan.highlighted ? "cal-card-avant" : ""
      }`}
      // Réutilise le réglage d'opacité du contour : la formule mise en avant
      // se distingue par une bordure plus franche, sans couleur supplémentaire.
      style={
        plan.highlighted
          ? ({ "--cal-card-border-alpha": 0.9 } as CSSProperties)
          : undefined
      }
    >
      {plan.label && (
        // Le libellé d'une formule mise en avant passe en blanc : en gris, il
        // se confondait avec ceux des autres cartes et ne mettait rien en avant.
        <div
          className={`font-mono text-[11px] uppercase tracking-widest ${
            plan.highlighted ? "text-foreground" : "text-rule"
          }`}
        >
          {plan.label}
        </div>
      )}

      <div className="mt-6 flex items-baseline gap-1.5">
        <span className="text-[clamp(40px,3.4vw,64px)] font-black leading-none tracking-tight">
          <PriceCounter value={plan.price} />
        </span>
        {plan.period && (
          <span className="text-xl font-bold leading-none text-tertiary">
            {plan.period}
          </span>
        )}
      </div>

      {unitaire && (
        <div className="mt-2 font-mono text-[11px] uppercase tracking-widest text-glow">
          {unitaire}
        </div>
      )}

      <div className="mt-5 text-lg font-bold uppercase">{plan.name}</div>

      {plan.description && (
        <p className="mt-3 text-[15px] leading-snug text-secondary">
          {plan.description}
        </p>
      )}

      {/* mt-auto pousse le bouton en bas pour que tous s'alignent d'une carte à
          l'autre ; pt-8 garantit un écart minimal quand la carte est pleine. */}
      <div className="mt-auto pt-8">
        {/* Lien étiré : le pseudo-élément couvre toute la carte, qui devient
            donc cliquable en entier — sans imbriquer un second lien, ce qui
            serait invalide et ajouterait un arrêt de tabulation en double. */}
        <Link
          href="/contact"
          className="block rounded-full border border-rule py-2.5 text-center text-[13px] font-bold uppercase tracking-widest transition-colors hover:bg-white/10 after:absolute after:inset-0 after:content-['']"
        >
          Choisir
        </Link>
      </div>
    </div>
  );
}

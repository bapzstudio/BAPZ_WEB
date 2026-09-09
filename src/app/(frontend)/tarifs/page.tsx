import type { Metadata } from "next";
import { PageTransition } from "../_components/PageTransition";
import { ProximityGlow } from "../_components/ProximityGlow";
import { PricingCard } from "../_components/PricingCard";
import { getPricingPlans } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Tarifs",
  description:
    "Tarifs des cours de danse à BAPZ Studio, Metz : cours à l'unité 17 €, carte de 10 cours 160 €, abonnements à l'année à partir de 310 €.",
  path: "/tarifs",
});

export default async function TarifsPage() {
  const plans = await getPricingPlans();

  // Le cours d'essai rejoint « à la carte » : c'est un achat ponctuel comme les
  // autres, et cela remplit la rangée de trois cartes de la maquette au lieu de
  // laisser deux cartes s'étirer sur toute la largeur.
  const essai = plans.filter((p) => p.group === "essai");
  const aLaCarte = [...essai, ...plans.filter((p) => p.group === "carte")];
  const abonnements = plans.filter((p) => p.group === "abonnement");

  return (
    <PageTransition>
      {/* Un seul écouteur pour les deux sections : le halo réagit donc aussi
          d'une rangée à l'autre. */}
      <ProximityGlow className="container-page pt-[var(--vr-104)] pb-8.5">
        <h1 className="text-[clamp(38px,3.1vw,59px)] font-black uppercase leading-none tracking-tight">
          Tarifs
        </h1>
        <p className="eyebrow mt-6">
          SANS ENGAGEMENT OU À L&apos;ANNÉE - À TOI DE VOIR
        </p>

        <section className="mt-[var(--vr-80)]">
          <h2 className="eyebrow">À LA CARTE</h2>
          <div className="mt-7 grid gap-11.5 sm:grid-cols-2 xl:grid-cols-3">
            {aLaCarte.map((plan) => (
              <PricingCard key={plan._id} plan={plan} />
            ))}
          </div>
        </section>

        {/* La maquette prévoyait une seule carte d'abonnement mensuel ; l'offre
            réelle en compte quatre, à l'année, d'où une rangée dédiée. */}
        <section className="mt-[var(--vr-80)]">
          <h2 className="eyebrow">ABONNEMENTS À L&apos;ANNÉE</h2>
          <div className="mt-7 grid gap-11.5 sm:grid-cols-2 xl:grid-cols-4">
            {abonnements.map((plan) => (
              <PricingCard key={plan._id} plan={plan} />
            ))}
          </div>
        </section>
      </ProximityGlow>
    </PageTransition>
  );
}

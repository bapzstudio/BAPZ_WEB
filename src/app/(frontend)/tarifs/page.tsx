import type { Metadata } from "next";
import { PageTransition } from "../_components/PageTransition";
import { ProximityGlow } from "../_components/ProximityGlow";
import { PricingCard } from "../_components/PricingCard";
import { Reveal } from "../_components/Reveal";
import { TrialBanner } from "../_components/TrialBanner";
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

  // Le cours d'essai sort de « à la carte » pour passer en bandeau : c'est la
  // porte d'entrée, pas une option parmi d'autres.
  const essais = plans.filter((p) => p.group === "essai");
  const aLaCarte = plans.filter((p) => p.group === "carte");
  const abonnements = plans.filter((p) => p.group === "abonnement");

  return (
    <PageTransition>
      {/* Un seul écouteur pour toute la page : le halo réagit donc aussi d'une
          rangée à l'autre. */}
      <ProximityGlow className="container-page pt-[var(--vr-104)] pb-8.5">
        <h1 className="text-[clamp(38px,3.1vw,59px)] font-black uppercase leading-none tracking-tight">
          Tarifs
        </h1>
        <p className="eyebrow mt-6">
          SANS ENGAGEMENT OU À L&apos;ANNÉE - À TOI DE VOIR
        </p>

        {essais.length > 0 && (
          <Reveal className="mt-[var(--vr-80)] flex flex-col gap-6">
            {essais.map((plan) => (
              <TrialBanner key={plan._id} plan={plan} />
            ))}
          </Reveal>
        )}

        <section className="mt-[var(--vr-80)]">
          <h2 className="eyebrow">À LA CARTE</h2>
          {/* Deux formules depuis que l'essai est en bandeau : deux colonnes,
              plutôt qu'une grille de trois dont la dernière resterait vide. */}
          <Reveal className="mt-7 grid gap-11.5 sm:grid-cols-2">
            {aLaCarte.map((plan) => (
              <PricingCard key={plan._id} plan={plan} />
            ))}
          </Reveal>
        </section>

        {/* La maquette prévoyait une seule carte d'abonnement mensuel ; l'offre
            réelle en compte quatre, à l'année, d'où une rangée dédiée. */}
        <section className="mt-[var(--vr-80)]">
          <h2 className="eyebrow">ABONNEMENTS À L&apos;ANNÉE</h2>
          <Reveal className="mt-7 grid gap-11.5 sm:grid-cols-2 xl:grid-cols-4">
            {abonnements.map((plan) => (
              <PricingCard key={plan._id} plan={plan} />
            ))}
          </Reveal>
        </section>
      </ProximityGlow>
    </PageTransition>
  );
}

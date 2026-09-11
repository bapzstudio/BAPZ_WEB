import type { Metadata } from "next";
import { PageTransition } from "../_components/PageTransition";
import { ProximityGlow } from "../_components/ProximityGlow";
import { PricingCard } from "../_components/PricingCard";
import { Reveal } from "../_components/Reveal";
import { RoomCard } from "../_components/RoomCard";
import { TrialBanner } from "../_components/TrialBanner";
import { getPricingPlans, getRooms } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Tarifs",
  description:
    "Tarifs des cours de danse à BAPZ Studio, Metz : cours à l'unité 17 €, carte de 10 cours 160 €, abonnements à l'année à partir de 310 €. Location de salle.",
  path: "/tarifs",
});

export default async function TarifsPage() {
  const [plans, rooms] = await Promise.all([getPricingPlans(), getRooms()]);

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
        <h1 className="titre-page">
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

        {/* Section ajoutée par la maquette TARIFS du 2026-09-10, titrée comme
            la page. Écarts relevés : 153 des cartes au titre, 64 du titre aux
            salles — le même que « titre -> grille de cartes » ailleurs. */}
        {rooms.length > 0 && (
          <section id="locations" className="mt-[var(--vr-152)] scroll-mt-24">
            <h2 className="titre-page">
              Locations de salle
            </h2>
            <Reveal className="mt-[var(--vr-64)] grid gap-11.5 lg:grid-cols-2">
              {rooms.map((room) => (
                <RoomCard key={room._id} room={room} />
              ))}
            </Reveal>
          </section>
        )}
      </ProximityGlow>
    </PageTransition>
  );
}

import type { Metadata } from "next";
import { FoldText } from "../_components/FoldText";
import { LigneTarif } from "../_components/LigneTarif";
import { PageTransition } from "../_components/PageTransition";
import { ProximityGlow } from "../_components/ProximityGlow";
import { Reveal } from "../_components/Reveal";
import { RoomCard } from "../_components/RoomCard";
import { TrialBanner } from "../_components/TrialBanner";
import { getPricingPlans, getRooms } from "@/lib/queries";
import { montantTarif, pageMetadata } from "@/lib/seo";
import type { PricingPlan } from "@/lib/types";

/**
 * Description construite depuis les tarifs saisis, jamais écrite en dur : les
 * prix y figuraient en toutes lettres, et le jour où la cliente en change un
 * dans l'admin, l'extrait affiché par Google se serait mis à mentir.
 *
 * Seules les formules à la carte sont nommées ; les quatre abonnements ne
 * diffèrent que par un nombre de cours, donc seul le moins cher est annoncé.
 */
function descriptionTarifs(plans: PricingPlan[]): string {
  const duGroupe = (groupe: PricingPlan["group"]) =>
    plans.filter((p) => p.group === groupe);

  const morceaux: string[] = [];

  const essai = duGroupe("essai")[0];
  if (essai) morceaux.push(`cours d'essai ${essai.price}`);

  for (const plan of duGroupe("carte")) {
    morceaux.push(`${plan.name.toLowerCase()} ${plan.price}`);
  }

  const abonnements = duGroupe("abonnement")
    .map((p) => montantTarif(p.price))
    .filter((m): m is number => m !== undefined);
  if (abonnements.length) {
    morceaux.push(
      `abonnement à l'année à partir de ${Math.min(...abonnements)} €`,
    );
  }

  return morceaux.length
    ? `Tarifs du studio de danse BAPZ à Metz : ${morceaux.join(", ")}.`
    : "Tarifs des cours de danse et location de salle à BAPZ Studio, près de Metz.";
}

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({
    title: "Tarifs des cours de danse à Metz",
    description: descriptionTarifs(await getPricingPlans()),
    path: "/tarifs",
  });
}

export default async function TarifsPage() {
  const [plans, rooms] = await Promise.all([getPricingPlans(), getRooms()]);

  // Le cours d'essai sort de « à la carte » pour passer en bandeau : c'est la
  // porte d'entrée, pas une option parmi d'autres.
  const essais = plans.filter((p) => p.group === "essai");
  const aLaCarte = plans.filter((p) => p.group === "carte");
  const abonnements = plans.filter((p) => p.group === "abonnement");

  return (
    <PageTransition>
      {/* Un seul écouteur pour toute la page : le halo des cartes (bandeau
          d'essai, salles) réagit donc d'une section à l'autre. */}
      <ProximityGlow className="container-page pt-[var(--vr-104)] pb-8.5">
        <h1 className="titre-page">
          <FoldText text="Tarifs" />
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

        {/* Les formules en lignes (cf. LigneTarif), écart avec la maquette qui
            les montrait en cartes : neuf cartes identiques alourdissaient la
            page. Le bandeau d'essai et les salles, qui ont chacun davantage à
            montrer, restent en cartes. */}
        <section className="mt-[var(--vr-80)]">
          <h2 className="eyebrow">À LA CARTE</h2>
          <Reveal as="ul" className="mt-7 border-t border-rule-faint">
            {aLaCarte.map((plan) => (
              <LigneTarif key={plan._id} plan={plan} />
            ))}
          </Reveal>
        </section>

        <section className="mt-[var(--vr-80)]">
          <h2 className="eyebrow">ABONNEMENTS À L&apos;ANNÉE</h2>
          <Reveal as="ul" className="mt-7 border-t border-rule-faint">
            {abonnements.map((plan) => (
              <LigneTarif key={plan._id} plan={plan} />
            ))}
          </Reveal>
        </section>

        {/* Section ajoutée par la maquette TARIFS du 2026-09-10, titrée comme
            la page. Écarts relevés : 153 des formules au titre, 64 du titre aux
            salles — le même que « titre -> grille de cartes » ailleurs. */}
        {rooms.length > 0 && (
          <section id="locations" className="mt-[var(--vr-152)] scroll-mt-24">
            <h2 className="titre-page">Locations de salle</h2>
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

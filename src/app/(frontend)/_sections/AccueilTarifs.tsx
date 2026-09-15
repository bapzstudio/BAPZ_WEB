import Link from "next/link";
import { lienReservation } from "@/lib/reservation/liens";
import type { PricingPlan, Room } from "@/lib/types";
import { ProximityGlow } from "../_components/ProximityGlow";
import { Reveal } from "../_components/Reveal";
import { ESPACE_SECTION, EnteteSection } from "./EnteteSection";

/** « 310 € » -> 310. Même lecture que la fourchette de prix du layout. */
const montant = (prix?: string) =>
  Number((prix ?? "").replace(/[^0-9,.]/g, "").replace(",", "."));

function moinsCher<T extends { price?: string }>(liste: T[]): T | undefined {
  return liste
    .filter((x) => Number.isFinite(montant(x.price)) && montant(x.price) > 0)
    .sort((a, b) => montant(a.price) - montant(b.price))[0];
}

type Tuile = {
  titre: string;
  prefixe?: string;
  prix: string;
  periode?: string;
  texte?: string;
  lien: string;
};

/**
 * Extrait de /tarifs : les trois portes d'entrée — le cours d'essai, le premier
 * prix des abonnements, le premier prix de location — et non la grille
 * complète, qui reste sur la page Tarifs. Montants lus dans l'admin.
 *
 * Seules les salles ouvertes comptent pour le « dès » : une salle annoncée pour
 * plus tard afficherait un prix auquel on ne peut pas encore louer.
 */
export function AccueilTarifs({
  plans,
  rooms,
}: {
  plans: PricingPlan[];
  rooms: Room[];
}) {
  const essai = plans.find((plan) => plan.group === "essai");
  const abonnements = plans.filter((plan) => plan.group === "abonnement");
  const abonnement = moinsCher(abonnements);
  const salle = moinsCher(rooms.filter((room) => !room.availableFrom));

  const tuiles = [
    essai && {
      titre: essai.name,
      prix: essai.price,
      periode: essai.period,
      texte: essai.description,
      lien: lienReservation({ type: "essai" }),
    },
    abonnement && {
      titre: "Abonnements à l'année",
      prefixe: "dès",
      prix: abonnement.price,
      periode: abonnement.period,
      texte: `${abonnements.length} formules, jusqu'à l'accès illimité.`,
      lien: "/tarifs",
    },
    salle?.price && {
      titre: "Location de salle",
      prefixe: "dès",
      prix: salle.price,
      periode: salle.period,
      texte:
        [
          salle.area ? `${salle.area} m²` : "",
          salle.capacity ? `jusqu'à ${salle.capacity} personnes` : "",
        ]
          .filter(Boolean)
          .join(" · ") || undefined,
      lien: "/tarifs#locations",
    },
  ].filter(Boolean) as Tuile[];

  if (tuiles.length === 0) return null;

  return (
    <section
      aria-labelledby="accueil-tarifs"
      className={`container-page ${ESPACE_SECTION}`}
    >
      <EnteteSection
        id="accueil-tarifs"
        titre="Tarifs et location"
        lien="/tarifs"
        libelleLien="Tous les tarifs"
      />
      <ProximityGlow>
        <Reveal className="grid gap-4 sm:grid-cols-3 sm:gap-6">
          {tuiles.map((tuile) => (
            <Link
              key={tuile.titre}
              href={tuile.lien}
              className="block h-full rounded-[12px]"
            >
              <article
                data-glow-card
                className="card card-interactive cal-glow relative flex h-full flex-col p-6"
              >
                <h3 className="font-mono text-label uppercase tracking-widest text-discret">
                  {tuile.titre}
                </h3>
                <p className="mt-5 flex flex-wrap items-baseline gap-x-1.5">
                  {tuile.prefixe && (
                    <span className="text-base font-bold text-tertiary">
                      {tuile.prefixe}
                    </span>
                  )}
                  <span className="text-[clamp(32px,2.6vw,48px)] font-black leading-none tracking-tight">
                    {tuile.prix}
                  </span>
                  {tuile.periode && (
                    <span className="text-base font-bold text-tertiary">
                      {tuile.periode}
                    </span>
                  )}
                </p>
                {tuile.texte && (
                  <p className="mt-3 text-petit leading-snug text-secondary">
                    {tuile.texte}
                  </p>
                )}
              </article>
            </Link>
          ))}
        </Reveal>
      </ProximityGlow>
    </section>
  );
}

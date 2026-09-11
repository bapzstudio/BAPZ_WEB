import Link from "next/link";
import type { TypeDemande } from "@/lib/reservation/schemas";
import type { DonneesReservation } from "@/lib/reservation/store";
import type { CatalogueReservation } from "@/lib/types";
import { LIBELLE, LigneChoix, ListeChoix, Titre } from "../ui";

type Choix = { cours?: string; formule?: string; salle?: string };

const GROUPES = [
  { cle: "carte", titre: "À la carte" },
  { cle: "abonnement", titre: "Abonnements à l'année" },
] as const;

export function StepChoix({
  type,
  catalogue,
  donnees,
  onChoix,
}: {
  type?: TypeDemande;
  catalogue: CatalogueReservation;
  donnees: DonneesReservation;
  onChoix: (choix: Choix) => void;
}) {
  if (type === "essai") {
    return (
      <div className="flex flex-col gap-8">
        <Titre>Quel cours veux-tu essayer ?</Titre>
        {catalogue.cours.length ? (
          <ListeChoix>
            {catalogue.cours.map((cours) => (
              <LigneChoix
                key={cours.slug}
                titre={cours.titre}
                detail={cours.detail}
                precision={cours.precision}
                actif={donnees.cours === cours.slug}
                onClick={() => onChoix({ cours: cours.slug })}
              />
            ))}
          </ListeChoix>
        ) : (
          <Vide />
        )}
      </div>
    );
  }

  if (type === "inscription") {
    return (
      <div className="flex flex-col gap-8">
        <Titre>Quelle formule ?</Titre>
        {catalogue.formules.length ? (
          GROUPES.map(({ cle, titre }) => {
            const formules = catalogue.formules.filter((f) => f.groupe === cle);
            if (!formules.length) return null;
            return (
              <section key={cle} className="flex flex-col gap-3">
                <h2 className={LIBELLE}>{titre}</h2>
                <ListeChoix>
                  {formules.map((formule) => (
                    <LigneChoix
                      key={formule.slug}
                      titre={formule.titre}
                      aside={formule.prix}
                      actif={donnees.formule === formule.slug}
                      onClick={() => onChoix({ formule: formule.slug })}
                    />
                  ))}
                </ListeChoix>
              </section>
            );
          })
        ) : (
          <Vide />
        )}
      </div>
    );
  }

  if (type === "location") {
    return (
      <div className="flex flex-col gap-8">
        <Titre>Quelle salle ?</Titre>
        {catalogue.salles.length ? (
          <ListeChoix>
            {catalogue.salles.map((salle) => (
              <LigneChoix
                key={salle.slug}
                titre={salle.titre}
                detail={salle.detail}
                actif={donnees.salle === salle.slug}
                onClick={() => onChoix({ salle: salle.slug })}
              />
            ))}
          </ListeChoix>
        ) : (
          <Vide />
        )}
      </div>
    );
  }

  return null;
}

function Vide() {
  return (
    <p className="text-center text-courant text-tertiary">
      Rien n&apos;est proposé ici pour le moment.{" "}
      <Link href="/contact" className="text-foreground underline underline-offset-4">
        Écris-nous
      </Link>{" "}
      directement.
    </p>
  );
}

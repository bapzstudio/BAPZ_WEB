import type { Metadata } from "next";
import Link from "next/link";
import {
  ACompleter,
  Infos,
  PageLegale,
  Section,
} from "../_components/PageLegale";
import { PageTransition } from "../_components/PageTransition";
import { getSiteSettings } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Mentions légales",
  description:
    "Mentions légales du site de BAPZ Studio, studio de danse à Ars-Laquenexy, près de Metz.",
  path: "/mentions-legales",
});

/** Mentions exigées par la loi pour la confiance dans l'économie numérique (art. 6). */
export default async function MentionsLegalesPage() {
  const s = await getSiteSettings();

  return (
    <PageTransition>
      <PageLegale titre="Mentions légales" miseAJour="10 septembre 2026">
        <Section titre="Éditeur du site">
          <Infos
            lignes={[
              { label: "Nom", valeur: <ACompleter valeur={s.legalName} /> },
              { label: "Statut", valeur: <ACompleter valeur={s.legalForm} /> },
              { label: "SIRET", valeur: <ACompleter valeur={s.siret} /> },
              { label: "Adresse", valeur: <ACompleter valeur={s.address} /> },
              { label: "Téléphone", valeur: <ACompleter valeur={s.phone} /> },
              { label: "E-mail", valeur: <ACompleter valeur={s.email} /> },
              {
                label: "Publication",
                valeur: <ACompleter valeur={s.publisher} />,
              },
            ]}
          />
        </Section>

        <Section titre="Hébergement">
          <Infos
            lignes={[
              { label: "Hébergeur", valeur: <ACompleter valeur={s.host} /> },
            ]}
          />
        </Section>

        <Section titre="Données personnelles">
          <p>
            Ce que deviennent les informations envoyées par les formulaires du
            site est détaillé sur la page{" "}
            <Link
              href="/confidentialite"
              className="text-foreground underline underline-offset-4"
            >
              Confidentialité
            </Link>
            .
          </p>
        </Section>

        <Section titre="Propriété intellectuelle">
          <p>
            Les textes, photos, vidéos et logos de ce site appartiennent à{" "}
            {s.legalName ?? "BAPZ Studio"} ou sont utilisés avec l&apos;accord
            de leurs auteurs. Toute reproduction sans autorisation écrite
            préalable est interdite.
          </p>
        </Section>
      </PageLegale>
    </PageTransition>
  );
}

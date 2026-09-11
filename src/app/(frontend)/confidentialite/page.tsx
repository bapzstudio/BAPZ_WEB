import type { Metadata } from "next";
import Link from "next/link";
import { ACompleter, PageLegale, Section } from "../_components/PageLegale";
import { PageTransition } from "../_components/PageTransition";
import { getSiteSettings } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Confidentialité",
  description:
    "Ce que BAPZ Studio fait des informations envoyées par les formulaires de son site, et comment exercer tes droits.",
  path: "/confidentialite",
});

/**
 * Politique de confidentialité.
 *
 * Elle décrit ce que le site fait réellement, vérifié dans le code : les
 * demandes de réservation sont enregistrées dans l'admin et envoyées par mail,
 * les messages du formulaire de contact partent seulement par mail, aucun
 * cookie ni outil de mesure n'est posé côté visiteur, et le parcours de
 * réservation garde sa saisie dans le `sessionStorage` de l'onglet.
 * Toute nouvelle collecte doit être ajoutée ici.
 */
export default async function ConfidentialitePage() {
  const s = await getSiteSettings();
  const lien = "text-foreground underline underline-offset-4";

  return (
    <PageTransition>
      <PageLegale titre="Confidentialité" miseAJour="10 septembre 2026">
        <Section titre="Qui est responsable">
          <p>
            <ACompleter valeur={s.legalName} />
            {s.address ? `, ${s.address}` : ""}, est responsable des informations que
            tu transmets sur ce site. Pour toute question : <ACompleter valeur={s.email} />.
          </p>
        </Section>

        <Section titre="Ce qui est collecté, et pourquoi">
          <p>
            <strong className="text-foreground">Une demande de réservation</strong>{" "}
            (cours d&apos;essai, inscription, location, cours privé) : ton prénom,
            ton e-mail, ton téléphone si tu le donnes, ce que tu as choisi, ton
            niveau, la date et le nombre de personnes pour une location, et ton
            message. Ces informations servent à traiter ta demande et à te
            recontacter. Elles sont nécessaires aux démarches que tu engages avant
            une inscription ou une location (article 6.1.b du RGPD).
          </p>
          <p>
            <strong className="text-foreground">Un message par le formulaire de contact</strong>{" "}
            : ton nom, ton e-mail et ton message, qui servent uniquement à te
            répondre (intérêt légitime du studio à répondre aux messages reçus,
            article 6.1.f). Ce message est transmis par e-mail et n&apos;est pas
            enregistré sur le site.
          </p>
          <p>
            <strong className="text-foreground">Au moment d&apos;envoyer un formulaire</strong>
            , une vérification anti-robot (Cloudflare Turnstile) examine des
            informations techniques : ton adresse IP et des caractéristiques de ton
            navigateur. Elles servent uniquement à bloquer les envois automatisés
            (intérêt légitime du studio à protéger ses formulaires, article 6.1.f).
          </p>
          <p>
            Rien d&apos;autre : pas de compte visiteur, pas de mesure d&apos;audience,
            pas de publicité.
          </p>
        </Section>

        <Section titre="Qui y a accès">
          <p>
            Seul le studio. Tes informations ne sont jamais vendues ni cédées. Pour
            fonctionner, le site s&apos;appuie sur des prestataires qui les traitent
            pour le compte du studio, sans pouvoir s&apos;en servir pour eux-mêmes :
          </p>
          <ul className="flex list-disc flex-col gap-1.5 pl-5">
            <li>Neon, pour la base de données où sont enregistrées les demandes, hébergée dans l&apos;Union européenne (Francfort) ;</li>
            <li>Resend, pour l&apos;envoi des e-mails ;</li>
            <li>Cloudflare, pour la vérification anti-robot des formulaires ;</li>
            <li>l&apos;hébergeur du site, indiqué dans les{" "}
              <Link href="/mentions-legales" className={lien}>mentions légales</Link>.
            </li>
          </ul>
          <p>
            Certains de ces prestataires sont établis hors de l&apos;Union
            européenne ; les transferts sont alors encadrés par les garanties
            prévues par le RGPD.
          </p>
        </Section>

        <Section titre="Combien de temps">
          <p>
            Tes demandes et tes messages sont conservés au plus trois ans après
            notre dernier échange, puis supprimés.
          </p>
        </Section>

        <Section titre="Cookies">
          <p>
            Le site ne dépose aucun cookie sur ton navigateur. Pendant une demande
            de réservation, ta saisie est gardée dans l&apos;onglet pour que tu ne
            perdes rien d&apos;une étape à l&apos;autre : elle s&apos;efface à
            l&apos;envoi ou à la fermeture de l&apos;onglet. Les liens vers Instagram
            mènent à un site tiers, qui applique ses propres règles.
          </p>
        </Section>

        <Section titre="Cours enfants">
          <p>
            Pour un cours destiné à un enfant, la demande est à faire par un parent
            ou la personne qui en a la responsabilité.
          </p>
        </Section>

        <Section titre="Tes droits">
          <p>
            Tu peux demander à consulter, corriger ou supprimer tes informations,
            t&apos;opposer à leur utilisation, en limiter l&apos;usage ou les
            récupérer, en écrivant à <ACompleter valeur={s.email} />. Une réponse
            t&apos;est apportée dans le mois.
          </p>
          <p>
            Si tu estimes que tes droits ne sont pas respectés, tu peux adresser une
            réclamation à la CNIL :{" "}
            <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className={lien}>
              cnil.fr
            </a>
            .
          </p>
        </Section>
      </PageLegale>
    </PageTransition>
  );
}

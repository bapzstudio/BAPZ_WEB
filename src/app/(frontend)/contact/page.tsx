import type { Metadata } from "next";
import { ContactForm } from "../_components/ContactForm";
import { FoldText } from "../_components/FoldText";
import { PageTransition } from "../_components/PageTransition";
import { Planete } from "../_components/Planete";
import { lienInstagram } from "@/lib/instagram";
import { getSiteSettings } from "@/lib/queries";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Contact & accès",
  description:
    "Adresse, horaires et formulaire de contact de BAPZ Studio, Metz.",
  path: "/contact",
});

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const horaires = settings.openingHours ?? [];

  // Légende du bloc « Où nous trouver » : la commune (fin de l'adresse) et la
  // ville de référence, sans doublon si ce sont les mêmes.
  const commune = settings.address?.split(",").pop()?.trim();
  const lieu = [...new Set([commune, settings.city].filter(Boolean))].join(
    " · ",
  );
  const itineraire = settings.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${settings.address}, France`)}`
    : undefined;

  return (
    <PageTransition>
      <div className="container-page pt-[var(--vr-104)] pb-8.5">
        {/* Même titre et même écart titre -> cartes que les autres pages. */}
        <h1 className="titre-page">
          <FoldText text="Contact" />
        </h1>
        {/* Sur téléphone, le formulaire passe avant les coordonnées : c'est
            l'action attendue de la page, et l'adresse comme l'Instagram
            restent juste en dessous. Deux colonnes à partir de `lg`, comme
            avant, le formulaire retrouvant sa place à droite. */}
        <div className="mt-[var(--vr-64)] grid gap-5 lg:grid-cols-2">
          <div className="order-last flex flex-col gap-4 lg:order-none">
            <div className="card p-6">
              <div className="eyebrow mb-2.5">STUDIO</div>
              <div className="text-xl font-bold">{settings.address}</div>
            </div>
            {settings.phone && (
              <div className="card p-6">
                <div className="eyebrow mb-2.5">TÉLÉPHONE</div>
                <a
                  href={`tel:${settings.phone.replace(/[^\d+]/g, "")}`}
                  className="text-xl font-bold transition-colors hover:text-secondary"
                >
                  {settings.phone}
                </a>
              </div>
            )}
            {settings.email && (
              <div className="card p-6">
                <div className="eyebrow mb-2.5">E-MAIL</div>
                <a
                  href={`mailto:${settings.email}`}
                  className="break-all text-xl font-bold transition-colors hover:text-secondary"
                >
                  {settings.email}
                </a>
              </div>
            )}
            {settings.instagramHandle && (
              <div className="card p-6">
                <div className="eyebrow mb-2.5">INSTAGRAM</div>
                <a
                  href={lienInstagram(settings.instagramHandle)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-bold transition-colors hover:text-secondary"
                >
                  {settings.instagramHandle}
                </a>
              </div>
            )}
            {/* Rien n'est affiché tant que les horaires ne sont pas saisis,
                plutôt qu'une rubrique vide. */}
            {horaires.length > 0 && (
              <div className="card p-6">
                <div className="eyebrow mb-2.5">HORAIRES</div>
                <dl className="flex flex-col gap-1.5">
                  {horaires.map((creneau) => (
                    <div
                      key={`${creneau.days}-${creneau.hours}`}
                      className="flex justify-between gap-4"
                    >
                      <dt className="text-secondary">{creneau.days}</dt>
                      <dd className="font-bold">{creneau.hours}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* « Où nous trouver » : la planète du logo, un point bleu sur le
                studio et le lien d'itinéraire. Pas de carte autour, il occupe
                l'espace libre sous les rubriques (`flex-1`) ; sa taille reste
                modérée pour que la page tienne dans l'écran. */}
            {itineraire && (
              <div className="flex flex-1 items-center gap-6 py-4 sm:gap-8">
                <div
                  aria-hidden
                  className="relative size-28 shrink-0 sm:size-36 lg:size-44"
                >
                  <Planete sizes="176px" className="size-full opacity-40" />
                  <span className="point-studio absolute top-[38%] left-[57%]" />
                </div>
                <div>
                  <p className="eyebrow">OÙ NOUS TROUVER</p>
                  {lieu && (
                    <p className="mt-2.5 font-mono text-label tracking-widest text-discret uppercase">
                      {lieu}
                    </p>
                  )}
                  <a
                    href={itineraire}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Itinéraire vers le studio sur Google Maps (nouvel onglet)"
                    className="pill pill-outline group mt-5 gap-2"
                  >
                    Itinéraire
                    <span
                      aria-hidden
                      className="transition-transform duration-200 group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </a>
                </div>
              </div>
            )}
          </div>

          <ContactForm />
        </div>
      </div>
    </PageTransition>
  );
}

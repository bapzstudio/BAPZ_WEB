import type { Metadata } from "next";
import { ContactForm } from "../_components/ContactForm";
import { PageTransition } from "../_components/PageTransition";
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

  return (
    <PageTransition>
      <div className="container-page pt-[var(--vr-104)] pb-8.5">
        {/* Même titre et même écart titre -> cartes que les autres pages. */}
        <h1 className="text-[clamp(38px,3.1vw,59px)] font-black uppercase leading-none tracking-tight">
          Contact
        </h1>
        <div className="mt-[var(--vr-64)] grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
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
                  href={`https://www.instagram.com/${settings.instagramHandle.replace(/^@/, "")}/`}
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
          </div>

          <ContactForm />
        </div>
      </div>
    </PageTransition>
  );
}

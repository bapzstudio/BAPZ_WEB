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

  return (
    <PageTransition>
      <div className="container-page pt-[var(--vr-104)] pb-8.5">
        <h1 className="mb-9 text-5xl font-black uppercase tracking-tight sm:text-6xl">
          Contact
        </h1>
        <div className="grid gap-5 lg:grid-cols-2">
          <div className="flex flex-col gap-4">
            <div className="card p-6">
              <div className="eyebrow mb-2.5">STUDIO</div>
              <div className="text-xl font-bold">{settings.address}</div>
            </div>
            {settings.instagramHandle && (
              <div className="card p-6">
                <div className="eyebrow mb-2.5">INSTAGRAM</div>
                <div className="text-xl font-bold">
                  {settings.instagramHandle}
                </div>
              </div>
            )}
            <div className="card p-6">
              <div className="eyebrow mb-2.5">HORAIRES</div>
              <div className="text-sm text-tertiary">
                À implémenter - horaires à confirmer avec la cliente.
              </div>
            </div>
          </div>

          <ContactForm />
        </div>
      </div>
    </PageTransition>
  );
}

import type { Metadata } from "next";
import { PageTransition } from "../_components/PageTransition";
import { getSiteSettings } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Contact & accès - BAPZ Studio",
  description: "Adresse, horaires et formulaire de contact de BAPZ Studio, Metz.",
};

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <PageTransition>
      <div className="container-page py-24">
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

          <form className="card flex flex-col gap-3.5 p-6">
            <div className="eyebrow">UN MESSAGE ?</div>
            <input
              name="name"
              placeholder="Ton nom"
              className="rounded-xl border border-card-border bg-white/[0.06] p-3.5 text-sm text-foreground placeholder:text-tertiary"
            />
            <input
              name="email"
              type="email"
              placeholder="Ton email"
              className="rounded-xl border border-card-border bg-white/[0.06] p-3.5 text-sm text-foreground placeholder:text-tertiary"
            />
            <textarea
              name="message"
              placeholder="Ton message"
              rows={4}
              className="resize-y rounded-xl border border-card-border bg-white/[0.06] p-3.5 text-sm text-foreground placeholder:text-tertiary"
            />
            <button
              type="submit"
              disabled
              className="pill pill-light mt-2 opacity-50"
              title="Envoi par e-mail pas encore branché"
            >
              Envoyer
            </button>
            <p className="text-center text-[11px] text-white/30">
              Envoi par e-mail + anti-spam - pas encore implémenté.
            </p>
          </form>
        </div>
      </div>
    </PageTransition>
  );
}

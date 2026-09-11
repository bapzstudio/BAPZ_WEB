import Link from "next/link";
import { Titre } from "../ui";

export function StepConfirmation({ prenom }: { prenom: string }) {
  return (
    <div className="flex flex-col items-center gap-7 text-center">
      <span
        aria-hidden
        className="flex size-16 items-center justify-center rounded-full border border-rule text-2xl"
      >
        ✓
      </span>
      <Titre>Demande envoyée</Titre>
      {/* « Pas encore une réservation » : rien n'est réservé automatiquement,
          la cliente répond à la main. Le dire évite qu'un visiteur se présente
          au cours en croyant sa place acquise. */}
      <p className="max-w-md text-courant leading-snug text-secondary">
        Merci{prenom ? ` ${prenom}` : ""}. Ce n&apos;est pas encore une réservation : on
        revient vers toi très vite pour la confirmer.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Link href="/" className="pill pill-light">
          Retour à l&apos;accueil
        </Link>
        <Link href="/cours" className="pill pill-outline">
          Voir le calendrier
        </Link>
      </div>
    </div>
  );
}

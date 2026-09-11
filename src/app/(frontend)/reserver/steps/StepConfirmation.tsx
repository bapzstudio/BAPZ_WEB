import Link from "next/link";
import { Planete } from "../../_components/Planete";
import { Titre } from "../ui";

export function StepConfirmation({ prenom }: { prenom: string }) {
  return (
    <div className="flex flex-col items-center gap-7 text-center">
      {/* La planète du logo à la place du ✓ : le titre dit déjà que la demande
          est partie. */}
      <Planete sizes="96px" className="planete-derive size-24 opacity-80" />
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

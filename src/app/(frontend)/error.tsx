"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Erreur pendant le rendu d'une page (base injoignable, par exemple). La nav
 * et le pied de page restent affichés ; seul le contenu est remplacé.
 *
 * Une erreur du layout lui-même — qui lit aussi la base — remonte jusqu'à
 * `app/global-error.tsx`.
 */
export default function Erreur({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-page pt-[var(--vr-104)] pb-8.5">
      <p className="eyebrow">ERREUR</p>
      <h1 className="mt-6 titre-page">
        Un souci technique
      </h1>
      <p className="mt-6 max-w-160 text-base leading-[1.3] text-secondary">
        La page n&apos;a pas pu s&apos;afficher. Réessaie dans un instant ; si
        le problème continue, écris-nous sur Instagram.
      </p>
      <div className="mt-[var(--vr-64)] flex flex-wrap gap-7">
        <button type="button" onClick={reset} className="pill pill-light">
          Réessayer
        </button>
        <Link href="/" className="pill pill-outline">
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}

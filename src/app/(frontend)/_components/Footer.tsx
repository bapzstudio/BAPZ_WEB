import Link from "next/link";
import type { SiteSettings } from "@/lib/types";

const LIEN = "-my-2 py-2 transition-colors hover:text-foreground";

export function Footer({ settings }: { settings: SiteSettings }) {
  const disciplines = (settings.marqueeItems ?? [])
    .slice(0, 2)
    .join(" / ")
    .toUpperCase();

  // Le filet supérieur est sur les quatre maquettes, à 53px du bas, dans le
  // même #707070 que la bordure de la nav.
  return (
    <footer className="relative z-10 border-t border-rule">
      {/* py-[18px] : la bande du footer mesure 53px sur les maquettes (du filet
          à y=1027 jusqu'au bas), soit 1px de filet + 16px de ligne + 2 x 18.

          À partir de `sm`, grille à trois colonnes : la colonne du milieu reste
          au centre exact, comme sur la maquette.

          Sur téléphone, deux lignes au lieu de quatre : les liens légaux, puis
          « BAPZ STUDIO » et la ville. Les disciplines sont masquées, le bandeau
          défilant juste au-dessus les affiche déjà. Les groupes passent en
          `display: contents` pour que leurs enfants se réordonnent dans la
          rangée, sans changer la structure de la grille. */}
      <div className="container-page flex flex-wrap items-center justify-center gap-x-5 gap-y-2 py-[18px] text-center font-mono text-xs text-tertiary sm:grid sm:grid-cols-[1fr_auto_1fr] sm:gap-6 sm:text-left">
        <span className="contents sm:flex sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-1">
          <span className="order-2 sm:order-none">BAPZ STUDIO</span>
          <span className="order-1 flex w-full justify-center gap-x-5 sm:contents">
            <Link href="/mentions-legales" className={LIEN}>
              MENTIONS LÉGALES
            </Link>
            <Link href="/confidentialite" className={LIEN}>
              CONFIDENTIALITÉ
            </Link>
          </span>
        </span>
        {disciplines && <span className="hidden sm:block">{disciplines}</span>}
        <span className="order-3 sm:order-none sm:col-start-3 sm:justify-self-end">
          {(settings.city ?? "Metz").toUpperCase()}, FR
          {settings.instagramHandle ? ` - ${settings.instagramHandle}` : ""}
        </span>
      </div>
    </footer>
  );
}

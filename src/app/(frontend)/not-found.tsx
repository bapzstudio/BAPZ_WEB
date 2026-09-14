import type { Metadata } from "next";
import Link from "next/link";
import { FoldText } from "./_components/FoldText";
import { Planete } from "./_components/Planete";
import { SITE_NAME } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Page introuvable - ${SITE_NAME}`,
  robots: { index: false },
};

/**
 * 404 du site, dans son layout : nav et pied de page restent là pour repartir.
 *
 * Sert aux `notFound()` des pages (un prof sans fiche, par exemple) et, via
 * `[...introuvable]`, à toute adresse qui ne correspond à rien. Mêmes titre et
 * boutons que le reste du site : pas de maquette pour cette page. La planète
 * du logo occupe la droite, derrière le texte (`isolate` borne son `-z-10`).
 */
export default function NotFound() {
  return (
    <div className="container-page relative isolate pt-[var(--vr-104)] pb-8.5">
      <Planete
        sizes="(min-width: 768px) 420px, 1px"
        className="planete-derive absolute right-10 top-[var(--vr-104)] -z-10 hidden w-[min(34vw,420px)] opacity-[0.14] md:block"
      />
      <p className="eyebrow">ERREUR 404</p>
      <h1 className="mt-6 titre-page">
        <FoldText text="Page introuvable" />
      </h1>
      <p className="mt-6 max-w-160 text-base leading-[1.3] text-secondary">
        Cette page n&apos;existe pas, ou plus. Le planning et les tarifs, eux,
        sont toujours là.
      </p>
      <div className="mt-[var(--vr-64)] flex flex-wrap gap-7">
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

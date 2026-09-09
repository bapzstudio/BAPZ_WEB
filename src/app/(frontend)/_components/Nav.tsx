"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SiteSettings } from "@/lib/types";

// Libellés et ordre repris de la maquette.
const links = [
  { href: "/", label: "Accueil" },
  { href: "/cours", label: "Calendrier" },
  { href: "/profs", label: "Profs" },
  { href: "/tarifs", label: "Tarifs" },
  { href: "/galerie", label: "Galerie" },
  { href: "/contact", label: "Contact" },
];

export function Nav({ logo }: { logo?: SiteSettings["logo"] }) {
  const pathname = usePathname();

  // Fond opaque : sur la maquette, la bande de nav ne laisse rien passer du
  // halo (bleuité B-R mesurée à 0.00 sur toute sa hauteur). Un fond translucide
  // laissait transparaître le halo flouté au-dessus du filet et net en dessous,
  // ce qui transformait le filet en couture au défilement.
  return (
    <header className="sticky top-0 z-50 border-b border-rule bg-background">
      <div className="container-page relative flex h-[66px] items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-5">
          <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/15 bg-white/5">
            {logo ? (
              <Image
                src={logo.src}
                alt="BAPZ Studio"
                width={logo.width}
                height={logo.height}
                className="size-full object-contain p-1"
                priority
              />
            ) : (
              <span className="text-[10px] font-black">BAPZ</span>
            )}
          </span>
          <span className="hidden font-mono text-sm tracking-[0.15em] text-secondary sm:inline">
            STUDIO - METZ
          </span>
        </Link>

        {/* Centré sur la fenêtre, pas entre le logo et le bouton */}
        <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                // Un seul onglet est actif à la fois, donc le nom reste unique
                // dans le document, comme l'exige l'API. Le navigateur le
                // retrouve sur l'onglet d'arrivée et fait glisser la pastille.
                style={active ? { viewTransitionName: "nav-pill" } : undefined}
                className={`rounded-full px-5 py-2 text-[13px] font-bold uppercase tracking-[0.05em] transition-colors ${
                  active
                    ? "bg-light text-background"
                    : "text-secondary hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/contact" className="pill pill-light shrink-0 text-[13px]">
          S&apos;inscrire
        </Link>
      </div>
    </header>
  );
}

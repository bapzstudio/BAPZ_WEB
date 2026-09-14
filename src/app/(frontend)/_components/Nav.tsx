"use client";

import { useLayoutEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { lienReservation } from "@/lib/reservation/liens";
import { MobileMenu } from "./MobileMenu";
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

export function Nav({
  logo,
  instagram,
}: {
  logo?: SiteSettings["logo"];
  instagram?: string;
}) {
  const pathname = usePathname();
  const navRef = useRef<HTMLElement>(null);
  const pastilleRef = useRef<HTMLSpanElement>(null);
  const dejaPlacee = useRef(false);

  // Pastille de la page courante : se déplace vers l'onglet actif à chaque
  // navigation, disparaît hors des six pages (réservation, fiche prof…).
  useLayoutEffect(() => {
    const nav = navRef.current;
    const pastille = pastilleRef.current;
    if (!nav || !pastille) return undefined;

    const reduit =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const placer = (anime: boolean) => {
      const lien = nav.querySelector<HTMLElement>(
        `[data-nav-lien="${pathname}"]`,
      );
      const duree = anime && !reduit ? 0.35 : 0;
      if (!lien) {
        gsap.to(pastille, {
          opacity: 0,
          duration: duree,
          ease: "power3.out",
          overwrite: true,
        });
        return;
      }
      // Revenir d'une page sans onglet : la pastille réapparaît sur place au
      // lieu de glisser depuis l'ancien onglet.
      const reapparait = Number(gsap.getProperty(pastille, "opacity")) === 0;
      gsap.to(pastille, {
        x: lien.offsetLeft,
        y: lien.offsetTop,
        width: lien.offsetWidth,
        height: lien.offsetHeight,
        opacity: 1,
        duration: reapparait ? 0 : duree,
        ease: "power3.out",
        // Un placement remplace le précédent : sans cela, un placement
        // instantané pendant une glissade était rattrapé par la glissade
        // encore en cours, d'où un aller-retour de la pastille.
        overwrite: true,
      });
    };

    placer(dejaPlacee.current);
    dejaPlacee.current = true;
    nav.setAttribute("data-pastille", "");

    // Largeurs recalculées quand la police finit de charger ou que la
    // fenêtre passe sous `lg` puis revient.
    // Le premier appel, immédiat à l'observation, est ignoré : il couperait
    // la glissade qui vient de partir.
    let premier = true;
    const observateur = new ResizeObserver(() => {
      if (premier) {
        premier = false;
        return;
      }
      placer(false);
    });
    observateur.observe(nav);
    return () => observateur.disconnect();
  }, [pathname]);

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
                // Affiché dans un rond de 40 px : sans `sizes`, Next servait
                // l'image en 1200 px (relevé par Lighthouse).
                sizes="40px"
                // Sans marge : comme sur la maquette, le logo posé sur sa
                // planète remplit tout le rond. Avec l'ancien logo (petite
                // planète en coin, large marge transparente) et un padding,
                // le mot « BAPZ » tombait à une dizaine de pixels.
                className="size-full object-contain"
                priority
              />
            ) : (
              <span className="text-label font-black">BAPZ</span>
            )}
          </span>
          <span className="hidden font-mono text-sm tracking-[0.15em] text-secondary sm:inline">
            STUDIO - METZ
          </span>
        </Link>

        {/* Centré sur la fenêtre, pas entre le logo et le bouton. La pastille
            de la page courante glisse d'un onglet à l'autre, comme la barre
            des jours du calendrier sur téléphone. Tant qu'elle n'est pas
            placée (`data-pastille` absent, JavaScript pas encore exécuté),
            l'onglet actif garde son propre fond. */}
        <nav
          ref={navRef}
          className="group absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex"
        >
          <span
            ref={pastilleRef}
            aria-hidden
            className="absolute top-0 left-0 rounded-full bg-light opacity-0"
          />
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                data-nav-lien={link.href}
                aria-current={active ? "page" : undefined}
                className={`relative rounded-full px-5 py-2 text-petit font-bold uppercase tracking-[0.05em] transition-colors duration-300 ${
                  active
                    ? "bg-light text-background group-data-pastille:bg-transparent"
                    : "text-secondary hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <Link
            href={lienReservation()}
            className="pill pill-light shrink-0 text-petit"
          >
            {/* « Réserver » plutôt que « S'inscrire » (maquette) : le bouton
                ouvre les quatre types de demande — essai, inscription,
                location, cours privé — et pas seulement l'inscription. */}
            Réserver
          </Link>
          {/* En dessous de `lg` les onglets ci-dessus sont masqués : sans ce
              menu, cinq pages sur six seraient inatteignables. */}
          <MobileMenu items={links} instagram={instagram} />
        </div>
      </div>
    </header>
  );
}

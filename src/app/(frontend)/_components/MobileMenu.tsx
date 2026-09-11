"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { lienInstagram } from "@/lib/instagram";
import { Planete } from "./Planete";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Item = { href: string; label: string };

/**
 * Menu de navigation en dessous de `lg`, où les onglets de la nav sont masqués.
 *
 * Adapté de StaggeredMenu (reactbits.dev), dont on reprend le geste : deux
 * pré-couches entrent en décalé, puis le panneau, puis les libellés montent un
 * à un. Le reste est réécrit : palette du projet, `next/link` au lieu de
 * `react-router`, et surtout le clavier, que l'original ne gère pas (panneau
 * simplement translaté hors écran, donc ses liens restaient tabulables).
 */
export function MobileMenu({
  items,
  instagram,
}: {
  items: Item[];
  instagram?: string;
}) {
  // On mémorise la page pour laquelle le menu a été ouvert plutôt qu'un simple
  // booléen : l'ouverture devient un état dérivé, et un changement de page le
  // referme mécaniquement. Un `useEffect` qui appellerait `setOpen(false)` sur
  // `pathname` ferait la même chose, mais avec un rendu supplémentaire — et
  // c'est précisément ce que la règle `react-hooks/set-state-in-effect`
  // déconseille.
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const pathname = usePathname();
  const open = openedFor === pathname;

  const panelRef = useRef<HTMLDivElement>(null);
  const layersRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const firstRun = useRef(true);

  const parts = () => {
    const panel = panelRef.current;
    const layers = layersRef.current;
    if (!panel || !layers) return null;
    return {
      panel,
      layers: Array.from(layers.children) as HTMLElement[],
      labels: Array.from(panel.querySelectorAll<HTMLElement>("[data-label]")),
      numbers: Array.from(panel.querySelectorAll<HTMLElement>("[data-item]")),
      socials: Array.from(panel.querySelectorAll<HTMLElement>("[data-social]")),
    };
  };

  // État fermé, repris à GSAP. Le CSS le pose déjà en `translateX(100%)` pour
  // le HTML initial ; GSAP relirait cette valeur comme un décalage en pixels et
  // l'ajouterait à `xPercent`, d'où le `x: 0` explicite.
  useIsomorphicLayoutEffect(() => {
    const p = parts();
    if (!p) return;
    gsap.set([...p.layers, p.panel], { x: 0, xPercent: 100 });
  }, []);

  useIsomorphicLayoutEffect(() => {
    const p = parts();
    if (!p) return;

    // Au montage le panneau est déjà fermé : rien à jouer.
    if (firstRun.current) {
      firstRun.current = false;
      if (!open) return;
    }

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    timelineRef.current?.kill();
    gsap.killTweensOf([...p.layers, p.panel, ...p.labels, ...p.numbers, ...p.socials]);

    if (reduceMotion) {
      const shown = open ? 0 : 100;
      gsap.set([...p.layers, p.panel], { xPercent: shown });
      gsap.set([...p.labels, ...p.socials], { y: 0, yPercent: 0, rotate: 0, opacity: 1 });
      gsap.set(p.numbers, { "--num-opacity": open ? 1 : 0 });
      return;
    }

    if (!open) {
      timelineRef.current = gsap
        .timeline()
        .to([...p.layers, p.panel], {
          xPercent: 100,
          duration: 0.32,
          ease: "power3.in",
          overwrite: "auto",
        });
      return;
    }

    // Positions de départ des éléments internes, rejouées à chaque ouverture.
    gsap.set(p.labels, { yPercent: 140, rotate: 8 });
    gsap.set(p.numbers, { "--num-opacity": 0 });
    gsap.set(p.socials, { y: 25, opacity: 0 });

    const tl = gsap.timeline();
    // Les pré-couches balaient l'écran l'une après l'autre, puis le panneau.
    p.layers.forEach((layer, i) => {
      tl.to(layer, { xPercent: 0, duration: 0.5, ease: "power4.out" }, i * 0.07);
    });
    const panelStart = p.layers.length * 0.07;
    tl.to(p.panel, { xPercent: 0, duration: 0.65, ease: "power4.out" }, panelStart);

    const itemsStart = panelStart + 0.65 * 0.15;
    tl.to(
      p.labels,
      { yPercent: 0, rotate: 0, duration: 1, ease: "power4.out", stagger: 0.1 },
      itemsStart
    );
    tl.to(
      p.numbers,
      { "--num-opacity": 1, duration: 0.6, ease: "power2.out", stagger: 0.08 },
      itemsStart + 0.1
    );
    tl.to(
      p.socials,
      { y: 0, opacity: 1, duration: 0.55, ease: "power3.out", stagger: 0.08 },
      panelStart + 0.65 * 0.4
    );

    timelineRef.current = tl;
  }, [open]);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpenedFor(null);
      buttonRef.current?.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpenedFor(open ? null : pathname)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        data-open={open || undefined}
        className="menu-toggle lg:hidden"
      >
        <span className="menu-toggle-icon" aria-hidden>
          <span />
          <span />
        </span>
      </button>

      {/* Pré-couches : deux voiles de plus en plus sombres qui précèdent le
          panneau, dans les gris mesurés du projet. */}
      <div ref={layersRef} className="menu-layers lg:hidden" aria-hidden>
        <div style={{ background: "var(--outline-fill)" }} />
        <div style={{ background: "var(--card)" }} />
      </div>

      <div
        id="menu-mobile"
        ref={panelRef}
        // `inert` plutôt qu'un simple masquage : fermé, le panneau n'est que
        // translaté hors écran, ses liens resteraient tabulables.
        inert={!open}
        className="menu-panel lg:hidden"
      >
        {/* La planète du logo en filigrane, au bas du panneau. Rognée par son
            cadre : sans lui, son débordement ajouterait une barre de
            défilement au panneau. `-z-10` la garde derrière les liens, le
            panneau formant son propre contexte d'empilement. */}
        <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
          <Planete
            sizes="320px"
            className="absolute -right-24 -bottom-24 w-80 opacity-[0.12]"
          />
        </div>
        <nav aria-label="Navigation principale">
          <ul className="menu-list">
            {items.map((item) => (
              <li key={item.href} data-item>
                <Link href={item.href} className="menu-link">
                  <span data-label>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-auto pt-8">
          <div className="eyebrow text-xs" data-social>
            RETROUVE-NOUS
          </div>
          <div className="mt-3 flex flex-wrap gap-5 font-mono text-sm">
            {instagram && (
              <a
                data-social
                href={lienInstagram(instagram)}
                target="_blank"
                rel="noopener noreferrer"
                className="-my-2 py-2 text-secondary transition-colors hover:text-foreground"
              >
                {instagram.toUpperCase()}
              </a>
            )}
            <Link
              data-social
              href="/contact"
              className="-my-2 py-2 text-secondary transition-colors hover:text-foreground"
            >
              NOUS ÉCRIRE
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type ElementType,
  type ReactNode,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Même raison que dans FoldText : poser l'état masqué avant le premier rendu
// visuel, sinon le contenu apparaît en entier puis disparaît d'un coup.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Fait entrer ses enfants directs au défilement, l'un après l'autre.
 *
 * Les réglages reprennent ceux de `FoldText` (0,65s, `power3.out`, décalage de
 * 45 ms, déclenchement à 82% de la fenêtre) pour que le bas de page prolonge le
 * geste du titre au lieu d'introduire un second vocabulaire d'animation.
 *
 * Le conteneur porte lui-même `className` : on peut donc lui passer les classes
 * de grille et animer directement les cartes, sans niveau supplémentaire qui
 * casserait la mise en page.
 */
export function Reveal({
  children,
  className = "",
  as: Tag = "div",
  y = 12,
  stagger = 0.045,
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  /** Décalage vertical de départ, en pixels. */
  y?: number;
  /** Retard entre deux enfants, en secondes. */
  stagger?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = ref.current;
    if (!root) return undefined;

    const targets = Array.from(root.children) as HTMLElement[];

    // Mouvement réduit : on ne masque rien du tout. Une entrée au défilement
    // n'apporte rien à qui la refuse, et tout ce qui masque du contenu est une
    // occasion de le laisser invisible.
    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!targets.length || reduceMotion) {
      root.removeAttribute("data-reveal-pending");
      return undefined;
    }

    // L'état de départ est posé avant la création du déclencheur : sinon un
    // bloc déjà visible au chargement s'animerait depuis son état final.
    gsap.set(targets, { opacity: 0, y });
    root.removeAttribute("data-reveal-pending");

    // ScrollTrigger joue aussi les blocs déjà dans le champ au chargement
    // (vérifié sur une fenêtre de 1600px de haut) : pas besoin de déclencher
    // l'animation à la main en plus.
    const scrollTrigger = ScrollTrigger.create({
      trigger: root,
      start: "top 82%",
      once: true,
      onEnter: () => {
        gsap.to(targets, {
          opacity: 1,
          y: 0,
          duration: 0.65,
          ease: "power3.out",
          stagger,
        });
      },
    });

    return () => {
      scrollTrigger.kill();
      gsap.killTweensOf(targets);
    };
  }, [y, stagger]);

  return (
    // `data-reveal` reste en place après l'animation (contrairement à
    // `data-reveal-pending`) : un composant enfant peut ainsi caler son propre
    // déclencheur sur celui de la grille, comme le fait PriceCounter.
    <Tag ref={ref} data-reveal="" data-reveal-pending="" className={className}>
      {children}
    </Tag>
  );
}

"use client";

import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { gsap } from "gsap";

// useLayoutEffect côté client pour poser l'état plié avant le premier rendu
// visuel (sinon le titre apparaît en entier puis disparaît d'un coup).
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

// Réglages du titre du hero, seul usage : mot par mot, charnière en haut, joué
// au chargement. Le composant d'origine (reactbits) proposait d'autres
// découpes, charnières et déclencheurs, jamais utilisés ici.
const DUREE = 0.65;
const DECALAGE = 0.045;
const PLI = 0.55;

/**
 * Titre qui se déplie mot par mot, comme une page rabattue.
 *
 * Le texte complet reste lisible par les lecteurs d'écran ; la version
 * découpée est décorative. Un retour à la ligne dans `text` coupe le titre au
 * même endroit.
 */
export function FoldText({ text }: { text: string }) {
  const rootRef = useRef<HTMLSpanElement>(null);

  const segments = useMemo(
    () =>
      text.split(/(\s+)/).flatMap((part, index) => {
        if (!part) return [];
        // Les blancs sont conservés tels quels : associés à `white-space:
        // pre-wrap`, ils restent visibles ET permettent au titre de passer à
        // la ligne sur petit écran.
        if (/^\s+$/.test(part)) {
          return part.split(/(\n)/).map((bout, i) => {
            if (bout === "\n") return <br key={`br-${index}-${i}`} />;
            if (!bout) return null;
            return (
              <span
                className="fold-text-whitespace"
                key={`blanc-${index}-${i}`}
              >
                {bout}
              </span>
            );
          });
        }
        return (
          <span className="fold-text-segment" key={`mot-${index}`}>
            <span className="fold-text-piece">{part}</span>
          </span>
        );
      }),
    [text],
  );

  useIsomorphicLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const pieces = gsap.utils.toArray<HTMLElement>(
      root.querySelectorAll(".fold-text-piece"),
    );
    if (!pieces.length) return undefined;

    const reduceMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    // `fromTo` pose l'état plié immédiatement, avant le premier paint.
    const tween = gsap.fromTo(
      pieces,
      {
        opacity: 0,
        rotateX: reduceMotion ? 0 : -92,
        "--fold-crease": reduceMotion ? 0 : PLI,
        transformOrigin: "50% 0%",
        force3D: true,
      },
      {
        opacity: 1,
        rotateX: 0,
        "--fold-crease": 0,
        duration: reduceMotion ? 0.22 : DUREE,
        ease: reduceMotion ? "power1.out" : "power3.out",
        stagger: reduceMotion ? 0.02 : DECALAGE,
        clearProps: "willChange",
      },
    );

    // GSAP pilote désormais l'opacité : on retire le garde-fou CSS qui masquait
    // le texte entre le rendu serveur et l'hydratation.
    root.removeAttribute("data-fold-pending");

    return () => {
      tween.kill();
    };
  }, [text]);

  return (
    <span ref={rootRef} data-fold-pending="" className="fold-text">
      <span className="fold-text-sr-only">{text}</span>
      <span className="fold-text-visual" aria-hidden="true">
        {segments}
      </span>
    </span>
  );
}

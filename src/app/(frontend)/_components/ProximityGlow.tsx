"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Allume la bordure des cartes `[data-glow-card]` qu'il contient, d'autant plus
 * fort que le curseur en est proche.
 *
 * Idée reprise de MagicBento (reactbits.dev), mais branchée sur la bordure
 * existante de `.cal-card` au lieu d'en poser une nouvelle : le halo se
 * contente d'éclairer le tracé déjà mesuré sur la maquette.
 *
 * Un seul écouteur pour toute la grille, et non un par carte : le calendrier en
 * compte une par créneau. Les positions sont toutes lues avant d'écrire le
 * moindre style, pour ne pas alterner lecture et écriture de mise en page à
 * chaque image.
 */
export function ProximityGlow({
  children,
  className,
  /** Distance en pixels au-delà de laquelle une carte ne réagit plus. */
  radius = 320,
}: {
  children: ReactNode;
  className?: string;
  radius?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    // Sans curseur (tactile) il n'y a pas de proximité à mesurer, et le halo
    // resterait figé sur la dernière position touchée.
    const inert =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      window.matchMedia?.("(pointer: coarse)").matches;
    if (inert) return undefined;

    let frame = 0;

    const clear = () => {
      for (const card of root.querySelectorAll<HTMLElement>(
        "[data-glow-card]",
      )) {
        card.style.setProperty("--glow-intensity", "0");
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        const cards = Array.from(
          root.querySelectorAll<HTMLElement>("[data-glow-card]"),
        );

        // Phase de lecture.
        const measures = cards.map((card) => {
          const rect = card.getBoundingClientRect();
          // Distance du curseur au rectangle, nulle s'il est dedans.
          const dx = Math.max(
            rect.left - event.clientX,
            0,
            event.clientX - rect.right,
          );
          const dy = Math.max(
            rect.top - event.clientY,
            0,
            event.clientY - rect.bottom,
          );
          return {
            card,
            distance: Math.hypot(dx, dy),
            x: event.clientX - rect.left,
            y: event.clientY - rect.top,
          };
        });

        // Phase d'écriture.
        for (const { card, distance, x, y } of measures) {
          const intensity = distance >= radius ? 0 : 1 - distance / radius;
          card.style.setProperty("--glow-intensity", intensity.toFixed(3));
          card.style.setProperty("--glow-x", `${x}px`);
          card.style.setProperty("--glow-y", `${y}px`);
        }
      });
    };

    root.addEventListener("pointermove", onPointerMove, { passive: true });
    root.addEventListener("pointerleave", clear);

    return () => {
      cancelAnimationFrame(frame);
      root.removeEventListener("pointermove", onPointerMove);
      root.removeEventListener("pointerleave", clear);
    };
  }, [radius]);

  return (
    <div ref={rootRef} className={className}>
      {children}
    </div>
  );
}

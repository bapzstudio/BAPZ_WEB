"use client";

import { useRef, type CSSProperties, type MouseEvent, type ReactNode } from "react";

/**
 * Halo qui suit le curseur (adapté de SpotlightCard, reactbits.dev).
 *
 * Volontairement dépourvu de style propre (fond, bordure, rayon, padding) :
 * l'apparence vient de la classe passée en `className` (typiquement `.card`),
 * pour ne pas écraser les valeurs mesurées sur la maquette.
 */
export function SpotlightCard({
  children,
  className = "",
  spotlightColor = "rgba(255, 255, 255, 0.18)",
}: {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mouse-x", `${event.clientX - rect.left}px`);
    el.style.setProperty("--mouse-y", `${event.clientY - rect.top}px`);
  };

  return (
    <div
      ref={ref}
      onMouseMove={handleMouseMove}
      style={{ "--spotlight-color": spotlightColor } as CSSProperties}
      className={`spotlight ${className}`}
    >
      {children}
    </div>
  );
}

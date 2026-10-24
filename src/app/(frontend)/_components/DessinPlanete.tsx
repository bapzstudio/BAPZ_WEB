"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";

// Même raison que dans FoldText : poser l'état « non dessiné » avant le
// premier rendu visuel, sinon le logo apparaît en entier puis disparaît.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Anime le SVG de `PlaneteDessinee` : le contour de chaque trait de la planète
 * se trace, puis le trait se remplit et la planète s'estompe à son dosage du
 * logo pendant que le mot BAPZ apparaît par-dessus.
 *
 * Le tracé progressif joue sur le contour (`stroke-dasharray` égal à la
 * longueur du tracé, `stroke-dashoffset` ramené à zéro) : c'est la technique
 * de `createDrawable` d'anime.js, faite ici avec GSAP pour garder une seule
 * bibliothèque d'animation. Les traits du logo étant des formes pleines au
 * pinceau, leur contour se lit comme une esquisse ; le remplissage prend
 * ensuite le relais pour retrouver le rendu exact du logo. Le contour est
 * dessiné à pleine opacité : à celle de la planète finie (20 % du mot), il ne
 * se voyait presque pas.
 *
 * Ne rend rien : un repère invisible permet de retrouver le SVG voisin.
 */
export function DessinPlanete() {
  const repere = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const svg =
      repere.current?.parentElement?.querySelector<SVGSVGElement>(
        "svg[data-dessin]",
      );
    if (!svg) return undefined;

    const planete = svg.querySelector<SVGGElement>("[data-dessin-planete]");
    const lignes = Array.from(
      svg.querySelectorAll<SVGPathElement>("[data-dessin-planete] path"),
    );
    const lettres = Array.from(
      svg.querySelectorAll<SVGPathElement>("[data-dessin-mot] path"),
    );

    // Mouvement réduit : le logo s'affiche tel quel, sans rien masquer.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      svg.removeAttribute("data-dessin-pending");
      return undefined;
    }

    const longueurs = lignes.map((ligne) => ligne.getTotalLength());
    gsap.set(lignes, {
      fillOpacity: 0,
      stroke: "#fff",
      strokeWidth: 4,
      strokeDasharray: (i: number) => longueurs[i],
      strokeDashoffset: (i: number) => longueurs[i],
    });
    // L'opacité finale reste celle de l'attribut, posé par le serveur.
    const opaciteFinale = Number(planete?.getAttribute("opacity") ?? 1);
    gsap.set(planete, { opacity: 1 });
    gsap.set(lettres, { opacity: 0, y: 30 });
    svg.removeAttribute("data-dessin-pending");

    const animation = gsap
      .timeline({ delay: 0.15 })
      .to(lignes, {
        strokeDashoffset: 0,
        duration: 1.1,
        ease: "power2.inOut",
        stagger: { each: 0.012, from: "random" },
      })
      .to(
        lignes,
        { fillOpacity: 1, strokeOpacity: 0, duration: 0.5, ease: "power1.out" },
        ">-0.25",
      )
      .to(
        planete,
        { opacity: opaciteFinale, duration: 0.8, ease: "power1.inOut" },
        "<",
      )
      .to(
        lettres,
        { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.07 },
        "<",
      );

    return () => {
      animation.kill();
      gsap.set([planete, ...lignes, ...lettres], { clearProps: "all" });
    };
  }, []);

  return <span ref={repere} hidden />;
}

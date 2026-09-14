"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Même raison que dans Reveal : poser l'état masqué avant le premier rendu
// visuel, sinon la grille apparaît en entier puis disparaît.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/** Décalage entre deux colonnes, en secondes : le geste se lit lundi -> samedi. */
const DECALAGE_COLONNE = 0.06;

/**
 * Anime la grille hebdomadaire du calendrier (à partir de 1440 px) :
 *
 * - entrée au défilement : les noms des jours montent en cascade, leur filet
 *   se trace de gauche à droite, puis les cartes montent colonne par colonne ;
 *   réglages de Reveal (0,65 s, `power3.out`, déclenchement à 82 %) ;
 * - colonne éclairée : survoler une carte allume l'en-tête de son jour, pour
 *   rattacher la carte à sa colonne dans une grille de sept.
 *
 * Ne rend rien : le balisage vient de WeekSchedule (composant serveur), repéré
 * par ses attributs `data-grille…`. Pendant du composant CalendrierAnimations,
 * qui anime la liste par jour affichée en dessous de 1440 px.
 */
export function CalendrierGrille() {
  const repere = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const grille = repere.current?.parentElement;
    if (!grille) return undefined;

    const entetes = Array.from(
      grille.querySelectorAll<HTMLElement>("[data-grille-jour]"),
    );
    const cellules = Array.from(
      grille.querySelectorAll<HTMLElement>("[data-grille-cellule]"),
    );

    const reduit =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const nettoyages: Array<() => void> = [];

    // --- Entrée au défilement ---------------------------------------------
    if (reduit) {
      grille.removeAttribute("data-grille-pending");
    } else {
      const titres = entetes.map((e) => e.querySelector("[data-jour-titre]"));
      const filets = entetes.map((e) => e.querySelector("[data-jour-filet]"));
      const cartes = cellules.flatMap((cellule) =>
        Array.from(cellule.children).map((carte) => ({
          carte,
          jour: Number(cellule.dataset.grilleCellule ?? 0),
        })),
      );

      gsap.set(titres, { opacity: 0, y: 12 });
      gsap.set(filets, { scaleX: 0, transformOrigin: "0% 50%" });
      gsap.set(
        cartes.map((c) => c.carte),
        { opacity: 0, y: 12 },
      );
      grille.removeAttribute("data-grille-pending");

      const entree = gsap
        .timeline({ paused: true })
        .to(titres, {
          opacity: 1,
          y: 0,
          duration: 0.5,
          ease: "power3.out",
          stagger: 0.045,
        })
        .to(
          filets,
          { scaleX: 1, duration: 0.65, ease: "power3.out", stagger: 0.045 },
          "<0.05",
        );

      // Les cartes suivent leur colonne, et non leur ordre dans le document :
      // une cellule du samedi écrite avant une du lundi entrerait sinon la
      // première, et la cascade partirait dans le désordre.
      for (const { carte, jour } of cartes) {
        entree.to(
          carte,
          { opacity: 1, y: 0, duration: 0.65, ease: "power3.out" },
          `0.2+=${jour * DECALAGE_COLONNE}`,
        );
      }

      const declencheur = ScrollTrigger.create({
        trigger: grille,
        start: "top 82%",
        once: true,
        onEnter: () => entree.play(),
      });
      nettoyages.push(() => {
        declencheur.kill();
        entree.kill();
      });
    }

    // --- Colonne éclairée au survol ---------------------------------------
    // Sans curseur il n'y a rien à survoler, et la colonne resterait allumée
    // sur le dernier toucher (même garde-fou que ProximityGlow).
    const sansCurseur =
      window.matchMedia?.("(pointer: coarse)").matches ?? false;
    if (!sansCurseur && entetes.length > 0) {
      const eteindre = () => {
        for (const entete of entetes) entete.removeAttribute("data-actif");
      };

      const auSurvol = (event: PointerEvent) => {
        const cellule = (event.target as HTMLElement).closest<HTMLElement>(
          "[data-grille-cellule]",
        );
        eteindre();
        if (!cellule) return;
        entetes[Number(cellule.dataset.grilleCellule ?? -1)]?.setAttribute(
          "data-actif",
          "",
        );
      };

      grille.addEventListener("pointerover", auSurvol);
      grille.addEventListener("pointerleave", eteindre);
      nettoyages.push(() => {
        grille.removeEventListener("pointerover", auSurvol);
        grille.removeEventListener("pointerleave", eteindre);
      });
    }

    return () => {
      for (const nettoyer of nettoyages) nettoyer();
    };
  }, []);

  return <span ref={repere} hidden />;
}

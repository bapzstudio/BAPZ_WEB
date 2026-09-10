"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Prix qui compte de 0 à sa valeur quand il entre dans le champ.
 *
 * Le prix final est toujours rendu côté serveur : c'est lui que lisent Google
 * et les lecteurs d'écran, et c'est lui qui reste affiché si le JavaScript ne
 * se charge pas. Le compteur ne fait que réécrire le texte visible pendant
 * l'animation.
 *
 * Trois couches superposées dans la même cellule de grille : le texte pour les
 * lecteurs d'écran, une copie invisible du prix final qui fixe la largeur (sans
 * elle, la carte « respirerait » à chaque chiffre ajouté), et le texte animé.
 */
export function PriceCounter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    // « 160 € » -> "" / "160" / " €". Un prix sans chiffre reste tel quel.
    const morceaux = value.match(/^(\D*)(\d+(?:[.,]\d+)?)(.*)$/);
    if (!morceaux) return undefined;
    const [, avant, nombre, apres] = morceaux;
    const cible = Number(nombre.replace(",", "."));
    const decimales = nombre.split(/[.,]/)[1]?.length ?? 0;

    const etat = { v: 0 };
    const ecrire = () => {
      el.textContent = `${avant}${etat.v.toLocaleString("fr-FR", {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
      })}${apres}`;
    };
    let tween: gsap.core.Tween | undefined;
    const scrollTrigger = ScrollTrigger.create({
      // Même déclencheur et même seuil que la grille `Reveal` qui contient la
      // carte : le compteur démarre à l'instant où la carte commence à
      // apparaître. Avec un seuil propre, sur certaines hauteurs de fenêtre la
      // carte devenait visible alors que son prix affichait encore « 0 € ».
      trigger: el.closest("[data-reveal]") ?? el,
      start: "top 82%",
      once: true,
      onEnter: () => {
        // Le prix final reste affiché jusqu'ici : on ne passe à 0 qu'au départ
        // du compteur, jamais en attendant qu'il démarre.
        ecrire();
        // Réglages de FoldText et Reveal, pour un seul vocabulaire de mouvement.
        tween = gsap.to(etat, {
          v: cible,
          duration: 1.1,
          ease: "power3.out",
          onUpdate: ecrire,
          // On repose la chaîne d'origine : aucun écart de formatage possible
          // entre la fin du compteur et le prix saisi.
          onComplete: () => {
            el.textContent = value;
          },
        });
      },
    });

    return () => {
      scrollTrigger.kill();
      tween?.kill();
      el.textContent = value;
    };
  }, [value]);

  return (
    <span className="inline-grid tabular-nums">
      <span className="sr-only">{value}</span>
      <span aria-hidden className="invisible col-start-1 row-start-1">
        {value}
      </span>
      <span ref={ref} aria-hidden className="col-start-1 row-start-1">
        {value}
      </span>
    </span>
  );
}

"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Même raison que dans Reveal : poser l'état masqué avant le premier rendu
// visuel, sinon les cartes apparaissent en entier puis disparaissent.
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Anime la liste par jour du calendrier (sous 1280 px) :
 *
 * - entrée au défilement : le nom du jour apparaît, son filet se trace de
 *   gauche à droite, puis ses cartes montent l'une après l'autre ; mêmes
 *   réglages que Reveal (0,65 s, `power3.out`, déclenchement à 82 %) ;
 * - barre des jours collante : une pastille glisse vers le jour affiché, et
 *   toucher un jour y fait défiler en douceur.
 *
 * Ne rend rien : le balisage vient de WeekSchedule (composant serveur), repéré
 * par ses attributs `data-jour…`. Sans JavaScript, la liste reste entière et
 * la barre fonctionne comme de simples ancres.
 */
export function CalendrierAnimations() {
  const repere = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const liste = repere.current?.parentElement;
    if (!liste) return undefined;

    const sections = Array.from(
      liste.querySelectorAll<HTMLElement>("[data-jour]"),
    );
    const barre = liste.querySelector<HTMLElement>("[data-jours-barre]");
    const pastille = liste.querySelector<HTMLElement>("[data-jours-pastille]");
    const liens = Array.from(
      liste.querySelectorAll<HTMLAnchorElement>("[data-jour-lien]"),
    );

    const reduit =
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    // Au-delà de 1280 px la liste est masquée au profit de la grille.
    const grille = window.matchMedia?.("(min-width: 1280px)").matches ?? false;
    const nettoyages: Array<() => void> = [];

    // --- Entrée au défilement --------------------------------------------
    if (reduit || grille) {
      for (const section of sections)
        section.removeAttribute("data-jour-pending");
    } else {
      for (const section of sections) {
        const titre = section.querySelector("[data-jour-titre]");
        const filet = section.querySelector("[data-jour-filet]");
        const cartes = Array.from(
          section.querySelectorAll("[data-jour-cartes] > *"),
        );

        gsap.set(titre, { opacity: 0, y: 12 });
        gsap.set(filet, { scaleX: 0, transformOrigin: "0% 50%" });
        gsap.set(cartes, { opacity: 0, y: 12 });
        section.removeAttribute("data-jour-pending");

        const entree = gsap
          .timeline({ paused: true })
          .to(titre, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" })
          .to(filet, { scaleX: 1, duration: 0.65, ease: "power3.out" }, "<0.05")
          .to(
            cartes,
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              ease: "power3.out",
              stagger: 0.08,
            },
            "<0.15",
          );

        const declencheur = ScrollTrigger.create({
          trigger: section,
          start: "top 82%",
          once: true,
          onEnter: () => entree.play(),
        });
        nettoyages.push(() => {
          declencheur.kill();
          entree.kill();
        });
      }
    }

    // --- Barre des jours ---------------------------------------------------
    if (barre && pastille && liens.length > 0 && sections.length > 0) {
      let actif = -1;

      const placer = (index: number, anime: boolean) => {
        const lien = liens[index];
        if (!lien) return;
        gsap.to(pastille, {
          x: lien.offsetLeft,
          y: lien.offsetTop,
          width: lien.offsetWidth,
          height: lien.offsetHeight,
          opacity: 1,
          duration: anime && !reduit ? 0.35 : 0,
          ease: "power3.out",
          // Comme dans la nav : un placement remplace la glissade en cours.
          overwrite: true,
        });
        liens.forEach((l, i) => {
          if (i === index) l.setAttribute("aria-current", "true");
          else l.removeAttribute("aria-current");
        });
        // Barre plus large que l'écran : le jour actif reste visible.
        if (barre.scrollWidth > barre.clientWidth) {
          barre.scrollTo({
            left: lien.offsetLeft - 16,
            behavior: anime && !reduit ? "smooth" : "auto",
          });
        }
      };

      // Jour choisi dans la barre : il reste actif le temps du défilement qui
      // y mène, sans que la pastille passe par les jours intermédiaires.
      let choisi = -1;
      let finChoix = 0;

      // Le jour actif est le dernier dont le haut est passé sous la barre. Les
      // derniers jours n'atteignent jamais la barre, la page s'arrêtant avant :
      // en bas de page, c'est donc le dernier jour.
      const mesurer = () => {
        const seuil = barre.getBoundingClientRect().bottom + 24;
        let index = 0;
        sections.forEach((section, i) => {
          if (section.getBoundingClientRect().top <= seuil) index = i;
        });
        const enBas =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - 2;
        if (enBas) index = sections.length - 1;
        if (choisi !== -1) index = choisi;
        if (index !== actif) {
          placer(index, actif !== -1);
          actif = index;
        }
      };

      let image = 0;
      const auDefilement = () => {
        if (image) return;
        image = requestAnimationFrame(() => {
          image = 0;
          mesurer();
        });
      };
      const auRedimensionnement = () => {
        actif = -1;
        auDefilement();
      };

      const auClic = (event: MouseEvent) => {
        const lien = (event.target as HTMLElement).closest<HTMLAnchorElement>(
          "[data-jour-lien]",
        );
        const cible =
          lien &&
          liste.querySelector<HTMLElement>(
            `[data-jour="${lien.dataset.jourLien}"]`,
          );
        if (!cible) return;
        event.preventDefault();
        choisi = sections.indexOf(cible);
        placer(choisi, true);
        actif = choisi;
        // Levé à l'arrêt du défilement ; le délai couvre les navigateurs sans
        // `scrollend` et le cas où la page est déjà à la bonne position.
        const liberer = () => {
          choisi = -1;
          window.clearTimeout(finChoix);
          window.removeEventListener("scrollend", liberer);
        };
        window.clearTimeout(finChoix);
        window.addEventListener("scrollend", liberer, { once: true });
        finChoix = window.setTimeout(liberer, 1200);
        // Hauteur de la barre une fois collée (son `top` en CSS, soit la nav,
        // plus sa propre hauteur), et non sa position au moment du clic : en
        // haut de la page elle est encore dans le flux, bien plus bas, et le
        // jour visé s'arrêtait 220px trop bas.
        const collee = parseFloat(getComputedStyle(barre).top) || 0;
        const haut =
          cible.getBoundingClientRect().top +
          window.scrollY -
          (collee + barre.offsetHeight + 16);
        window.scrollTo({ top: haut, behavior: reduit ? "auto" : "smooth" });
      };

      window.addEventListener("scroll", auDefilement, { passive: true });
      window.addEventListener("resize", auRedimensionnement);
      barre.addEventListener("click", auClic);
      mesurer();

      nettoyages.push(() => {
        cancelAnimationFrame(image);
        window.clearTimeout(finChoix);
        window.removeEventListener("scroll", auDefilement);
        window.removeEventListener("resize", auRedimensionnement);
        barre.removeEventListener("click", auClic);
        gsap.killTweensOf(pastille);
      });
    }

    return () => {
      for (const nettoyer of nettoyages) nettoyer();
    };
  }, []);

  return <span ref={repere} hidden />;
}

"use client";

import { useEffect, useRef, type PointerEvent, type RefObject } from "react";
import { gsap } from "gsap";

/** Durée de l'entrée et de la sortie de la bande (réglage de FlowingMenu). */
const DUREE_BANDE = 0.6;
/** Vitesse du défilement dans la bande, en pixels par seconde. */
const VITESSE = 70;
/**
 * Répétitions du texte dans la bande. Un libellé fait 400 à 550 px en
 * capitales : huit copies couvrent le conteneur de 1700 px avec de la marge
 * pour la boucle, sans mesure préalable.
 */
const REPETITIONS = 8;

/**
 * Bande claire qui glisse sur une ligne au survol, son texte défilant en
 * boucle. Inspirée de FlowingMenu (reactbits.dev), partagée par les questions
 * fréquentes (`QuestionFluide`) et les formules de la page Tarifs
 * (`LigneTarif`), pour qu'un même geste signale une ligne active partout.
 *
 * - la bande entre et sort par le bord le plus proche du curseur ;
 * - le défilement ne tourne que pendant le survol ;
 * - souris uniquement : rien au tactile, rien en mouvement réduit — la bande y
 *   est même masquée en CSS (`.bande-fluide`) ;
 * - `racineRef` porte `data-survol` pendant le survol : ce qui reste lisible
 *   au-dessus de la bande (le « + », un prix) passe en sombre avec
 *   `group-data-[survol]:text-background` ;
 * - `reserveRef`, facultatif : l'élément que le texte défilant ne doit pas
 *   recouvrir, mesuré à chaque entrée. Sans lui, la zone libre à droite est
 *   celle du « + » de la FAQ (`--bande-reserve`, 5,5 rem).
 */
export function useBandeFluide(
  racineRef: RefObject<HTMLElement | null>,
  reserveRef?: RefObject<HTMLElement | null>,
) {
  const bandeRef = useRef<HTMLDivElement>(null);
  const pisteRef = useRef<HTMLDivElement>(null);
  const defilement = useRef<gsap.core.Tween | null>(null);
  const survole = useRef(false);

  useEffect(
    () => () => {
      defilement.current?.kill();
      const cibles = [bandeRef.current, pisteRef.current].filter(Boolean);
      if (cibles.length) gsap.killTweensOf(cibles);
    },
    [],
  );

  /** Bord le plus proche du curseur : au-dessus ou en dessous du milieu. */
  const parLeHaut = (event: PointerEvent<HTMLElement>) => {
    const boite = event.currentTarget.getBoundingClientRect();
    return event.clientY - boite.top < boite.height / 2;
  };

  const entrer = (event: PointerEvent<HTMLElement>) => {
    const bande = bandeRef.current;
    const piste = pisteRef.current;
    if (
      !bande ||
      !piste ||
      event.pointerType !== "mouse" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    survole.current = true;
    racineRef.current?.setAttribute("data-survol", "");

    // Zone laissée libre à droite, mesurée à chaque entrée : la largeur d'un
    // prix change avec la fenêtre. 16 px d'air avant le fondu.
    const reserve = reserveRef?.current;
    if (reserve) {
      const libre =
        bande.getBoundingClientRect().right -
        reserve.getBoundingClientRect().left;
      bande.style.setProperty("--bande-reserve", `${Math.ceil(libre + 16)}px`);
    }

    // La boucle parcourt exactement une copie : la suivante prend sa place.
    if (!defilement.current) {
      const copie = piste.firstElementChild as HTMLElement | null;
      const largeur = copie?.offsetWidth ?? 0;
      if (largeur > 0) {
        defilement.current = gsap.fromTo(
          piste,
          { x: 0 },
          {
            x: -largeur,
            duration: largeur / VITESSE,
            ease: "none",
            repeat: -1,
          },
        );
      }
    } else {
      defilement.current.play();
    }

    const haut = parLeHaut(event);
    // `y: 0` : la position de départ est posée en CSS (`.bande-fluide`), que
    // GSAP lirait sinon en pixels et ajouterait au pourcentage.
    gsap
      .timeline({
        defaults: {
          duration: DUREE_BANDE,
          ease: "expo.out",
          overwrite: "auto",
        },
      })
      .set(bande, { y: 0, yPercent: haut ? -101 : 101 }, 0)
      .set(piste, { y: 0, yPercent: haut ? 101 : -101 }, 0)
      .to([bande, piste], { yPercent: 0 }, 0);
  };

  const sortir = (event: PointerEvent<HTMLElement>) => {
    const bande = bandeRef.current;
    const piste = pisteRef.current;
    if (!bande || !piste || !survole.current) return;
    survole.current = false;
    racineRef.current?.removeAttribute("data-survol");

    const haut = parLeHaut(event);
    gsap
      .timeline({
        defaults: {
          duration: DUREE_BANDE,
          ease: "expo.out",
          overwrite: "auto",
        },
        // Le défilement s'arrête une fois la bande sortie, sauf si le curseur
        // est revenu entre-temps.
        onComplete: () => {
          if (!survole.current) defilement.current?.pause();
        },
      })
      .to(bande, { yPercent: haut ? -101 : 101 }, 0)
      .to(piste, { yPercent: haut ? 101 : -101 }, 0);
  };

  return { bandeRef, pisteRef, entrer, sortir };
}

/**
 * Le dessin de la bande, à poser dans l'élément survolé (`relative`,
 * `overflow-hidden`). Décorative : le texte reste lu une fois, dans la ligne.
 */
export function BandeFluide({
  texte,
  bandeRef,
  pisteRef,
  tailleTexte = "text-base sm:text-lg",
}: {
  texte: string;
  bandeRef: RefObject<HTMLDivElement | null>;
  pisteRef: RefObject<HTMLDivElement | null>;
  /** Classes de taille du texte défilant, à accorder à celle de la ligne. */
  tailleTexte?: string;
}) {
  return (
    <div
      ref={bandeRef}
      aria-hidden
      className="bande-fluide pointer-events-none absolute inset-0 z-10 overflow-hidden bg-light"
    >
      {/* Masque en dégradé sur le texte seul (le fond de la bande reste plein) :
          le défilement s'efface avant ce qui reste lisible à droite. Sans lui,
          les capitales passaient sous le « + » et le rendaient illisible.
          Léger fondu à gauche pour que le texte n'arrive pas coupé net. */}
      <div className="bande-fluide-masque h-full">
        <div ref={pisteRef} className="flex h-full w-max items-center">
          {Array.from({ length: REPETITIONS }, (_, index) => (
            <span
              key={index}
              className={`flex shrink-0 items-center gap-6 pr-6 font-black uppercase leading-none whitespace-nowrap text-background ${tailleTexte}`}
            >
              {texte}
              <span className="opacity-40">✦</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

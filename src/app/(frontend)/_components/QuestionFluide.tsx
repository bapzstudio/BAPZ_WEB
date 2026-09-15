"use client";

import { useEffect, useRef, type MouseEvent, type PointerEvent } from "react";
import { gsap } from "gsap";
import { BioParagraph } from "./BioText";

/** Durée de l'entrée et de la sortie de la bande (réglage de FlowingMenu). */
const DUREE_BANDE = 0.6;
/** Vitesse du défilement dans la bande, en pixels par seconde. */
const VITESSE = 70;
/**
 * Répétitions de la question dans la bande. Une question fait 400 à 550 px en
 * capitales : huit copies couvrent le conteneur de 1700 px avec de la marge
 * pour la boucle, sans mesure préalable.
 */
const REPETITIONS = 8;

/**
 * Une question fréquente, animée au survol et à l'ouverture.
 *
 * Survol — inspiré de FlowingMenu (reactbits.dev) : une bande claire glisse
 * depuis le bord le plus proche du curseur (haut ou bas) et la question y
 * défile en boucle. Adapté au site :
 *
 * - le `<details>` natif reste la structure : ouverture au clic et au clavier,
 *   réponse présente dans la page pour Google. La bande ne couvre que la ligne
 *   de la question ;
 * - couleurs du site (`--light`, texte `--background`), séparateur ✦ du bandeau
 *   défilant à la place des images de l'original ;
 * - le « + » passe au-dessus de la bande, en sombre, et le texte défilant
 *   s'efface avant lui : on voit toujours que la ligne s'ouvre ;
 * - le défilement ne tourne que pendant le survol (l'original anime toutes les
 *   lignes en permanence) ;
 * - souris uniquement : rien au tactile, rien en mouvement réduit — la bande y
 *   est même masquée en CSS (`.faq-bande`).
 *
 * Ouverture — la réponse se déplie en hauteur, son filet se trace de haut en
 * bas (comme les filets du calendrier) et ses paragraphes glissent depuis la
 * gauche, avec les réglages des autres entrées du site (0,65 s, `power3.out`).
 * À la fermeture, le texte s'efface puis la hauteur se replie, et `open` n'est
 * retiré qu'à la fin. En mouvement réduit, le clic garde le comportement natif,
 * instantané. Sans JavaScript, le `<details>` s'ouvre de lui-même.
 *
 * Les passages entre `**` d'une réponse sont mis en valeur, comme dans les
 * bios (`BioParagraph`) ; une ligne vide sépare deux paragraphes.
 */
export function QuestionFluide({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);
  const bandeRef = useRef<HTMLDivElement>(null);
  const pisteRef = useRef<HTMLDivElement>(null);
  const reponseRef = useRef<HTMLDivElement>(null);
  const filetRef = useRef<HTMLSpanElement>(null);
  const texteRef = useRef<HTMLDivElement>(null);
  const defilement = useRef<gsap.core.Tween | null>(null);
  const survole = useRef(false);

  const paragraphes = answer
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  useEffect(
    () => () => {
      defilement.current?.kill();
      const cibles = [
        bandeRef.current,
        pisteRef.current,
        reponseRef.current,
        filetRef.current,
        ...(texteRef.current ? Array.from(texteRef.current.children) : []),
      ].filter(Boolean);
      if (cibles.length) gsap.killTweensOf(cibles);
    },
    [],
  );

  const mouvementReduit = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const animable = (event: PointerEvent<HTMLElement>) =>
    event.pointerType === "mouse" && !mouvementReduit();

  /** Bord le plus proche du curseur : au-dessus ou en dessous du milieu. */
  const parLeHaut = (event: PointerEvent<HTMLElement>) => {
    const boite = event.currentTarget.getBoundingClientRect();
    return event.clientY - boite.top < boite.height / 2;
  };

  const entrer = (event: PointerEvent<HTMLElement>) => {
    const bande = bandeRef.current;
    const piste = pisteRef.current;
    if (!bande || !piste || !animable(event)) return;
    survole.current = true;
    detailsRef.current?.setAttribute("data-survol", "");

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
    // `y: 0` : la position de départ est posée en CSS (`.faq-bande`), que GSAP
    // lirait sinon en pixels et ajouterait au pourcentage.
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
    detailsRef.current?.removeAttribute("data-survol");

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

  // Clic sur la question (Entrée ou Espace au clavier produisent le même
  // clic) : on reprend la main sur l'ouverture pour l'animer.
  const basculer = (event: MouseEvent<HTMLElement>) => {
    const details = detailsRef.current;
    const reponse = reponseRef.current;
    const filet = filetRef.current;
    const texte = texteRef.current;
    if (!details || !reponse || !filet || !texte || mouvementReduit()) return;
    event.preventDefault();
    const blocs = Array.from(texte.children);
    gsap.killTweensOf([reponse, filet, ...blocs]);

    const seFerme = details.hasAttribute("data-fermeture");
    if (!details.open || seFerme) {
      // Ouverture — y compris un nouveau clic pendant une fermeture, qui
      // repart de la hauteur atteinte.
      const depart = seFerme ? reponse.offsetHeight : 0;
      details.removeAttribute("data-fermeture");
      details.open = true;
      gsap.fromTo(
        reponse,
        { height: depart },
        {
          height: reponse.scrollHeight,
          duration: 0.5,
          ease: "power3.out",
          onComplete: () => {
            gsap.set(reponse, { clearProps: "height" });
          },
        },
      );
      gsap.fromTo(
        filet,
        { scaleY: 0 },
        {
          scaleY: 1,
          duration: 0.65,
          ease: "power3.out",
          delay: 0.05,
          clearProps: "transform",
        },
      );
      gsap.fromTo(
        blocs,
        { opacity: 0, x: -16 },
        {
          opacity: 1,
          x: 0,
          duration: 0.65,
          ease: "power3.out",
          delay: 0.12,
          stagger: 0.08,
          clearProps: "opacity,transform",
        },
      );
      return;
    }

    // Fermeture : `data-fermeture` fait tourner le « + » tout de suite, `open`
    // n'est retiré qu'une fois la hauteur repliée.
    details.setAttribute("data-fermeture", "");
    gsap.to(blocs, { opacity: 0, x: -8, duration: 0.2, ease: "power2.in" });
    gsap.to(filet, { scaleY: 0, duration: 0.3, ease: "power2.in" });
    gsap.fromTo(
      reponse,
      { height: reponse.offsetHeight },
      {
        height: 0,
        duration: 0.4,
        ease: "power3.inOut",
        onComplete: () => {
          details.open = false;
          details.removeAttribute("data-fermeture");
          gsap.set([reponse, filet, ...blocs], {
            clearProps: "height,opacity,transform",
          });
        },
      },
    );
  };

  return (
    <details ref={detailsRef} className="group border-b border-rule-faint">
      {/* `pr-4 sm:pr-6` : le « + » décollé du bord droit. La bande, en
          `absolute inset-0`, garde toute la largeur. */}
      <summary
        onPointerEnter={entrer}
        onPointerLeave={sortir}
        onClick={basculer}
        className="relative flex cursor-pointer list-none items-center justify-between gap-6 overflow-hidden py-5 pr-4 sm:pr-6 [&::-webkit-details-marker]:hidden"
      >
        <h3 className="text-base font-bold leading-snug sm:text-lg">
          {question}
        </h3>
        {/* Tourné quand la question est ouverte, sauf pendant sa fermeture
            animée : il revient dès le clic, sans attendre la fin du repli. */}
        <span
          aria-hidden
          className="relative z-20 shrink-0 text-2xl leading-none text-tertiary transition-[transform,color] duration-300 group-data-[survol]:text-background group-[[open]:not([data-fermeture])]:rotate-45"
        >
          +
        </span>

        {/* Bande décorative : la question reste lue une fois, dans le h3. */}
        <div
          ref={bandeRef}
          aria-hidden
          className="faq-bande pointer-events-none absolute inset-0 z-10 overflow-hidden bg-light"
        >
          {/* Masque en dégradé sur le texte seul (le fond de la bande reste
              plein) : le défilement s'efface avant la zone du « + ». Sans lui,
              les capitales passaient sous l'icône et la rendaient illisible.
              Léger fondu à gauche pour que le texte n'arrive pas coupé net. */}
          <div className="faq-bande-masque h-full">
            <div ref={pisteRef} className="flex h-full w-max items-center">
              {Array.from({ length: REPETITIONS }, (_, index) => (
                <span
                  key={index}
                  className="flex shrink-0 items-center gap-6 pr-6 text-base font-black uppercase leading-none whitespace-nowrap text-background sm:text-lg"
                >
                  {question}
                  <span className="opacity-40">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </summary>

      {/* Cadre de la hauteur animée. La réponse est décalée derrière un filet
          clair, en texte plus grand que les libellés : un bloc qui se
          distingue de la ligne de question au lieu de s'y coller. */}
      <div ref={reponseRef} className="overflow-hidden">
        <div className="relative mb-7 ml-1 max-w-190 pl-5 sm:ml-2 sm:pl-7">
          <span
            ref={filetRef}
            aria-hidden
            className="absolute top-1 bottom-1 left-0 w-px origin-top bg-light"
          />
          <div
            ref={texteRef}
            className="flex flex-col gap-3 text-base leading-relaxed text-secondary sm:text-lg"
          >
            {paragraphes.map((paragraphe) => (
              <BioParagraph key={paragraphe} text={paragraphe} />
            ))}
          </div>
        </div>
      </div>
    </details>
  );
}

"use client";

import { useEffect, useRef, type MouseEvent } from "react";
import { gsap } from "gsap";
import { BandeFluide, useBandeFluide } from "./BandeFluide";
import { BioParagraph } from "./BioText";

/**
 * Une question fréquente, animée au survol et à l'ouverture.
 *
 * Survol — la bande de `BandeFluide` (inspirée de FlowingMenu) glisse sur la
 * ligne de la question ; son texte, lui, reste immobile depuis le
 * 2026-09-22 (`defiler: false`, `repetitions={1}`) — une question longue
 * devenait dure à lire en défilant. Le `<details>` natif reste la structure :
 * ouverture au clic et au clavier, réponse présente dans la page pour
 * Google, bande limitée à la ligne de la question. Le « + » passe au-dessus
 * de la bande, en sombre : on voit toujours que la ligne s'ouvre.
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
  const reponseRef = useRef<HTMLDivElement>(null);
  const filetRef = useRef<HTMLSpanElement>(null);
  const texteRef = useRef<HTMLDivElement>(null);
  const { bandeRef, pisteRef, entrer, sortir } = useBandeFluide(
    detailsRef,
    undefined,
    { defiler: false },
  );

  const paragraphes = answer
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  useEffect(
    () => () => {
      const cibles = [
        reponseRef.current,
        filetRef.current,
        ...(texteRef.current ? Array.from(texteRef.current.children) : []),
      ].filter(Boolean);
      if (cibles.length) gsap.killTweensOf(cibles);
    },
    [],
  );

  // Clic sur la question (Entrée ou Espace au clavier produisent le même
  // clic) : on reprend la main sur l'ouverture pour l'animer.
  const basculer = (event: MouseEvent<HTMLElement>) => {
    const details = detailsRef.current;
    const reponse = reponseRef.current;
    const filet = filetRef.current;
    const texte = texteRef.current;
    if (
      !details ||
      !reponse ||
      !filet ||
      !texte ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
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

        <BandeFluide
          texte={question}
          bandeRef={bandeRef}
          pisteRef={pisteRef}
          repetitions={1}
        />
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

"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { gsap } from "gsap";
import type { GalleryItem } from "@/lib/types";

const mouvementReduit = () =>
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

/** Centre d'un rectangle moins celui d'un autre : le décalage du FLIP. */
const decalage = (depart: DOMRect, arrivee: DOMRect) => ({
  x: depart.left + depart.width / 2 - (arrivee.left + arrivee.width / 2),
  y: depart.top + depart.height / 2 - (arrivee.top + arrivee.height / 2),
  scale: depart.width / arrivee.width,
});

/**
 * Visionneuse de la galerie : au clic, la photo quitte la grille et vient au
 * centre de l'écran, le reste de la page passant sous un voile sombre et flou.
 *
 * Aucune maquette pour cette page. Demandé le 2026-11-12 : une photo entière
 * dans la grille reste petite sur téléphone, et rien ne permettait de la
 * regarder de près.
 *
 * - **Un `<dialog>` natif**, ouvert par `showModal()` : Échap ferme, le focus
 *   est retenu dans la visionneuse, le reste de la page devient inerte, et la
 *   couche supérieure passe au-dessus de tout — y compris de la nav et du
 *   grain — sans qu'aucun `z-index` n'ait à être inventé.
 * - **La photo glisse de sa vignette vers le centre** (technique du FLIP : on
 *   mesure le rectangle de départ, celui d'arrivée, et on joue l'écart à
 *   l'envers). La vignette et le cadre ont le même rapport, donc l'échelle est
 *   la même en largeur et en hauteur : rien n'est déformé.
 * - **La vignette déjà décodée sert d'aperçu** derrière la grande photo, le
 *   temps que celle-ci arrive : la même image en plus petit, agrandie, donc un
 *   flou qui se précise plutôt qu'un cadre vide.
 * - **Mouvement réduit** : la photo apparaît sans glisser, le voile sans
 *   fondu. Rien ne bouge, tout reste utilisable.
 * - **Sans JavaScript**, le bouton d'ouverture n'existe pas (`globals.css`,
 *   `@media (scripting: enabled)`) : la photo reste entière dans la grille, et
 *   aucun bouton sans effet ne s'annonce aux lecteurs d'écran.
 *
 * Le balisage de la grille reste rendu par le serveur (`Gallery`) : ce
 * composant l'enveloppe et écoute un seul clic pour toute la galerie, comme
 * `ProximityGlow` et `CalendrierAnimations` le font déjà.
 */
export function GalerieVisionneuse({
  items,
  children,
}: {
  items: GalleryItem[];
  children: ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);
  /** Adresse de la vignette déjà chargée, posée en aperçu derrière la photo. */
  const [apercu, setApercu] = useState<string | null>(null);

  const racineRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cadreRef = useRef<HTMLElement>(null);
  const declencheurRef = useRef<HTMLElement | null>(null);
  /** Rectangle du cadre sans transformation, mesuré à l'ouverture. */
  const arriveeRef = useRef<DOMRect | null>(null);

  // Un seul écouteur pour toute la grille : les boutons sont rendus par le
  // serveur, ils portent leur rang en attribut.
  useEffect(() => {
    const racine = racineRef.current;
    if (!racine) return undefined;

    const auClic = (event: Event) => {
      const cible = event.target as HTMLElement | null;
      const bouton = cible?.closest<HTMLElement>("[data-galerie-ouvrir]");
      if (!bouton) return;
      const rang = Number(bouton.dataset.galerieOuvrir);
      if (!Number.isInteger(rang) || !items[rang]) return;

      declencheurRef.current = bouton;
      const vignette = bouton.parentElement?.querySelector("img");
      setApercu(vignette?.currentSrc || null);
      setIndex(rang);
    };

    racine.addEventListener("click", auClic);
    return () => racine.removeEventListener("click", auClic);
  }, [items]);

  // Ouverture : on passe en couche supérieure, on bloque le défilement de la
  // page derrière, puis la photo rejoint le centre depuis sa vignette.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (index === null || !dialog) return undefined;

    if (!dialog.open) dialog.showModal();

    // `showModal()` ne bloque pas le défilement de la page derrière. On le
    // bloque, et on rend à la page la largeur de la barre de défilement qui
    // disparaît avec lui, pour que rien ne glisse sous le voile.
    const html = document.documentElement;
    const gouttiere = window.innerWidth - html.clientWidth;
    if (gouttiere > 0) {
      html.style.setProperty("--visionneuse-gouttiere", `${gouttiere}px`);
      html.dataset.visionneuse = "barre";
    } else {
      html.dataset.visionneuse = "ouverte";
    }

    const cadre = cadreRef.current;
    const depart = declencheurRef.current?.getBoundingClientRect();
    if (cadre && depart && depart.width > 0) {
      arriveeRef.current = cadre.getBoundingClientRect();
      if (!mouvementReduit()) {
        gsap.fromTo(cadre, decalage(depart, arriveeRef.current), {
          x: 0,
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: "power3.out",
        });
      }
    }

    return () => {
      if (cadre) gsap.killTweensOf(cadre);
      delete html.dataset.visionneuse;
      html.style.removeProperty("--visionneuse-gouttiere");
    };
  }, [index]);

  /** Retour à la grille : la photo repart vers sa vignette, puis on ferme. */
  const fermer = () => {
    const dialog = dialogRef.current;
    const cadre = cadreRef.current;
    const arrivee = arriveeRef.current;
    const depart = declencheurRef.current?.getBoundingClientRect();
    if (!dialog) return;

    if (
      !cadre ||
      !arrivee ||
      !depart ||
      depart.width === 0 ||
      mouvementReduit()
    ) {
      dialog.close();
      return;
    }

    // `data-fermeture` fait repartir le voile en sens inverse (cf. globals.css).
    dialog.setAttribute("data-fermeture", "");
    gsap.to(cadre, {
      ...decalage(depart, arrivee),
      duration: 0.4,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        dialog.removeAttribute("data-fermeture");
        dialog.close();
      },
    });
  };

  // Clic à côté de la photo : le voile ferme aussi, comme la touche Échap.
  const auClicDuFond = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === dialogRef.current) fermer();
  };

  const item = index === null ? undefined : items[index];

  return (
    <div ref={racineRef}>
      {children}
      {item &&
        createPortal(
          <dialog
            ref={dialogRef}
            className="visionneuse"
            aria-label={
              item.alt ? `Photo agrandie : ${item.alt}` : "Photo agrandie"
            }
            onClick={auClicDuFond}
            // Échap : on reprend la main pour que la photo retourne à sa
            // vignette au lieu de disparaître d'un coup.
            onCancel={(event) => {
              event.preventDefault();
              fermer();
            }}
            onClose={() => {
              declencheurRef.current?.focus({ preventScroll: true });
              setIndex(null);
              setApercu(null);
            }}
          >
            <button
              type="button"
              onClick={fermer}
              className="pill pill-outline visionneuse-retour"
            >
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 5l-7 7 7 7" />
              </svg>
              Retour
            </button>
            <figure
              ref={cadreRef}
              className="visionneuse-cadre"
              // Le rapport du fichier : c'est lui qui dimensionne le cadre,
              // sans attendre que la photo soit chargée (cf. globals.css).
              style={
                {
                  "--ratio": item.image.width / item.image.height,
                } as CSSProperties
              }
            >
              {apercu && (
                <span
                  aria-hidden="true"
                  className="visionneuse-apercu"
                  style={{ backgroundImage: `url("${apercu}")` }}
                />
              )}
              <Image
                src={item.image.src}
                alt={item.alt}
                width={item.image.width}
                height={item.image.height}
                quality={90}
                // Le cadre est limité par la hauteur de l'écran : une photo
                // paysage occupe toute la largeur, une photo verticale moins
                // de la moitié sur ordinateur.
                sizes={
                  item.image.width > item.image.height
                    ? "100vw"
                    : "(min-width: 1024px) 45vw, 100vw"
                }
                className="visionneuse-photo"
              />
            </figure>
          </dialog>,
          document.body,
        )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Course horizontale minimale, en pixels, pour qu'un geste compte. */
const DISTANCE = 70;
/** Le geste doit être franchement horizontal, sinon c'est un défilement. */
const RAPPORT = 1.8;
/** Au-delà, ce n'est plus un balayage mais un déplacement lent du doigt. */
const DUREE_MAX = 800;

/**
 * Balayage horizontal sur une zone, au doigt uniquement.
 *
 * Le tunnel de réservation s'en sert pour aller d'une étape à l'autre sans
 * viser les boutons, qui restent la commande principale : un geste ne remplace
 * jamais une validation, il déclenche exactement la même chose qu'un bouton.
 *
 * Volontairement limité au tactile (`pointerType`) : à la souris, un cliquer-
 * glisser sert à sélectionner du texte, et au trackpad le balayage horizontal
 * est déjà le retour arrière du navigateur. Les gestes partis d'un champ de
 * saisie sont ignorés, pour ne pas casser la sélection de texte.
 *
 * Renvoie une ref de rappel, à poser sur la zone : la zone du tunnel n'existe
 * qu'une fois l'état relu depuis la session, et une `RefObject` ne préviendrait
 * pas de son arrivée — les écouteurs n'auraient jamais été posés.
 */
export function useBalayage({
  surRetour,
  surAvance,
}: {
  surRetour: () => void;
  surAvance: () => void;
}) {
  const [zone, setZone] = useState<HTMLElement | null>(null);

  // Les rappels changent à chaque rendu ; les écouteurs, eux, restent posés.
  // La mise à jour passe par un effet : écrire dans une ref pendant le rendu
  // est interdit (React peut abandonner puis rejouer un rendu).
  const rappels = useRef({ surRetour, surAvance });
  useEffect(() => {
    rappels.current = { surRetour, surAvance };
  }, [surRetour, surAvance]);

  useEffect(() => {
    if (!zone) return undefined;

    let depart: { x: number; y: number; temps: number } | null = null;
    const oublier = () => {
      depart = null;
    };

    const auDebut = (event: PointerEvent) => {
      depart = null;
      if (event.pointerType !== "touch") return;
      if ((event.target as HTMLElement).closest("input, textarea, select")) return;
      depart = { x: event.clientX, y: event.clientY, temps: event.timeStamp };
    };

    const aLaFin = (event: PointerEvent) => {
      if (!depart) return;
      const dx = event.clientX - depart.x;
      const dy = event.clientY - depart.y;
      const duree = event.timeStamp - depart.temps;
      depart = null;

      if (duree > DUREE_MAX) return;
      if (Math.abs(dx) < DISTANCE || Math.abs(dx) < Math.abs(dy) * RAPPORT) return;

      if (dx > 0) rappels.current.surRetour();
      else rappels.current.surAvance();
    };

    zone.addEventListener("pointerdown", auDebut, { passive: true });
    zone.addEventListener("pointerup", aLaFin, { passive: true });
    zone.addEventListener("pointercancel", oublier, { passive: true });

    return () => {
      zone.removeEventListener("pointerdown", auDebut);
      zone.removeEventListener("pointerup", aLaFin);
      zone.removeEventListener("pointercancel", oublier);
    };
  }, [zone]);

  return useCallback((element: HTMLElement | null) => setZone(element), []);
}

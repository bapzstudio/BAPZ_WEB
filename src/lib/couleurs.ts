// Couleurs proposées pour distinguer un événement (stage, workshop, soirée…)
// dans le planning, demandées par la cliente le 2026-10-24. Seul endroit qui
// les définit : le champ « Couleur de la carte » des cours en tire sa liste, et
// les cartes leur teinte (`--couleur-rgb`, cf. `globals.css`).
//
// Aucune maquette : chaque teinte garde la clarté et la saturation du bleu du
// halo (`--glow`, oklch 0,772 / 0,115) et n'en change que la teinte. Elles
// pèsent donc toutes pareil sur le fond, et l'horaire écrit dans la couleur
// tient au moins 7:1 sur la carte teintée (7,8:1 sur une carte #1d1d1d nue).
// Pas de jaune : à cette clarté il tournait au kaki. Pas
// de rouge non plus, réservé aux erreurs de saisie.

import type { CSSProperties } from "react";

export const COULEURS_COURS = {
  bleu: { label: "Bleu", rgb: "143 180 255" }, // = --glow-rgb
  violet: { label: "Violet", rgb: "192 164 244" },
  rose: { label: "Rose", rgb: "237 150 191" },
  orange: { label: "Orange", rgb: "240 159 112" },
  vert: { label: "Vert", rgb: "125 202 141" },
} as const;

export type CouleurCours = keyof typeof COULEURS_COURS;

export const estCouleurCours = (valeur: unknown): valeur is CouleurCours =>
  typeof valeur === "string" && Object.hasOwn(COULEURS_COURS, valeur);

/**
 * Attributs à poser sur une carte de cours : `data-couleur` pour les styles de
 * `globals.css`, la teinte dans `--couleur-rgb`. Rien pour un cours habituel,
 * dont la carte reste strictement celle de la maquette.
 */
export const attributsCouleur = (couleur?: CouleurCours) =>
  couleur
    ? {
        "data-couleur": couleur,
        style: {
          "--couleur-rgb": COULEURS_COURS[couleur].rgb,
        } as CSSProperties,
      }
    : {};

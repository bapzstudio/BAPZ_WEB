// Largeur des mots d'un titre en Archivo 900 capitales, sans les afficher :
// sert à choisir côté serveur une taille de titre où aucun mot ne déborde,
// quel que soit le texte saisi dans l'admin (cf. Hero).
//
// Chasses mesurées au navigateur le 2026-11-23, en em, dans le h1 du hero
// (Archivo 900, capitales, `tracking-[-0.02em]` compris). Les lettres absentes
// du tableau valent 0,746, la chasse la plus courante.
const CHASSES: Record<string, number> = {
  I: 0.338,
  "-": 0.301,
  ",": 0.301,
  ".": 0.301,
  "'": 0.246,
  "’": 0.246,
  E: 0.69,
  P: 0.69,
  S: 0.69,
  T: 0.69,
  Z: 0.69,
  F: 0.635,
  J: 0.635,
  L: 0.635,
  G: 0.801,
  H: 0.801,
  K: 0.801,
  N: 0.801,
  O: 0.801,
  Q: 0.801,
  U: 0.801,
  M: 0.94,
  W: 0.968,
};
const CHASSE_COURANTE = 0.746;
// Chiffres, symboles, emoji : plus larges qu'une lettre moyenne, par prudence.
const CHASSE_INCONNUE = 0.85;

const chasse = (caractere: string) => {
  if (CHASSES[caractere] !== undefined) return CHASSES[caractere];
  return /\p{Lu}/u.test(caractere) ? CHASSE_COURANTE : CHASSE_INCONNUE;
};

/**
 * Largeur, en em, du mot le plus long du titre : un mot ne se coupe pas, c'est
 * lui qui borne la taille. Le titre est affiché en capitales, les accents ne
 * changent pas la chasse (É vaut E).
 */
export function chasseDuMotLePlusLong(titre: string): number {
  return Math.max(
    0,
    ...titre
      .split(/\s+/)
      .filter(Boolean)
      .map((mot) =>
        [...mot.toUpperCase().normalize("NFD").replace(/\p{M}/gu, "")]
          .map(chasse)
          .reduce((somme, largeur) => somme + largeur, 0),
      ),
  );
}

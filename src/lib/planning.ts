// Calculs sur le planning de la semaine, indépendants de l'affichage.
import { minutes, ordreJour } from "./reservation/format";
import type { Course } from "./types";

const MINUTES_PAR_JOUR = 24 * 60;
const MINUTES_PAR_SEMAINE = 7 * MINUTES_PAR_JOUR;

/**
 * Position d'un instant dans la semaine, en minutes depuis lundi 00h00, à
 * l'heure de Paris : le serveur tourne en UTC, mais « jeudi 19h00 » s'entend
 * à l'heure du studio.
 */
export function minuteDeLaSemaine(instant: Date): number {
  const parties = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(instant);
  const valeur = (type: string) =>
    parties.find((p) => p.type === type)?.value ?? "";

  const jour = valeur("weekday");
  const index = ordreJour(jour.charAt(0).toUpperCase() + jour.slice(1));
  return (
    index * MINUTES_PAR_JOUR +
    Number(valeur("hour")) * 60 +
    Number(valeur("minute"))
  );
}

/** Le jour de Paris d'un instant, au format « 2026-11-15 ». */
export function dateDeParis(instant: Date): string {
  // `en-CA` écrit les dates en AAAA-MM-JJ.
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

/** Le jour de la semaine à Paris, tel que l'écrit le champ Jour : « Samedi ». */
export function jourDeParis(instant: Date): string {
  const jour = new Intl.DateTimeFormat("fr-FR", {
    timeZone: "Europe/Paris",
    weekday: "long",
  }).format(instant);
  return jour.charAt(0).toUpperCase() + jour.slice(1);
}

/** Un événement daté reste affiché jusqu'à la fin de son jour, puis disparaît. */
export const estAVenir = (cours: Course, maintenant: Date) =>
  !cours.date || cours.date >= dateDeParis(maintenant);

/** Jours entre deux dates « AAAA-MM-JJ ». */
const ecartEnJours = (de: string, a: string) =>
  Math.round(
    (Date.parse(`${a}T00:00:00Z`) - Date.parse(`${de}T00:00:00Z`)) / 864e5,
  );

/**
 * Les cours qui commencent le plus tôt à partir de maintenant, en bouclant sur
 * la semaine suivante. Un cours déjà commencé passe à la semaine d'après. Un
 * événement daté n'a lieu qu'une fois : il compte à sa vraie date, et sort de
 * la liste une fois commencé.
 */
export function prochainsCours(
  cours: Course[],
  maintenant: Date,
  nombre = 3,
): Course[] {
  const repere = minuteDeLaSemaine(maintenant);
  const aujourdhui = dateDeParis(maintenant);

  return cours
    .filter((c) => ordreJour(c.dayOfWeek) < 7)
    .map((c) => {
      if (c.date) {
        return {
          cours: c,
          attente:
            ecartEnJours(aujourdhui, c.date) * MINUTES_PAR_JOUR +
            minutes(c.startTime) -
            (repere % MINUTES_PAR_JOUR),
        };
      }
      const debut =
        ordreJour(c.dayOfWeek) * MINUTES_PAR_JOUR + minutes(c.startTime);
      return {
        cours: c,
        attente: (debut - repere + MINUTES_PAR_SEMAINE) % MINUTES_PAR_SEMAINE,
      };
    })
    .filter(({ attente }) => attente >= 0)
    .sort((a, b) => a.attente - b.attente)
    .slice(0, nombre)
    .map(({ cours: c }) => c);
}

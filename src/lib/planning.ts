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
  const valeur = (type: string) => parties.find((p) => p.type === type)?.value ?? "";

  const jour = valeur("weekday");
  const index = ordreJour(jour.charAt(0).toUpperCase() + jour.slice(1));
  return index * MINUTES_PAR_JOUR + Number(valeur("hour")) * 60 + Number(valeur("minute"));
}

/**
 * Les cours qui commencent le plus tôt à partir de maintenant, en bouclant sur
 * la semaine suivante. Un cours déjà commencé passe à la semaine d'après.
 */
export function prochainsCours(cours: Course[], maintenant: Date, nombre = 3): Course[] {
  const repere = minuteDeLaSemaine(maintenant);

  return cours
    .filter((c) => ordreJour(c.dayOfWeek) < 7)
    .map((c) => {
      const debut = ordreJour(c.dayOfWeek) * MINUTES_PAR_JOUR + minutes(c.startTime);
      return { cours: c, attente: (debut - repere + MINUTES_PAR_SEMAINE) % MINUTES_PAR_SEMAINE };
    })
    .sort((a, b) => a.attente - b.attente)
    .slice(0, nombre)
    .map(({ cours: c }) => c);
}

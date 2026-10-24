/** Ordre des jours, pour ranger les cours dans la semaine. */
export const JOURS = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

export const ordreJour = (jour: string) => {
  const index = JOURS.indexOf(jour);
  return index === -1 ? JOURS.length : index;
};

/** « 19:00 » -> nombre de minutes depuis minuit, pour trier. */
export const minutes = (heure: string) => {
  const [h, m] = heure.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

/** « 19:00 » -> « 19h00 », comme sur le calendrier. */
export const formaterHeure = (heure: string) => heure.replace(":", "h");

/** « 2026-11-15 » -> « 15 nov. ». La date d'un événement est un jour de Paris. */
export const formaterDate = (date: string) =>
  new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));

/**
 * Le jour d'un cours : « Samedi » pour un cours de chaque semaine,
 * « Samedi 15 nov. » pour un événement daté.
 */
export const jourDuCours = (cours: { dayOfWeek: string; date?: string }) =>
  cours.date
    ? `${cours.dayOfWeek} ${formaterDate(cours.date)}`
    : cours.dayOfWeek;

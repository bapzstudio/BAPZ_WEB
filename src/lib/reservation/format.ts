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

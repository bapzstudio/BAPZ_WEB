// Les formes que consomment les composants. Elles ignorent tout de Payload :
// changer de CMS ne toucherait que `queries.ts`.

export interface Teacher {
  _id: string;
  /** Fin de l'adresse de sa page : /profs/<slug>. */
  slug: string;
  name: string;
  /** Discipline affichée à droite du nom sur la page Profs (ex : "Heels"). */
  discipline?: string;
  /**
   * Un élément par paragraphe. Les passages entre `**` sont mis en avant
   * (blanc + gras), comme sur la maquette.
   */
  bio?: string[];
  photo?: { src: string; width: number; height: number };
}

export interface Course {
  _id: string;
  title: string;
  level?: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  teacher?: Teacher;
  /** Salle affichée en haut à droite de la carte du calendrier (ex : "Studio A"). */
  room?: string;
  isPrivateCourse?: boolean;
  /** Identifiant stable dans les liens de réservation (ex : heels-mardi-19-00). */
  slug?: string;
}

export interface PricingPlan {
  _id: string;
  /** Identifiant stable dans les liens de réservation (ex : carte-10-cours). */
  slug?: string;
  /** Petit libellé en mono au-dessus du prix (ex : "LE + POPULAIRE"). */
  label?: string;
  name: string;
  price: string;
  /** Suffixe accolé au prix (ex : "/ an"). */
  period?: string;
  description?: string;
  /**
   * Nombre de cours que la formule comprend. Sert à afficher un prix ramené au
   * cours, seul moyen de comparer une carte et un abonnement.
   */
  sessionsIncluded?: number;
  /** Regroupe les formules en sections sur la page Tarifs. */
  group: "carte" | "abonnement" | "essai";
  highlighted?: boolean;
}

export interface Room {
  _id: string;
  name: string;
  photo?: { src: string; width: number; height: number };
  /** Tarif avec sa devise (ex : "30 €"). Absent : « Sur demande ». */
  price?: string;
  /** Suffixe accolé au tarif (ex : "/ heure"). */
  period?: string;
  /** Capacité en nombre de personnes. */
  capacity?: number;
  /** Surface en m². */
  area?: number;
  equipment?: string[];
  /** Renseigné tant que la salle n'est pas ouverte (ex : "2027"). */
  availableFrom?: string;
  /** Identifiant stable dans les liens de réservation (ex : salle-a). */
  slug?: string;
}

/* ---- Parcours de réservation ---- */

export interface OptionCours {
  slug: string;
  titre: string;
  /** Jour, horaire et salle : « Mardi · 19h00 - 20h30 · Studio A ». */
  detail: string;
  /** Niveau et prof, s'ils sont renseignés. */
  precision?: string;
}

export interface OptionFormule {
  slug: string;
  titre: string;
  /** Prix et période : « 310 € / an ». */
  prix: string;
  groupe: PricingPlan["group"];
}

export interface OptionSalle {
  slug: string;
  titre: string;
  /** Surface et capacité, si elles sont renseignées. */
  detail?: string;
}

/** Ce que le parcours de réservation propose, identifié par `slug`. */
export interface CatalogueReservation {
  cours: OptionCours[];
  formules: OptionFormule[];
  salles: OptionSalle[];
}

/** Demande enregistrée, mise en forme pour les mails. */
export interface ResumeDemande {
  /** Objet du mail : « [Essai] Heels - Mardi 19h00 - Julie ». */
  objet: string;
  lignes: { label: string; valeur: string }[];
  message?: string;
  prenom: string;
  email: string;
}

export interface SiteSettings {
  /** Peut contenir des retours à la ligne (\n) pour caler la coupe du titre. */
  heroTitle: string;
  heroSubtitle: string;
  address: string;
  city?: string;
  phone?: string;
  /** Adresse publique du studio (page Contact, pages légales). */
  email?: string;
  /** Informations légales, affichées par /mentions-legales et /confidentialite. */
  legalName?: string;
  legalForm?: string;
  siret?: string;
  publisher?: string;
  /** Nom, adresse et téléphone de l'hébergeur, un élément par ligne. */
  host?: string;
  /** Créneaux de la page Contact, en texte libre (« Lundi - Vendredi », « 17h - 22h »). */
  openingHours?: { days: string; hours: string }[];
  instagramHandle?: string;
  /** Mots-clés du bandeau défilant. */
  marqueeItems?: string[];
  logo?: { src: string; width: number; height: number };
}

export interface GalleryItem {
  _id: string;
  image: { src: string; width: number; height: number };
  alt: string;
}

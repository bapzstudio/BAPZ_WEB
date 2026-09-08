// Formes calquées sur les schémas Sanity (studio/schemaTypes) pour que le
// branchement au CMS réel ne demande pas de retoucher les composants.

export interface Teacher {
  _id: string;
  name: string;
  /** Discipline affichée à droite du nom sur la page Profs (ex : "Heels"). */
  discipline?: string;
  /**
   * Un élément par paragraphe. Les passages entre `**` sont mis en avant
   * (blanc + gras), comme sur la maquette. Deviendra du Portable Text une fois
   * Sanity branché.
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
}

export interface PricingPlan {
  _id: string;
  /** Petit libellé en mono au-dessus du prix (ex : "LE + POPULAIRE"). */
  label?: string;
  name: string;
  price: string;
  /** Suffixe accolé au prix (ex : "/ an"). */
  period?: string;
  description?: string;
  /** Regroupe les formules en sections sur la page Tarifs. */
  group: "carte" | "abonnement" | "essai";
  highlighted?: boolean;
}

export interface Room {
  _id: string;
  name: string;
  /** Capacité en nombre de personnes. */
  capacity?: number;
  /** Surface en m². */
  area?: number;
  equipment?: string[];
  /** Renseigné tant que la salle n'est pas ouverte (ex : "2027"). */
  availableFrom?: string;
}

export interface SiteSettings {
  /** Peut contenir des retours à la ligne (\n) pour caler la coupe du titre. */
  heroTitle: string;
  heroSubtitle: string;
  address: string;
  city?: string;
  instagramHandle?: string;
  /** Libellé du CTA "cours d'essai" (ex : "Cours d'essai - 10 €"). */
  trialLabel?: string;
  /** Mots-clés du bandeau défilant. */
  marqueeItems?: string[];
  logo?: { src: string; width: number; height: number };
}

export interface GalleryItem {
  _id: string;
  image: { src: string; width: number; height: number };
  alt: string;
}

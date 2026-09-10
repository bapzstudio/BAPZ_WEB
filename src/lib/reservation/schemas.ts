import { z } from "zod";

/*
 * Schémas du parcours de réservation, partagés par les étapes (validation
 * immédiate dans le navigateur) et par l'action serveur (validation qui fait
 * foi). Même découpage que le tunnel de devis de chuttt.ch.
 */

export const TYPES_DEMANDE = ["essai", "inscription", "location", "prive"] as const;
export const typeDemandeSchema = z.enum(TYPES_DEMANDE);
export type TypeDemande = z.infer<typeof typeDemandeSchema>;

export const TYPE_LABELS: Record<
  TypeDemande,
  { label: string; court: string; aide: string }
> = {
  essai: {
    label: "Essayer un cours",
    court: "Essai",
    aide: "Découvrir un cours avant de t'engager",
  },
  inscription: {
    label: "M'inscrire",
    court: "Inscription",
    aide: "Carte de cours ou abonnement à l'année",
  },
  location: {
    label: "Louer une salle",
    court: "Location",
    aide: "Réserver une de nos salles",
  },
  prive: {
    label: "Prendre un cours privé",
    court: "Cours privé",
    aide: "Un cours particulier, sur mesure",
  },
};

export const NIVEAUX = ["debutant", "intermediaire", "avance", "ne-sais-pas"] as const;
export const niveauSchema = z.enum(NIVEAUX);
export type Niveau = z.infer<typeof niveauSchema>;

export const NIVEAU_LABELS: Record<Niveau, string> = {
  debutant: "Débutant·e",
  intermediaire: "Intermédiaire",
  avance: "Avancé·e",
  "ne-sais-pas": "Je ne sais pas",
};

// Étape 3 - détails
export const detailsSchema = z.object({
  niveau: niveauSchema.optional(),
  dateSouhaitee: z.string().trim().max(100, "100 caractères au maximum").optional(),
  personnes: z
    .string()
    .trim()
    .regex(/^\d{0,3}$/, "Un nombre de personnes, en chiffres")
    .optional(),
  message: z.string().trim().max(2000, "2000 caractères au maximum").optional(),
});
export type DetailsData = z.infer<typeof detailsSchema>;

// Étape 4 - coordonnées
export const coordonneesSchema = z.object({
  prenom: z
    .string()
    .trim()
    .min(1, "Indique ton prénom")
    .max(80, "80 caractères au maximum"),
  email: z
    .string()
    .trim()
    .email("Cette adresse e-mail semble invalide")
    .max(200, "200 caractères au maximum"),
  telephone: z
    .string()
    .trim()
    .max(30, "30 caractères au maximum")
    .regex(/^[+\d\s().-]*$/, "Ce numéro semble invalide")
    .optional(),
});

/** Le formulaire porte en plus le champ leurre de l'anti-spam. */
export const coordonneesFormSchema = coordonneesSchema.extend({
  website: z.string().optional(),
});
export type CoordonneesData = z.infer<typeof coordonneesFormSchema>;

/**
 * Demande complète, revalidée côté serveur. Cours, formules et salles n'y sont
 * que des identifiants de lien : l'enregistrement vérifie qu'ils existent
 * vraiment avant d'écrire quoi que ce soit.
 */
export const demandeSchema = z
  .object({
    type: typeDemandeSchema,
    cours: z.string().max(120).optional(),
    formule: z.string().max(120).optional(),
    salle: z.string().max(120).optional(),
    ...detailsSchema.shape,
    ...coordonneesSchema.shape,
  })
  .superRefine((demande, ctx) => {
    if (demande.type === "essai" && !demande.cours) {
      ctx.addIssue({ code: "custom", path: ["cours"], message: "Choisis un cours" });
    }
    if (demande.type === "inscription" && !demande.formule) {
      ctx.addIssue({ code: "custom", path: ["formule"], message: "Choisis une formule" });
    }
    if (demande.type === "location" && !demande.salle) {
      ctx.addIssue({ code: "custom", path: ["salle"], message: "Choisis une salle" });
    }
  });
export type DemandeData = z.infer<typeof demandeSchema>;

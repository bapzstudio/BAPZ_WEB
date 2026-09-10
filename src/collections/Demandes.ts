import type { CollectionConfig } from "payload";
import { NIVEAUX, NIVEAU_LABELS, TYPES_DEMANDE, TYPE_LABELS } from "../lib/reservation/schemas";

export const Demandes: CollectionConfig = {
  slug: "demandes",
  labels: { singular: "Demande", plural: "Demandes" },
  // Les plus récentes en haut : c'est la liste qu'on ouvre pour voir ce qui
  // vient d'arriver.
  defaultSort: "-createdAt",
  admin: {
    useAsTitle: "resume",
    group: "Suivi",
    defaultColumns: ["resume", "type", "statut", "createdAt"],
    listSearchableFields: ["resume", "prenom", "email"],
    description:
      "Demandes envoyées depuis le site (essai, inscription, location, cours privé). Rien n'est réservé automatiquement : chaque demande attend ta réponse. Tu reçois aussi chaque demande par mail.",
  },
  // Création réservée au serveur. Le parcours enregistre les demandes par
  // l'API locale de Payload, qui ne passe pas par ces règles ; ouvrir `create`
  // au public laisserait écrire directement dans cette collection via
  // /api/demandes, en contournant la validation et l'anti-spam.
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  // Les champs propres à un type ne s'affichent que pour lui : une demande de
  // location n'a ni cours ni niveau, un essai n'a pas de date souhaitée.
  fields: [
    {
      name: "resume",
      type: "text",
      label: "Résumé",
      admin: {
        readOnly: true,
        description: "Rempli automatiquement à l'envoi. Sert de titre dans la liste.",
      },
    },
    {
      name: "type",
      type: "select",
      label: "Type de demande",
      required: true,
      options: TYPES_DEMANDE.map((value) => ({ value, label: TYPE_LABELS[value].label })),
    },
    {
      name: "cours",
      type: "relationship",
      relationTo: "courses",
      label: "Cours",
      admin: {
        condition: (data) => data?.type === "essai",
        description: "Le cours que la personne veut essayer.",
      },
    },
    {
      name: "formule",
      type: "relationship",
      relationTo: "pricing-plans",
      label: "Formule",
      admin: {
        condition: (data) => data?.type === "inscription",
        description: "La formule choisie sur la page Tarifs.",
      },
    },
    {
      name: "salle",
      type: "relationship",
      relationTo: "rooms",
      label: "Salle",
      admin: { condition: (data) => data?.type === "location" },
    },
    {
      name: "niveau",
      type: "select",
      label: "Niveau",
      options: NIVEAUX.map((value) => ({ value, label: NIVEAU_LABELS[value] })),
      admin: {
        condition: (data) => data?.type !== "location",
        description: "Déclaré par la personne elle-même.",
      },
    },
    {
      name: "dateSouhaitee",
      type: "text",
      label: "Date souhaitée",
      admin: {
        condition: (data) => data?.type === "location",
        description: "En texte libre, tel que saisi sur le site.",
      },
    },
    {
      name: "personnes",
      type: "number",
      label: "Nombre de personnes",
      admin: { condition: (data) => data?.type === "location" },
    },
    { name: "message", type: "textarea", label: "Message" },
    { name: "prenom", type: "text", label: "Prénom", required: true },
    {
      name: "email",
      type: "email",
      label: "E-mail",
      required: true,
      admin: {
        description:
          "Pour répondre : répondre au mail de notification reçu écrit directement à cette adresse.",
      },
    },
    {
      name: "telephone",
      type: "text",
      label: "Téléphone",
      admin: { description: "Facultatif sur le site : peut être vide." },
    },
    {
      name: "statut",
      type: "select",
      label: "Statut",
      required: true,
      defaultValue: "nouvelle",
      options: [
        { label: "Nouvelle", value: "nouvelle" },
        { label: "En cours", value: "en-cours" },
        { label: "Confirmée", value: "confirmee" },
        { label: "Sans suite", value: "sans-suite" },
      ],
      admin: {
        position: "sidebar",
        description:
          "À faire avancer au fil du traitement. Changer le statut ne prévient pas la personne : la réponse se fait par mail ou par téléphone.",
      },
    },
    {
      name: "notes",
      type: "textarea",
      label: "Notes internes",
      admin: {
        position: "sidebar",
        description: "Visibles seulement ici, jamais envoyées au visiteur.",
      },
    },
  ],
};

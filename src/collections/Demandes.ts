import type { CollectionConfig } from "payload";
import { NIVEAUX, NIVEAU_LABELS, TYPES_DEMANDE, TYPE_LABELS } from "../lib/reservation/schemas";

export const Demandes: CollectionConfig = {
  slug: "demandes",
  labels: { singular: "Demande", plural: "Demandes" },
  admin: {
    useAsTitle: "resume",
    defaultColumns: ["resume", "statut", "createdAt"],
    listSearchableFields: ["resume", "prenom", "email"],
    description:
      "Demandes envoyées depuis le parcours de réservation du site. Rien n'est réservé automatiquement : chaque demande attend ta réponse.",
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
  fields: [
    {
      name: "resume",
      type: "text",
      label: "Résumé",
      admin: { readOnly: true },
    },
    {
      name: "type",
      type: "select",
      label: "Type de demande",
      required: true,
      options: TYPES_DEMANDE.map((value) => ({ value, label: TYPE_LABELS[value].label })),
    },
    { name: "cours", type: "relationship", relationTo: "courses", label: "Cours" },
    { name: "formule", type: "relationship", relationTo: "pricing-plans", label: "Formule" },
    { name: "salle", type: "relationship", relationTo: "rooms", label: "Salle" },
    {
      name: "niveau",
      type: "select",
      label: "Niveau",
      options: NIVEAUX.map((value) => ({ value, label: NIVEAU_LABELS[value] })),
    },
    { name: "dateSouhaitee", type: "text", label: "Date souhaitée" },
    { name: "personnes", type: "number", label: "Nombre de personnes" },
    { name: "message", type: "textarea", label: "Message" },
    { name: "prenom", type: "text", label: "Prénom", required: true },
    { name: "email", type: "email", label: "E-mail", required: true },
    { name: "telephone", type: "text", label: "Téléphone" },
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
      admin: { position: "sidebar" },
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

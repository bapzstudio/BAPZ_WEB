// Contenu d'amorçage : ce que `pnpm seed` écrit dans Payload.
//
// C'est aussi la vraie migration du projet : la base SQLite de développement
// n'est pas transférable vers Postgres, seul ce fichier l'est. Il doit donc
// rester à jour tant que la cliente n'a pas commencé à saisir son contenu.
//
// Contenu réel reçu de la cliente : voir /content/cours.md dans le repo BAPZ.
// Le reste est encore placeholder (marqué TODO) en attendant les infos
// manquantes.

import type {
  Course,
  GalleryItem,
  PricingPlan,
  Room,
  SiteSettings,
  Teacher,
} from "../lib/types";

// ATTENTION : le planning ci-dessous reproduit la maquette CALENDRIER, dont le
// contenu est fictif (fourni par la graphiste). Il CONTREDIT les informations
// envoyées par la cliente, conservées dans /content/cours.md :
//   - elle place "Street Enfant" le MARDI 18h-19h, la maquette le met JEUDI ;
//   - elle n'a jamais mentionné Intervenant, Contemporain Lyrical, Yogalates
//     ni Training libre, ni les profs Ilan, Alessia et Hannane.
// À arbitrer avec elle avant la mise en ligne / la saisie dans Sanity.
// Photos extraites de maquette/PROFS.png : les fichiers d'origine de ce
// shooting portrait ne sont pas dans /content (qui ne contient que 4 photos de
// danse en pied, différentes). À remplacer par les originaux haute définition
// dès que la cliente les envoie.
export const teachers: Teacher[] = [
  {
    _id: "lena-bapz",
    slug: "lena-bapz",
    name: "Léna Bapz",
    discipline: "Heels",
    photo: { src: "/images/profs/lena.jpg", width: 1086, height: 944 },
    bio: [
      "Léna danse depuis 13 ans et s'est formée **entre Paris, Strasbourg, Athènes et les plus grands studios de Los Angeles.**",
      "Danseuse et chorégraphe, elle évolue entre créations, scènes et tournages de clips, et a notamment dansé aux côtés d'artistes tels que **Franglish, Jyheuair, TRZ, Jeadyjay ou encore Maïa.**",
      "Aujourd'hui, elle enseigne le **Heels** à travers un travail mêlant technique, féminité, performance, attitude et confiance en soi.",
    ],
  },
  {
    _id: "lara",
    slug: "lara",
    name: "Lara",
    discipline: "Street Dance",
    photo: { src: "/images/profs/lara.jpg", width: 1086, height: 944 },
    bio: [
      "Lara commence la danse à l'âge de 3 ans avec le classique. Elle se forme ensuite au **Street Jazz au conservatoire**, où elle poursuit sa formation jusqu'à ses 18 ans.",
      "Elle se dirige ensuite vers **le Hip-Hop et le Heels**, deux disciplines qui viennent enrichir son univers artistique et développer sa polyvalence.",
      "Elle s'apprête également à partir à Los Angeles pour suivre une formation intensive auprès de grands noms de la danse comme **Dae Dae ou Hamilton Evans.**",
      "Aujourd'hui, Lara enseigne la **Street Dance** aux jeunes danseurs avec l'envie de leur transmettre des bases solides, afin de les accompagner vers un véritable niveau d'exigence et de former de futurs danseurs polyvalents et complets.",
    ],
  },
  {
    _id: "alessia",
    slug: "alessia",
    name: "Alessia",
    discipline: "Contemporain Lyrical",
    photo: { src: "/images/profs/alessia.jpg", width: 1086, height: 944 },
    // La maquette ne met aucun passage en gras dans cette bio.
    bio: [
      "Alessia danse depuis l'âge de 3 ans. À 9 ans, elle rejoint Sabrina Lonis, où elle se forme en Lyrical et Street Dance. Elle intègre ensuite sa compagnie pré-professionnelle, participe à de nombreux concours nationaux et européens et se produit régulièrement sur scène lors de représentations.",
      "Elle enrichit également son parcours avec le classique, le heels et des stages auprès de chorégraphes internationaux tels que Derek Mitchell et Rebecca Davis.",
      "Aujourd'hui, Alessia enseigne le Lyrical Contemporain, un style où la technique, l'émotion et l'interprétation se rejoignent. Ses cours sont construits autour de chorégraphies expressives pour développer la musicalité, la présence scénique et la personnalité artistique de chaque danseur.",
    ],
  },
  // Intervenant et prof de Yogalates : présents au calendrier, mais absents de
  // la maquette Profs (pas de portrait ni de bio fournis).
  { _id: "ilan", slug: "ilan", name: "Ilan" },
  { _id: "hannane", slug: "hannane", name: "Hannane" },
];

// Recherche par identifiant plutôt que par position : l'ordre du tableau suit
// l'affichage de la page Profs et peut changer sans casser le calendrier.
const prof = (id: string) => teachers.find((t) => t._id === id);
const lena = prof("lena-bapz");
const lara = prof("lara");
const ilan = prof("ilan");
const alessia = prof("alessia");
const hannane = prof("hannane");

// `level` sert de ligne libre sous le titre : niveau, tranche d'âge, nom
// d'intervenant ou modalité de réservation selon les cas (cf. maquette).
export const courses: Course[] = [
  {
    _id: "intervenant-lundi",
    title: "Intervenant",
    level: "Wish Upon My Art",
    dayOfWeek: "Lundi",
    startTime: "16:30",
    endTime: "20:30",
    teacher: ilan,
    room: "Studio A",
  },
  {
    _id: "heels-mardi",
    title: "Heels",
    level: "Intermédiaire",
    dayOfWeek: "Mardi",
    startTime: "19:00",
    endTime: "20:30",
    teacher: lena,
    room: "Studio A",
  },
  {
    _id: "intervenant-mercredi",
    title: "Intervenant",
    level: "Wish Upon My Art",
    dayOfWeek: "Mercredi",
    startTime: "10:00",
    endTime: "12:00",
    teacher: ilan,
    room: "Studio A",
  },
  {
    _id: "contemporain-lyrical",
    title: "Contemporain Lyrical",
    level: "Intermédiaire",
    dayOfWeek: "Mercredi",
    startTime: "19:00",
    endTime: "20:30",
    teacher: alessia,
    room: "Studio A",
  },
  {
    _id: "street-enfants",
    title: "Street Enfants",
    level: "10-14 ans",
    dayOfWeek: "Jeudi",
    startTime: "18:00",
    endTime: "19:00",
    teacher: lara,
    room: "Studio A",
  },
  {
    _id: "commercial-hi-hop",
    title: "Commercial / Hi-Hop",
    // La maquette écrit "Tous niveayx" : coquille corrigée.
    level: "Tous niveaux",
    dayOfWeek: "Jeudi",
    startTime: "19:00",
    endTime: "20:30",
    teacher: lena,
    room: "Studio A",
  },
  {
    _id: "yogalates",
    title: "Yogalates",
    level: "Tous niveaux",
    dayOfWeek: "Vendredi",
    startTime: "19:00",
    endTime: "20:00",
    teacher: hannane,
    room: "Studio A",
  },
  {
    _id: "training-libre",
    title: "Training libre",
    level: "Sous demande de réservation",
    dayOfWeek: "Samedi",
    startTime: "8:00",
    endTime: "22:00",
    room: "Studio A",
  },
];

// Tarifs réels transmis par la cliente le 2026-09-07. Ils remplacent ceux de
// maquette/TARIFS.png, qui étaient des valeurs de démonstration (15 €, 130 €,
// 75 €/mois) et qui prévoyaient un seul abonnement mensuel là où l'offre réelle
// en compte quatre, à l'année.
export const pricingPlans: PricingPlan[] = [
  {
    _id: "unite",
    group: "carte",
    label: "À l'unité",
    name: "Cours unique",
    price: "17 €",
    description: "Un cours, sans engagement.",
  },
  {
    _id: "carte-10",
    group: "carte",
    label: "Le + populaire",
    name: "Carte 10 cours",
    price: "160 €",
    description: "Soit 16 € le cours.",
    highlighted: true,
  },
  {
    _id: "abo-1",
    group: "abonnement",
    label: "1 cours / semaine",
    name: "Abonnement",
    price: "310 €",
    period: "/ an",
  },
  {
    _id: "abo-2",
    group: "abonnement",
    label: "2 cours / semaine",
    name: "Abonnement",
    price: "450 €",
    period: "/ an",
  },
  {
    _id: "abo-3",
    group: "abonnement",
    label: "3 cours / semaine",
    name: "Abonnement",
    price: "570 €",
    period: "/ an",
  },
  {
    _id: "abo-illimite",
    group: "abonnement",
    label: "Accès illimité",
    name: "Abonnement",
    price: "670 €",
    period: "/ an",
    description: "Hors stages, workshops et événements spéciaux.",
    highlighted: true,
  },
  {
    // TODO: seul tarif non confirmé par la cliente. Il vient de la maquette,
    // dont tous les autres prix se sont révélés faux. Il est aussi utilisé par
    // le bouton d'accueil (`siteSettings.trialLabel`) : les deux sont à
    // corriger ensemble.
    _id: "essai",
    group: "essai",
    label: "Découverte",
    name: "Premier cours d'essai",
    price: "10 €",
    description: "Viens tester avant de t'engager.",
  },
];

// Salle A en service ; salle B annoncée pour 2027, caractéristiques encore
// inconnues côté cliente.
export const rooms: Room[] = [
  {
    _id: "salle-a",
    name: "Salle A",
    capacity: 50,
    area: 120,
    equipment: [
      "Climatisation",
      "Vestiaires",
      "Lumière + LED de couleur",
      "Sonorisation Bluetooth",
    ],
  },
  {
    _id: "salle-b",
    name: "Salle B",
    capacity: 17,
    area: 43,
    availableFrom: "2027",
  },
];

export const siteSettings: SiteSettings = {
  // TODO: accroche définitive à valider avec la cliente.
  heroTitle: "Heels, Hip-Hop\nCommercial",
  heroSubtitle:
    "Des cours qui font transpirer, des profs qui font progresser.\nTous niveaux, toutes énergies, pas besoin d'expérience, juste l'envie",
  address: "2A rue du Jardin d'Écosse, Ars-Laquenexy",
  city: "Metz",
  instagramHandle: "@bapzstudio",
  // TODO: tarif du cours d'essai à confirmer avec la cliente.
  trialLabel: "Cours d'essai - 10 €",
  marqueeItems: ["Heels", "Commercial", "Metz", "@bapzstudio"],
  // Logo réel reçu de la cliente (dossier /content, fond transparent).
  logo: { src: "/images/logo/bapz-logo.png", width: 600, height: 600 },
};

// Photos reçues du 2e/3e shoot (voir /content). Recadrées/réorientées dans
// web/public/images/gallery - pas d'attribution à un prof précis, on ne sait
// pas qui est qui sur ces photos, à confirmer avec la cliente si besoin.
export const galleryItems: GalleryItem[] = [
  {
    _id: "shoot-1",
    image: { src: "/images/gallery/shoot-1.jpg", width: 1600, height: 2400 },
    alt: "Shooting photo BAPZ Studio",
  },
  {
    _id: "shoot-2",
    image: { src: "/images/gallery/shoot-2.jpg", width: 1600, height: 2400 },
    alt: "Shooting photo BAPZ Studio",
  },
  {
    _id: "shoot-3",
    image: { src: "/images/gallery/shoot-3.jpg", width: 1600, height: 2400 },
    alt: "Shooting photo BAPZ Studio",
  },
  {
    _id: "shoot-4",
    image: { src: "/images/gallery/shoot-4.jpg", width: 1600, height: 2400 },
    alt: "Shooting photo BAPZ Studio",
  },
];

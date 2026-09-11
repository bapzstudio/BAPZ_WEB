// Contenu d'amorçage : ce que `pnpm seed` écrit dans Payload. Le seed vide les
// collections avant de réinsérer : réservé au développement.
//
// Contenu reçu de la cliente : /content/cours.md et
// /content/demande-cliente-2026-09-01.md. Ce qu'elle n'a pas fourni est repris
// de la maquette ; les valeurs encore à confirmer sont marquées « À confirmer ».

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
// À arbitrer avec elle avant la mise en ligne.
// Portraits tirés des originaux du shooting : voir « Portraits des profs » dans
// CLAUDE.md.
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
    // Validité reprise de la maquette TARIFS du 2026-09-10.
    description: "Valable 4 mois, pour tous les cours.",
    // La ligne « soit 16 € le cours » est desormais calculee, plus ecrite.
    sessionsIncluded: 10,
    highlighted: true,
  },
  {
    _id: "abo-1",
    group: "abonnement",
    name: "1 cours / semaine",
    price: "310 €",
    period: "/ an",
  },
  {
    _id: "abo-2",
    group: "abonnement",
    name: "2 cours / semaine",
    price: "450 €",
    period: "/ an",
  },
  {
    _id: "abo-3",
    group: "abonnement",
    name: "3 cours / semaine",
    price: "570 €",
    period: "/ an",
  },
  {
    _id: "abo-illimite",
    group: "abonnement",
    name: "Accès illimité",
    price: "670 €",
    period: "/ an",
    description:
      "Tous les cours, en illimité. Hors stages, workshops et événements spéciaux.",
    highlighted: true,
  },
  {
    // À confirmer : seul tarif non transmis par la cliente. Il vient de la maquette,
    // dont tous les autres prix se sont révélés faux. Son prix est aussi repris
    // par le bouton « Cours d'essai » de l'accueil.
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
  // À confirmer : accroche reprise de la maquette.
  heroTitle: "Heels, Hip-Hop\nCommercial",
  heroSubtitle:
    "Des cours qui font transpirer, des profs qui font progresser.\nTous niveaux, toutes énergies, pas besoin d'expérience, juste l'envie",
  address: "2A rue du Jardin d'Écosse, Ars-Laquenexy",
  city: "Metz",
  // Compte confirmé le 2026-09-10 : instagram.com/bapz.studio (avec un point).
  instagramHandle: "@bapz.studio",
  marqueeItems: ["Heels", "Commercial", "Metz", "@bapz.studio"],
  // Logo réel reçu de la cliente (dossier /content, fond transparent).
  // Variante « V2 » (le mot sur sa planète), rognée en carré de 512 px : c'est
  // celle de la maquette, et la seule lisible dans le rond de 40 px de la nav.
  logo: { src: "/images/logo/bapz-logo.png", width: 512, height: 512 },
};

// Photos reçues des 2e et 3e shoots, recadrées dans src/seed/assets/images/gallery.
// Personne n'y est identifié. Non injectées par le seed : la cliente choisit
// elle-même ses photos de galerie depuis l'admin.
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

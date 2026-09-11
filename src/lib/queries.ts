// Couche d'accès aux données : seul endroit du site qui connaît le CMS.
// Les composants consomment les types de `types.ts` et ignorent tout de Payload.
//
// L'API locale de Payload interroge la base directement, sans passer par HTTP :
// pas de latence réseau, et les pages restent générées statiquement au build.
import { getPayload } from "payload";
import config from "@payload-config";

import type {
  CatalogueReservation,
  Course,
  GalleryItem,
  PricingPlan,
  ResumeDemande,
  Room,
  SiteSettings,
  Teacher,
} from "./types";
import { formaterHeure, minutes, ordreJour } from "./reservation/format";
import {
  NIVEAU_LABELS,
  TYPE_LABELS,
  type DemandeData,
} from "./reservation/schemas";

const payload = async () => getPayload({ config });

/** Une image Payload -> la forme attendue par next/image. */
type PayloadUpload = {
  url?: string | null;
  width?: number | null;
  height?: number | null;
  alt?: string | null;
};

const toImage = (media: unknown) => {
  const m = media as PayloadUpload | null;
  if (!m?.url || !m.width || !m.height) return undefined;
  return { src: m.url, width: m.width, height: m.height };
};

/** Payload renvoie les listes imbriquées sous forme d'objets : on aplatit. */
const toStrings = (rows: unknown, key: string): string[] =>
  Array.isArray(rows)
    ? rows
        .map((row) => (row as Record<string, unknown>)?.[key])
        .filter((v): v is string => typeof v === "string" && v.length > 0)
    : [];

const toTeacher = (input: unknown): Teacher => {
  const doc = input as Record<string, unknown>;
  return {
    _id: String(doc.id),
    slug: String(doc.slug ?? ""),
    name: String(doc.name ?? ""),
    discipline: (doc.discipline as string) || undefined,
    bio: toStrings(doc.bio, "text").length
      ? toStrings(doc.bio, "text")
      : undefined,
    photo: toImage(doc.photo),
  };
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const doc = await (
    await payload()
  ).findGlobal({ slug: "site-settings", depth: 1 });

  return {
    heroTitle: String(doc.heroTitle ?? ""),
    heroSubtitle: String(doc.heroSubtitle ?? ""),
    address: String(doc.address ?? ""),
    city: (doc.city as string) || undefined,
    phone: (doc.phone as string) || undefined,
    email: (doc.email as string) || undefined,
    legalName: (doc.legalName as string) || undefined,
    legalForm: (doc.legalForm as string) || undefined,
    siret: (doc.siret as string) || undefined,
    publisher: (doc.publisher as string) || undefined,
    host: (doc.host as string) || undefined,
    openingHours: Array.isArray(doc.openingHours)
      ? doc.openingHours
          .map((row) => ({ days: String(row?.days ?? ""), hours: String(row?.hours ?? "") }))
          .filter((row) => row.days && row.hours)
      : [],
    instagramHandle: (doc.instagramHandle as string) || undefined,
    trialLabel: (doc.trialLabel as string) || undefined,
    marqueeItems: toStrings(doc.marqueeItems, "text"),
    logo: toImage(doc.logo),
  };
}

const toCourse = (input: unknown): Course => {
  const doc = input as Record<string, unknown>;
  return {
    _id: String(doc.id),
    slug: (doc.slug as string) || undefined,
    title: String(doc.title ?? ""),
    level: (doc.level as string) || undefined,
    dayOfWeek: String(doc.dayOfWeek ?? ""),
    startTime: String(doc.startTime ?? ""),
    endTime: String(doc.endTime ?? ""),
    room: (doc.room as string) || undefined,
    // `depth: 1` remplace la référence par le document complet.
    teacher:
      doc.teacher && typeof doc.teacher === "object"
        ? toTeacher(doc.teacher)
        : undefined,
  };
};

export async function getCourses(): Promise<Course[]> {
  const { docs } = await (
    await payload()
  ).find({ collection: "courses", limit: 100, sort: "order", depth: 1 });

  return docs.map(toCourse);
}

/**
 * Un prof a une page dédiée aux mêmes conditions qu'il apparaît sur `/profs` :
 * il lui faut un portrait et une bio. Une règle unique, donc pas de page
 * fantôme accessible par URL mais listée nulle part.
 */
const aUneFiche = (input: unknown) => {
  const doc = input as Record<string, unknown>;
  return (
    Boolean(doc.slug) &&
    Boolean(doc.photo) &&
    Array.isArray(doc.bio) &&
    doc.bio.length > 0
  );
};

/** Alimente `generateStaticParams` de `/profs/[slug]`. */
export async function getTeacherSlugs(): Promise<string[]> {
  const { docs } = await (
    await payload()
  ).find({ collection: "teachers", limit: 100, depth: 0 });

  return docs
    .filter(aUneFiche)
    .map((doc) => String(doc.slug));
}

export async function getTeacherBySlug(
  slug: string
): Promise<{ teacher: Teacher; courses: Course[] } | null> {
  const client = await payload();

  const { docs } = await client.find({
    collection: "teachers",
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 1,
  });

  const doc = docs[0];
  if (!doc || !aUneFiche(doc)) return null;

  const { docs: courses } = await client.find({
    collection: "courses",
    where: { teacher: { equals: doc.id } },
    limit: 100,
    sort: "order",
    depth: 1,
  });

  return { teacher: toTeacher(doc), courses: courses.map(toCourse) };
}

export async function getTeachers(): Promise<Teacher[]> {
  const { docs } = await (
    await payload()
  ).find({ collection: "teachers", limit: 100, sort: "order", depth: 1 });

  return docs.map(toTeacher);
}

export async function getPricingPlans(): Promise<PricingPlan[]> {
  const { docs } = await (
    await payload()
  ).find({ collection: "pricing-plans", limit: 100, sort: "order" });

  return docs.map((doc) => ({
    _id: String(doc.id),
    slug: (doc.slug as string) || undefined,
    label: (doc.label as string) || undefined,
    name: String(doc.name ?? ""),
    price: String(doc.price ?? ""),
    period: (doc.period as string) || undefined,
    description: (doc.description as string) || undefined,
    sessionsIncluded: (doc.sessionsIncluded as number) || undefined,
    group: doc.group as PricingPlan["group"],
    highlighted: Boolean(doc.highlighted),
  }));
}

export async function getRooms(): Promise<Room[]> {
  const { docs } = await (
    await payload()
  ).find({ collection: "rooms", limit: 100, sort: "order", depth: 1 });

  return docs.map((doc) => ({
    _id: String(doc.id),
    slug: (doc.slug as string) || undefined,
    name: String(doc.name ?? ""),
    photo: toImage(doc.photo),
    price: (doc.price as string) || undefined,
    period: (doc.period as string) || undefined,
    capacity: (doc.capacity as number) ?? undefined,
    area: (doc.area as number) ?? undefined,
    equipment: toStrings(doc.equipment, "item"),
    availableFrom: (doc.availableFrom as string) || undefined,
  }));
}

export async function getGalleryItems(): Promise<GalleryItem[]> {
  const { docs } = await (
    await payload()
  ).find({ collection: "gallery", limit: 100, sort: "order", depth: 1 });

  return docs.flatMap((doc) => {
    const image = toImage(doc.image);
    if (!image) return [];
    return [{ _id: String(doc.id), image, alt: String(doc.alt ?? "") }];
  });
}

/**
 * Catalogue du parcours de réservation : cours, formules et salles réduits à
 * ce que les étapes affichent, identifiés par leur `slug`.
 */
export async function getReservationCatalog(): Promise<CatalogueReservation> {
  const [cours, formules, salles] = await Promise.all([
    getCourses(),
    getPricingPlans(),
    getRooms(),
  ]);

  return {
    cours: cours
      .filter((c) => c.slug)
      .sort(
        (a, b) =>
          ordreJour(a.dayOfWeek) - ordreJour(b.dayOfWeek) ||
          minutes(a.startTime) - minutes(b.startTime)
      )
      .map((c) => ({
        slug: c.slug as string,
        titre: c.title,
        detail: [
          c.dayOfWeek,
          `${formaterHeure(c.startTime)} - ${formaterHeure(c.endTime)}`,
          c.room,
        ]
          .filter(Boolean)
          .join(" · "),
        precision: [c.level, c.teacher?.name].filter(Boolean).join(" · ") || undefined,
      })),
    // Le cours d'essai n'est pas une formule d'inscription : il a son propre
    // type de demande.
    formules: formules
      .filter((f) => f.slug && f.group !== "essai")
      .map((f) => ({
        slug: f.slug as string,
        titre: f.name,
        prix: f.period ? `${f.price} ${f.period}` : f.price,
        groupe: f.group,
      })),
    // Une salle pas encore ouverte n'est pas réservable, comme sur la page
    // Tarifs.
    salles: salles
      .filter((s) => s.slug && !s.availableFrom)
      .map((s) => ({
        slug: s.slug as string,
        titre: s.name,
        detail:
          [
            s.area ? `${s.area} m²` : "",
            s.capacity ? `jusqu'à ${s.capacity} personnes` : "",
          ]
            .filter(Boolean)
            .join(" · ") || undefined,
      })),
  };
}

/**
 * Enregistre une demande du parcours de réservation — seule écriture publique
 * du site.
 *
 * Cours, formules et salles arrivent sous forme d'identifiants de lien et sont
 * résolus ici. Seul celui qui correspond au type de demande est retenu ; s'il
 * est introuvable — lien forgé, ou contenu supprimé entre-temps — rien n'est
 * écrit et la fonction renvoie `null`.
 */
export async function enregistrerDemande(
  demande: DemandeData
): Promise<ResumeDemande | null> {
  const client = await payload();

  const slugCours = demande.type === "essai" ? demande.cours : undefined;
  const slugFormule = demande.type === "inscription" ? demande.formule : undefined;
  const slugSalle = demande.type === "location" ? demande.salle : undefined;

  const [cours, formule, salle] = await Promise.all([
    slugCours
      ? client
          .find({ collection: "courses", where: { slug: { equals: slugCours } }, limit: 1, depth: 1 })
          .then((r) => r.docs[0])
      : undefined,
    slugFormule
      ? client
          .find({ collection: "pricing-plans", where: { slug: { equals: slugFormule } }, limit: 1 })
          .then((r) => r.docs[0])
      : undefined,
    slugSalle
      ? client
          .find({ collection: "rooms", where: { slug: { equals: slugSalle } }, limit: 1 })
          .then((r) => r.docs[0])
      : undefined,
  ]);

  if ((slugCours && !cours) || (slugFormule && !formule) || (slugSalle && !salle)) {
    return null;
  }

  const coursLu = cours ? toCourse(cours) : undefined;
  let choix: { label: string; valeur: string } | undefined;
  if (coursLu) {
    choix = {
      label: "Cours",
      valeur: `${coursLu.title} - ${coursLu.dayOfWeek} ${formaterHeure(coursLu.startTime)}`,
    };
  } else if (formule) {
    choix = { label: "Formule", valeur: `${formule.name} - ${formule.price}` };
  } else if (salle) {
    choix = { label: "Salle", valeur: salle.name };
  }

  // Objet du mail : trié d'un coup d'œil dans la boîte de la cliente.
  const objet = `[${TYPE_LABELS[demande.type].court}] ${[choix?.valeur, demande.prenom]
    .filter(Boolean)
    .join(" - ")}`;

  const lignes: { label: string; valeur: string }[] = [
    { label: "Demande", valeur: TYPE_LABELS[demande.type].label },
  ];
  if (choix) lignes.push(choix);
  if (demande.niveau) lignes.push({ label: "Niveau", valeur: NIVEAU_LABELS[demande.niveau] });
  if (demande.dateSouhaitee) {
    lignes.push({ label: "Date souhaitée", valeur: demande.dateSouhaitee });
  }
  if (demande.personnes) lignes.push({ label: "Personnes", valeur: demande.personnes });
  lignes.push({ label: "Prénom", valeur: demande.prenom });
  lignes.push({ label: "E-mail", valeur: demande.email });
  if (demande.telephone) lignes.push({ label: "Téléphone", valeur: demande.telephone });

  await client.create({
    collection: "demandes",
    data: {
      resume: objet,
      type: demande.type,
      cours: cours?.id,
      formule: formule?.id,
      salle: salle?.id,
      niveau: demande.niveau,
      dateSouhaitee: demande.dateSouhaitee || undefined,
      personnes: demande.personnes ? Number(demande.personnes) : undefined,
      message: demande.message || undefined,
      prenom: demande.prenom,
      email: demande.email,
      telephone: demande.telephone || undefined,
      statut: "nouvelle",
    },
  });

  return {
    objet,
    lignes,
    message: demande.message || undefined,
    prenom: demande.prenom,
    email: demande.email,
  };
}

/** Nombre de demandes envoyées depuis cette adresse sur la période donnée. */
export async function compterDemandesRecentes(email: string, periodeMs: number): Promise<number> {
  const { totalDocs } = await (await payload()).count({
    collection: "demandes",
    where: {
      and: [
        { email: { equals: email } },
        { createdAt: { greater_than: new Date(Date.now() - periodeMs).toISOString() } },
      ],
    },
  });
  return totalDocs;
}

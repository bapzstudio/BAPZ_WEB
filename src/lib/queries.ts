// Couche d'accès aux données : seul endroit du site qui connaît le CMS.
// Les composants consomment les types de `types.ts` et ignorent tout de Payload.
//
// L'API locale de Payload interroge la base directement, sans passer par HTTP :
// pas de latence réseau, et les pages restent générées statiquement au build.
import { getPayload } from "payload";
import config from "@payload-config";

import type {
  Course,
  GalleryItem,
  PricingPlan,
  Room,
  SiteSettings,
  Teacher,
} from "./types";

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
    label: (doc.label as string) || undefined,
    name: String(doc.name ?? ""),
    price: String(doc.price ?? ""),
    period: (doc.period as string) || undefined,
    description: (doc.description as string) || undefined,
    group: doc.group as PricingPlan["group"],
    highlighted: Boolean(doc.highlighted),
  }));
}

export async function getRooms(): Promise<Room[]> {
  const { docs } = await (
    await payload()
  ).find({ collection: "rooms", limit: 100, sort: "order" });

  return docs.map((doc) => ({
    _id: String(doc.id),
    name: String(doc.name ?? ""),
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

/**
 * Injecte dans Payload le contenu construit à partir des maquettes.
 *
 * Lancer avec :  pnpm seed
 *
 * Le script est idempotent : il vide les collections avant de réinsérer, on
 * peut donc le rejouer sans accumuler de doublons. À n'utiliser qu'en
 * développement — il effacerait les saisies de la cliente en production.
 */
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import config from "@payload-config";

import type { Course as CourseDoc } from "@/payload-types";

import {
  courses,
  galleryItems,
  pricingPlans,
  rooms,
  siteSettings,
  teachers,
} from "./content";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(dirname, "../../public");

const seed = async () => {
  const payload = await getPayload({ config });

  // --- table rase ------------------------------------------------------
  for (const collection of [
    "courses",
    "teachers",
    "pricing-plans",
    "rooms",
    "gallery",
    "media",
  ] as const) {
    await payload.delete({ collection, where: {} });
  }
  payload.logger.info("Collections vidées.");

  /** Téléverse un fichier de public/ dans la médiathèque. */
  const upload = async (relativePath: string, alt: string) => {
    const doc = await payload.create({
      collection: "media",
      data: { alt },
      filePath: path.join(publicDir, relativePath),
    });
    return doc.id;
  };

  // --- médias ----------------------------------------------------------
  const logoId = siteSettings.logo
    ? await upload("images/logo/bapz-logo.png", "Logo BAPZ Studio")
    : undefined;

  // --- profs -----------------------------------------------------------
  const teacherIds = new Map<string, number>();
  for (const [index, teacher] of teachers.entries()) {
    const photoId = teacher.photo
      ? await upload(
          teacher.photo.src.replace(/^\//, ""),
          `Portrait de ${teacher.name}`
        )
      : undefined;

    const doc = await payload.create({
      collection: "teachers",
      data: {
        name: teacher.name,
        slug: teacher.slug,
        discipline: teacher.discipline,
        photo: photoId,
        bio: teacher.bio?.map((text) => ({ text })),
        order: index,
      },
    });
    teacherIds.set(teacher._id, doc.id);
  }
  payload.logger.info(`${teachers.length} profs créés.`);

  // --- cours -----------------------------------------------------------
  for (const [index, course] of courses.entries()) {
    await payload.create({
      collection: "courses",
      data: {
        title: course.title,
        level: course.level,
        // `types.ts` type le jour comme une simple chaîne, la collection en
        // fait une liste fermée : le contenu de `content.ts` est déjà écrit
        // avec les sept valeurs attendues.
        dayOfWeek: course.dayOfWeek as CourseDoc["dayOfWeek"],
        startTime: course.startTime,
        endTime: course.endTime,
        room: course.room,
        teacher: course.teacher
          ? teacherIds.get(course.teacher._id)
          : undefined,
        order: index,
      },
    });
  }
  payload.logger.info(`${courses.length} cours créés.`);

  // --- tarifs ----------------------------------------------------------
  for (const [index, plan] of pricingPlans.entries()) {
    await payload.create({
      collection: "pricing-plans",
      data: {
        group: plan.group,
        label: plan.label,
        name: plan.name,
        price: plan.price,
        period: plan.period,
        sessionsIncluded: plan.sessionsIncluded,
        description: plan.description,
        highlighted: plan.highlighted ?? false,
        order: index,
      },
    });
  }
  payload.logger.info(`${pricingPlans.length} tarifs créés.`);

  // --- salles ----------------------------------------------------------
  for (const [index, room] of rooms.entries()) {
    await payload.create({
      collection: "rooms",
      data: {
        name: room.name,
        photo: room.photo
          ? await upload(room.photo.src.replace(/^\//, ""), room.name)
          : undefined,
        price: room.price,
        period: room.period,
        capacity: room.capacity,
        area: room.area,
        equipment: room.equipment?.map((item) => ({ item })),
        availableFrom: room.availableFrom,
        order: index,
      },
    });
  }
  payload.logger.info(`${rooms.length} salles créées.`);

  // --- galerie ---------------------------------------------------------
  // Volontairement laissée vide : les photos de galerie ont été retirées du
  // site en attendant la fin du projet (cf. page /galerie).
  payload.logger.info(
    `Galerie ignorée (${galleryItems.length} entrées en attente).`
  );

  // --- réglages du site ------------------------------------------------
  await payload.updateGlobal({
    slug: "site-settings",
    data: {
      heroTitle: siteSettings.heroTitle,
      heroSubtitle: siteSettings.heroSubtitle,
      address: siteSettings.address,
      city: siteSettings.city,
      instagramHandle: siteSettings.instagramHandle,
      trialLabel: siteSettings.trialLabel,
      marqueeItems: siteSettings.marqueeItems?.map((text) => ({ text })),
      logo: logoId,
    },
  });
  payload.logger.info("Réglages du site enregistrés.");

  payload.logger.info("Injection terminée.");
  process.exit(0);
};

await seed();

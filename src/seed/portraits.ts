/**
 * Remplace les portraits des profs dans la médiathèque, sans rien effacer.
 *
 * Lancer avec :  pnpm seed:portraits confirmer
 *
 * `pnpm seed` vide les collections avant de réinsérer : pour un simple
 * recadrage de photo, il ferait perdre tout ce que la cliente a saisi. Ce
 * script-ci ne touche qu'au fichier des médias déjà rattachés aux profs —
 * les fiches, les cours et les réglages ne bougent pas.
 *
 * Sans l'argument `confirmer`, il se contente de dire ce qu'il remplacerait.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getPayload } from "payload";
import config from "@payload-config";

import { teachers } from "./content";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const assetsDir = path.resolve(dirname, "assets");

const remplacer = async () => {
  const confirme = process.argv.includes("confirmer");
  const payload = await getPayload({ config });

  let hote = "inconnue";
  try {
    hote = new URL(process.env.DATABASE_URL ?? "").hostname;
  } catch {
    // Adresse illisible : on garde « inconnue ».
  }
  payload.logger.info(`Base visée : ${hote}`);

  for (const teacher of teachers) {
    if (!teacher.photo) continue;

    const { docs } = await payload.find({
      collection: "teachers",
      where: { slug: { equals: teacher.slug } },
      depth: 1,
      limit: 1,
    });
    const fiche = docs[0];
    if (!fiche) {
      payload.logger.warn(`${teacher.name} : aucune fiche, ignorée.`);
      continue;
    }
    // `depth: 1` : la photo arrive peuplée, sauf si le champ est vide.
    const media = typeof fiche.photo === "object" ? fiche.photo : null;
    if (!media) {
      payload.logger.warn(`${teacher.name} : aucune photo rattachée, ignorée.`);
      continue;
    }

    const fichier = path.join(assetsDir, teacher.photo.src.replace(/^\//, ""));
    const poids = fs.statSync(fichier).size;
    // Un téléversement identique consommerait le quota UploadThing pour rien.
    // Deux JPEG différents de même poids à l'octet près : on n'y croit pas.
    if (media.filesize === poids) {
      payload.logger.info(`${teacher.name} : portrait inchangé, ignoré.`);
      continue;
    }

    if (!confirme) {
      payload.logger.info(
        `${teacher.name} : média ${media.id} (${media.filename}) serait remplacé par ${fichier}`,
      );
      continue;
    }

    await payload.update({
      collection: "media",
      id: media.id,
      data: {},
      filePath: fichier,
    });
    payload.logger.info(`${teacher.name} : portrait remplacé.`);
  }

  if (!confirme) {
    payload.logger.info("\nRien n'a été modifié. Pour confirmer : pnpm seed:portraits confirmer");
  }

  process.exit(0);
};

await remplacer();

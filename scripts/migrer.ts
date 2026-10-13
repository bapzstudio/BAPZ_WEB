/**
 * Applique les migrations en attente, au déploiement (script `vercel-build`).
 *
 * Lancer avec :  pnpm migrer
 *
 * Pourquoi pas `payload migrate` directement : si la base a déjà servi à un
 * `pnpm dev`, Payload l'a marquée « poussée en mode dev » (une ligne de
 * `payload_migrations` au lot -1) et `payload migrate` pose alors une question
 * oui/non. Sans terminal — un build Vercel — la commande quitte en silence avec
 * le code 0 SANS RIEN MIGRER : le build continue, et le site part avec un code
 * qui lit des colonnes absentes de la base.
 *
 * Ce script lève donc la marque avant de migrer, puis vérifie que toutes les
 * migrations sont enregistrées, et fait échouer le build sinon. Il ne retire
 * que la marque : aucune donnée du site n'est touchée, et un prochain
 * `pnpm dev` sur cette base la reposerait.
 */
import { getPayload, type Migration } from "payload";
import { sql } from "@payloadcms/db-postgres";
import config from "@payload-config";

import { migrations } from "@/migrations";

const migrer = async () => {
  // Même réglage que `payload migrate` : sans lui, Payload démarré hors
  // production pousserait le schéma lui-même et reposerait la marque.
  process.env.PAYLOAD_MIGRATING = "true";

  const payload = await getPayload({ config });

  const marque = await payload.db.drizzle.execute(
    sql`DELETE FROM "payload_migrations" WHERE "batch" = -1 RETURNING "id"`,
  );
  if (marque.rows.length > 0) {
    payload.logger.info(
      "Marque « poussée en mode dev » retirée : la base a déjà servi à un pnpm dev.",
    );
  }

  // Les fichiers générés typent leurs arguments plus finement que Payload ne
  // les déclare (`unknown`) : la conversion est sans risque.
  await payload.db.migrate({
    migrations: migrations as unknown as Migration[],
  });

  // Garde-fou final : un échec silencieux de la migration ne doit jamais
  // laisser passer le build.
  const { docs } = await payload.find({
    collection: "payload-migrations",
    limit: 0,
  });
  const enregistrees = new Set(docs.map((doc) => doc.name));
  const manquantes = migrations
    .map((migration) => migration.name)
    .filter((nom) => !enregistrees.has(nom));
  if (manquantes.length > 0) {
    throw new Error(`Migrations non appliquées : ${manquantes.join(", ")}`);
  }

  payload.logger.info(
    `Base à jour : ${migrations.length} migrations appliquées.`,
  );
  // La connexion à la base garde le processus ouvert : on le ferme nous-mêmes.
  process.exit(0);
};

try {
  await migrer();
} catch (erreur) {
  console.error("Échec de la migration :", erreur);
  process.exit(1);
}

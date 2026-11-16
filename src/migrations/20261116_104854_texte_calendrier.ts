import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Texte au-dessus du planning de `/cours`.
 *
 * Même contenu que `src/seed/content.ts` : le seed sert aux bases de
 * développement, cette migration à celles qui tournent déjà, où personne ne
 * peut lancer de commande.
 */
const TEXTE = [
  "Le planning ci-dessous est une semaine type : les cours reviennent aux " +
    "mêmes horaires chaque semaine. On y danse le heels, le commercial et le " +
    "hip-hop, et le contemporain lyrical. Le studio ouvre aussi des créneaux " +
    "de training libre, sur demande, pour répéter ou travailler seul.",
  "Chaque cours affiche son niveau : si tu débutes, vise ceux marqués " +
    "débutant ou tous niveaux, les autres demandent quelques bases. Clique " +
    "sur un cours pour ouvrir la demande de réservation — tu peux commencer " +
    "par un cours d'essai avant de choisir une formule. Les stages et " +
    "événements ponctuels apparaissent à leur date, dans un cadre coloré " +
    "portant le libellé « Événement ».",
].join('\n\n')

// `IF NOT EXISTS` / `IF EXISTS` comme le veut la règle du projet : en
// développement Payload pousse le schéma directement en base, donc la colonne
// existe déjà quand la migration arrive, et un `ADD COLUMN` nu échouerait sur
// « column already exists ». Sans effet sur la production.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "schedule_intro" varchar;`)

  // Le texte n'est posé que si le champ est vide : une base où la cliente l'a
  // déjà réécrit n'est jamais écrasée, et rejouer la migration ne change rien.
  // Valeur passée en paramètre, donc aucune apostrophe à échapper.
  // En SQL et non par `findGlobal` : l'API de Payload interroge le schéma de
  // la config actuelle, colonnes des migrations suivantes comprises, et
  // échouerait sur une base qui ne les a pas encore.
  await db.execute(sql`
    UPDATE "site_settings"
    SET "schedule_intro" = ${TEXTE}
    WHERE "schedule_intro" IS NULL OR btrim("schedule_intro") = '';`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "schedule_intro";`)
}

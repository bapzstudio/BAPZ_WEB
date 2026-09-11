import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Le libellé du bouton « Cours d'essai » n'est plus saisi : il reprend le prix
// du tarif d'essai. Rendue idempotente comme les précédentes, la colonne ayant
// pu être retirée en développement par le schéma poussé automatiquement.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "trial_label";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "trial_label" varchar;`)
}

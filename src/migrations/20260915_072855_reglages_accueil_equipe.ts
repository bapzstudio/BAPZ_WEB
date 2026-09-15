import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Mot sur l'équipe des Réglages, au-dessus des profs de l'accueil (2026-09-15).
//
// Rendue idempotente à la main, comme les précédentes : en développement
// Payload pousse le schéma directement en base, donc la colonne peut déjà
// exister.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "team_intro" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "team_intro";`)
}

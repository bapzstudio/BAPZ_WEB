import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Rendue idempotente à la main, comme les précédentes : en développement
// Payload pousse le schéma directement en base, donc ces colonnes peuvent déjà
// exister.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "email" varchar;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "legal_name" varchar;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "legal_form" varchar;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "siret" varchar;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "publisher" varchar;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "host" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "email";
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "legal_name";
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "legal_form";
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "siret";
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "publisher";
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "host";`)
}

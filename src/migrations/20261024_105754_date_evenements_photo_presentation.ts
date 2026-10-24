import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Rendue idempotente à la main, comme les précédentes (en développement le
// schéma est poussé directement en base). Compatible avec le code encore en
// ligne, qu'un déploiement Preview peut faire tourner sur cette base : deux
// colonnes facultatives ajoutées, et la colonne du jour rendue facultative —
// Payload ne valide pas un champ masqué (le Jour l'est pour un événement daté,
// cf. `Courses.ts`) ; le hook de la collection la remplit d'après la date.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "courses" ALTER COLUMN "day_of_week" DROP NOT NULL;
  ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "date" timestamp(3) with time zone;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "intro_photo_id" integer;
  DO $$ BEGIN
    ALTER TABLE "site_settings" ADD CONSTRAINT "site_settings_intro_photo_id_media_id_fk" FOREIGN KEY ("intro_photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE INDEX IF NOT EXISTS "site_settings_intro_photo_idx" ON "site_settings" USING btree ("intro_photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "site_settings" DROP CONSTRAINT IF EXISTS "site_settings_intro_photo_id_media_id_fk";
  DROP INDEX IF EXISTS "site_settings_intro_photo_idx";
  ALTER TABLE "courses" ALTER COLUMN "day_of_week" SET NOT NULL;
  ALTER TABLE "courses" DROP COLUMN IF EXISTS "date";
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "intro_photo_id";`)
}

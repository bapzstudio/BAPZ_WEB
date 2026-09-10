import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Rendue idempotente à la main, comme les précédentes : en développement
// Payload pousse le schéma directement en base, donc ces colonnes peuvent déjà
// exister. La contrainte passe par un bloc qui ignore l'erreur « déjà présent »,
// Postgres n'offrant pas de `IF NOT EXISTS` pour elle.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "photo_id" integer;
  ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "price" varchar;
  ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "period" varchar;
  DO $$ BEGIN
    ALTER TABLE "rooms" ADD CONSTRAINT "rooms_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE INDEX IF NOT EXISTS "rooms_photo_idx" ON "rooms" USING btree ("photo_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "rooms" DROP CONSTRAINT IF EXISTS "rooms_photo_id_media_id_fk";
  DROP INDEX IF EXISTS "rooms_photo_idx";
  ALTER TABLE "rooms" DROP COLUMN IF EXISTS "photo_id";
  ALTER TABLE "rooms" DROP COLUMN IF EXISTS "price";
  ALTER TABLE "rooms" DROP COLUMN IF EXISTS "period";`)
}

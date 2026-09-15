import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Présentation, questions fréquentes et code postal des Réglages (accueil et
// référencement, 2026-09-15).
//
// Rendue idempotente à la main, comme les précédentes : en développement
// Payload pousse le schéma directement en base, donc la table et les colonnes
// peuvent déjà exister. La contrainte n'a pas de `IF NOT EXISTS` en Postgres :
// elle passe par un bloc qui ignore le doublon.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE IF NOT EXISTS "site_settings_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL
  );

  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "intro_title" varchar;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "intro_text" varchar;
  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "postal_code" varchar;

  DO $$ BEGIN
    ALTER TABLE "site_settings_faq" ADD CONSTRAINT "site_settings_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION
    WHEN duplicate_object THEN NULL;
  END $$;

  CREATE INDEX IF NOT EXISTS "site_settings_faq_order_idx" ON "site_settings_faq" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "site_settings_faq_parent_id_idx" ON "site_settings_faq" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE IF EXISTS "site_settings_faq" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "intro_title";
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "intro_text";
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "postal_code";`)
}

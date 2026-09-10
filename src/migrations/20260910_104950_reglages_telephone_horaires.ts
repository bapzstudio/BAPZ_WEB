import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Rendue idempotente à la main, comme les précédentes : en développement
// Payload pousse le schéma directement en base, donc la table et la colonne
// peuvent déjà exister. La contrainte passe par un bloc qui ignore l'erreur
// « déjà présent », Postgres n'offrant pas de `IF NOT EXISTS` pour elle.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  CREATE TABLE IF NOT EXISTS "site_settings_opening_hours" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"days" varchar NOT NULL,
  	"hours" varchar NOT NULL
  );

  ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "phone" varchar;
  DO $$ BEGIN
    ALTER TABLE "site_settings_opening_hours" ADD CONSTRAINT "site_settings_opening_hours_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  CREATE INDEX IF NOT EXISTS "site_settings_opening_hours_order_idx" ON "site_settings_opening_hours" USING btree ("_order");
  CREATE INDEX IF NOT EXISTS "site_settings_opening_hours_parent_id_idx" ON "site_settings_opening_hours" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  DROP TABLE IF EXISTS "site_settings_opening_hours" CASCADE;
  ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "phone";`)
}

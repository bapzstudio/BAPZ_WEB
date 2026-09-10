import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Rendue idempotente à la main, comme les précédentes : en développement
// Payload pousse le schéma directement en base, donc tout ou partie de ce qui
// suit peut déjà exister. Postgres n'offre pas de `IF NOT EXISTS` pour les
// types enum ni pour les contraintes : ils passent par un bloc qui ignore
// l'erreur « déjà présent ».
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_demandes_type" AS ENUM('essai', 'inscription', 'location', 'prive');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_demandes_niveau" AS ENUM('debutant', 'intermediaire', 'avance', 'ne-sais-pas');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    CREATE TYPE "public"."enum_demandes_statut" AS ENUM('nouvelle', 'en-cours', 'confirmee', 'sans-suite');
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  CREATE TABLE IF NOT EXISTS "demandes" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"resume" varchar,
  	"type" "enum_demandes_type" NOT NULL,
  	"cours_id" integer,
  	"formule_id" integer,
  	"salle_id" integer,
  	"niveau" "enum_demandes_niveau",
  	"date_souhaitee" varchar,
  	"personnes" numeric,
  	"message" varchar,
  	"prenom" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"telephone" varchar,
  	"statut" "enum_demandes_statut" DEFAULT 'nouvelle' NOT NULL,
  	"notes" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );

  ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "slug" varchar;
  ALTER TABLE "pricing_plans" ADD COLUMN IF NOT EXISTS "slug" varchar;
  ALTER TABLE "rooms" ADD COLUMN IF NOT EXISTS "slug" varchar;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN IF NOT EXISTS "demandes_id" integer;

  DO $$ BEGIN
    ALTER TABLE "demandes" ADD CONSTRAINT "demandes_cours_id_courses_id_fk" FOREIGN KEY ("cours_id") REFERENCES "public"."courses"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "demandes" ADD CONSTRAINT "demandes_formule_id_pricing_plans_id_fk" FOREIGN KEY ("formule_id") REFERENCES "public"."pricing_plans"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "demandes" ADD CONSTRAINT "demandes_salle_id_rooms_id_fk" FOREIGN KEY ("salle_id") REFERENCES "public"."rooms"("id") ON DELETE set null ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  DO $$ BEGIN
    ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_demandes_fk" FOREIGN KEY ("demandes_id") REFERENCES "public"."demandes"("id") ON DELETE cascade ON UPDATE no action;
  EXCEPTION WHEN duplicate_object THEN null; END $$;

  CREATE INDEX IF NOT EXISTS "demandes_cours_idx" ON "demandes" USING btree ("cours_id");
  CREATE INDEX IF NOT EXISTS "demandes_formule_idx" ON "demandes" USING btree ("formule_id");
  CREATE INDEX IF NOT EXISTS "demandes_salle_idx" ON "demandes" USING btree ("salle_id");
  CREATE INDEX IF NOT EXISTS "demandes_updated_at_idx" ON "demandes" USING btree ("updated_at");
  CREATE INDEX IF NOT EXISTS "demandes_created_at_idx" ON "demandes" USING btree ("created_at");
  CREATE UNIQUE INDEX IF NOT EXISTS "courses_slug_idx" ON "courses" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "pricing_plans_slug_idx" ON "pricing_plans" USING btree ("slug");
  CREATE UNIQUE INDEX IF NOT EXISTS "rooms_slug_idx" ON "rooms" USING btree ("slug");
  CREATE INDEX IF NOT EXISTS "payload_locked_documents_rels_demandes_id_idx" ON "payload_locked_documents_rels" USING btree ("demandes_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_demandes_fk";
  DROP TABLE IF EXISTS "demandes" CASCADE;
  DROP INDEX IF EXISTS "courses_slug_idx";
  DROP INDEX IF EXISTS "pricing_plans_slug_idx";
  DROP INDEX IF EXISTS "rooms_slug_idx";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_demandes_id_idx";
  ALTER TABLE "courses" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "pricing_plans" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "rooms" DROP COLUMN IF EXISTS "slug";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN IF EXISTS "demandes_id";
  DROP TYPE IF EXISTS "public"."enum_demandes_type";
  DROP TYPE IF EXISTS "public"."enum_demandes_niveau";
  DROP TYPE IF EXISTS "public"."enum_demandes_statut";`)
}

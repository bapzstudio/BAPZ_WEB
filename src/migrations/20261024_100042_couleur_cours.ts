import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Rendue idempotente à la main, comme les précédentes : en développement
// Payload pousse le schéma directement en base, donc le type et la colonne
// peuvent déjà exister quand la migration arrive. Postgres n'offre pas de
// `IF NOT EXISTS` pour les types enum : il passe par un bloc qui ignore
// l'erreur « déjà présent ». Purement additive : le code encore en ligne
// ignore la nouvelle colonne.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$ BEGIN
    CREATE TYPE "public"."enum_courses_color" AS ENUM('bleu', 'violet', 'rose', 'orange', 'vert');
  EXCEPTION WHEN duplicate_object THEN null; END $$;
  ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "color" "enum_courses_color";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" DROP COLUMN IF EXISTS "color";
  DROP TYPE IF EXISTS "public"."enum_courses_color";`)
}

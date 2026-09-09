import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// `IF NOT EXISTS` ajouté à la génération : en développement, Payload pousse le
// schéma directement en base, donc la colonne peut déjà exister quand la
// migration arrive. Sans ça elle échoue sur « column already exists », et la
// base de développement ne peut plus rattraper l'état des migrations.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "slug" varchar;
  CREATE UNIQUE INDEX IF NOT EXISTS "teachers_slug_idx" ON "teachers" USING btree ("slug");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP INDEX IF EXISTS "teachers_slug_idx";
  ALTER TABLE "teachers" DROP COLUMN IF EXISTS "slug";`)
}

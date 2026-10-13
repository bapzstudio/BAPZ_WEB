import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// `IF NOT EXISTS` / `IF EXISTS` ajoutés au SQL généré, comme le veut la règle
// du projet : en développement Payload pousse le schéma directement en base,
// donc la colonne existe déjà quand la migration arrive, et un `ADD COLUMN` nu
// échouerait sur « column already exists ». Sans effet sur la production, où
// le schéma n'est jamais poussé.
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "visible" boolean DEFAULT true;
  ALTER TABLE "teachers" ADD COLUMN IF NOT EXISTS "visible" boolean DEFAULT true;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "courses" DROP COLUMN IF EXISTS "visible";
  ALTER TABLE "teachers" DROP COLUMN IF EXISTS "visible";`)
}

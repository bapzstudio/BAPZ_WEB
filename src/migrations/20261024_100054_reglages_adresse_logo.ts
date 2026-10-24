import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// Migration de données, sans changement de schéma : son instantané `.json` est
// identique au précédent. Deux demandes de la cliente du 2026-10-24, à
// appliquer à la base de production sans que personne n'ait à se connecter à
// l'admin ni à lancer de commande. Compatible avec le code encore en ligne : un
// déploiement Preview, branché sur la même base, peut la jouer avant la fusion.

const dirname = path.dirname(fileURLToPath(import.meta.url))

// « 2A rue du Jardin d'Écosse » -> « 2 rue du Jardin d'Écosse » : le « 2A »
// égarait les GPS. Insensible à la casse et aux espaces (« 2a », « 2 A, rue »),
// mais limité à cette rue : « 12A » ou « 2 avenue » ne bougent pas.
const MOTIF = '\\m2\\s*a\\M,?\\s*(rue\\s+du\\s+jardin)'
const REMPLACEMENT = '2 \\1'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  // 1. L'adresse. Le site la lit partout dans le champ Adresse des Réglages
  // (accueil, contact, itinéraire, mentions légales, confidentialité, données
  // pour Google) ; les textes libres où la cliente aurait pu la recopier sont
  // corrigés avec. Une requête par table : Postgres refuse plusieurs
  // instructions dans une requête paramétrée.
  const remplacer = (colonne: string) =>
    sql`${sql.identifier(colonne)} = regexp_replace(${sql.identifier(colonne)}, ${MOTIF}, ${REMPLACEMENT}, 'gi')`
  const reglages = await db.execute(sql`
    UPDATE "site_settings" SET ${sql.join(
      ['address', 'hero_title', 'hero_subtitle', 'intro_title', 'intro_text', 'team_intro'].map(remplacer),
      sql`, `,
    )}
    WHERE concat_ws(' ', "address", "hero_title", "hero_subtitle", "intro_title", "intro_text", "team_intro") ~* ${MOTIF}`)
  const faq = await db.execute(sql`
    UPDATE "site_settings_faq" SET ${sql.join(['question', 'answer'].map(remplacer), sql`, `)}
    WHERE concat_ws(' ', "question", "answer") ~* ${MOTIF}`)
  payload.logger.info(
    `Adresse « 2A » -> « 2 » : ${reglages.rowCount ?? 0} ligne(s) des Réglages, ${faq.rowCount ?? 0} question(s) de la FAQ.`,
  )

  // 2. Le logo de la nav, seul logo du site rangé en base (champ Logo des
  // Réglages) : les autres sont des fichiers du dépôt, déjà remplacés. On
  // remplace le fichier du média rattaché, comme `pnpm seed:portraits` : même
  // fiche, même texte alternatif.
  // Lu en SQL, pas par `payload.findGlobal` : l'API de Payload interroge le
  // schéma de la config ACTUELLE, colonnes ajoutées par les migrations
  // suivantes comprises (`intro_photo_id`), absentes de la base à cette étape.
  // `payload.update` sur `media` reste possible tant que cette collection ne
  // gagne pas de colonne ; sur une base vierge on ne l'atteint jamais.
  const { rows } = await db.execute(sql`
    SELECT "media"."id", "media"."filesize" FROM "site_settings"
    JOIN "media" ON "media"."id" = "site_settings"."logo_id" LIMIT 1`)
  const logo = rows[0] as { id: number; filesize: string | number | null } | undefined
  const fichier = path.resolve(dirname, '../seed/assets/images/logo/bapz-logo.png')
  if (!logo) {
    // Base neuve ou logo retiré par la cliente : rien à remplacer.
    payload.logger.info('Logo de la nav : aucun logo dans les Réglages, rien à remplacer.')
    return
  }
  if (Number(logo.filesize) === fs.statSync(fichier).size) {
    payload.logger.info('Logo de la nav : déjà le nouveau logo.')
    return
  }
  if (!process.env.UPLOADTHING_TOKEN) {
    // Base locale sans UploadThing : le téléversement est impossible.
    payload.logger.warn('Logo de la nav : UPLOADTHING_TOKEN absent, logo laissé tel quel.')
    return
  }
  // Sans `req` : la mise à jour a sa propre transaction. Si UploadThing
  // échoue, elle est annulée en entier et l'ancien fichier reste en place —
  // dans la transaction de la migration, la fiche aurait gardé le poids du
  // nouveau fichier sans l'avoir. L'échec n'arrête pas le déploiement : le
  // logo se remplace aussi depuis l'admin.
  try {
    await payload.update({ collection: 'media', id: logo.id, data: {}, filePath: fichier })
    payload.logger.info(`Logo de la nav : média ${logo.id} remplacé par le nouveau logo.`)
  } catch (erreur) {
    payload.logger.warn(
      { err: erreur },
      "Logo de la nav NON remplacé : envoyer public/images/marque/bapz-planete.png dans Réglages du site → Logo, depuis l'admin.",
    )
  }
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  // Rien à défaire : remettre « 2A » ou l'ancien logo ne servirait à personne.
}

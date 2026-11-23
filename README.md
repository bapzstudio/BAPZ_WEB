# BAPZ Studio, site web

Site vitrine et interface d'administration du studio de danse BAPZ Studio
(Ars-Laquenexy, à côté de Metz), dans une seule application **Next.js 16 +
Payload 3**. La cliente édite tout le contenu elle-même depuis `/admin`, en
français.

**En ligne sur <https://bapzstudio.fr> depuis le 2026-11-07.**
Administration : <https://bapzstudio.fr/admin>.

Ce fichier donne l'essentiel pour reprendre le projet. La référence
technique complète, avec la raison de chaque choix, est `CLAUDE.md` : à lire
avant de toucher au design, aux migrations ou aux médias.

## Comptes et propriété

Tous les comptes sont **au nom de la cliente**, qui reste propriétaire des
outils ; Matthias (développeur) y est collaborateur. Reprendre le projet,
c'est se faire inviter sur chacun, jamais recevoir un mot de passe.

| Service | Rôle |
|---|---|
| GitHub `bapzstudio/BAPZ_WEB` | le code ; chaque fusion dans `main` déploie |
| Vercel | hébergement et déploiement |
| Neon | base Postgres (`eu-central-1`, Francfort) |
| UploadThing | stockage des images envoyées depuis l'admin (palier gratuit, 2 Go) |
| Resend | envoi des e-mails, depuis `contact@bapzstudio.fr` (domaine vérifié) |
| Cloudflare | Turnstile, l'anti-robot des formulaires |
| OVH | nom de domaine `bapzstudio.fr` et sa zone DNS |
| Google Search Console | suivi du référencement |

## Démarrage en local

```bash
pnpm install
cp .env.example .env      # puis remplir les variables
pnpm payload migrate      # applique toutes les migrations à une base neuve
pnpm dev                  # site + admin sur http://localhost:3000
pnpm seed confirmer       # VIDE puis remplit la base avec le contenu d'amorçage
```

Au premier lancement sur une base vide, `/admin` demande de créer un compte.

**pnpm uniquement** : le lock est un `pnpm-lock.yaml`, et npm ne résout pas
les dépendances de la même façon.

**Toujours une base à soi.** Ne jamais brancher `pnpm dev` ni `pnpm seed` sur
la base de production : le premier y pousse le schéma hors migrations, le
second vide les collections et effacerait les saisies de la cliente. Le plus
simple est une branche Neon de développement, ou un Postgres local.

## Variables d'environnement

`.env` n'est jamais commité. `.env.example` les liste et les commente :

| Variable | Rôle |
|---|---|
| `PAYLOAD_SECRET` | signe les sessions de l'admin |
| `DATABASE_URL` | Neon, endpoint mis en pool (hôte en `-pooler`, port 5432) |
| `UPLOADTHING_TOKEN` | stockage des images ; **indispensable au build**, sinon toutes les photos cassent |
| `RESEND_API_KEY` | envoi des e-mails |
| `CONTACT_TO_EMAIL` | boîte qui reçoit les demandes et les messages |
| `CONTACT_FROM_EMAIL` | expéditeur, `BAPZ Studio <contact@bapzstudio.fr>` |
| `NEXT_PUBLIC_SITE_URL` | adresse publique sans barre finale ; le build de production échoue si elle est vide |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | clé publique Turnstile |
| `TURNSTILE_SECRET_KEY` | clé secrète Turnstile ; absente en production, tout envoi de formulaire est refusé |

Sur Vercel, les valeurs sont saisies pour **Production et Preview**, en type
*Config*. Le détail et les pièges rencontrés sont dans
`docs/mise-en-ligne.md`.

## Déployer

Pousser sur GitHub suffit. Vercel lance `vercel-build`, c'est-à-dire
`pnpm migrer` (applique les migrations en attente) puis `pnpm build`.

**Attention : un déploiement Preview migre aussi la production.** Les
variables Preview pointent sur la même base. Une branche poussée applique donc
ses migrations avant même d'être fusionnée : toute migration doit rester
compatible avec le code en ligne (colonnes ajoutées, jamais retirées ni
renommées).

Changer `NEXT_PUBLIC_SITE_URL` demande un **redéploiement** : la valeur est
inscrite dans le code au build.

## Changer le modèle de contenu

1. Modifier la collection (`src/collections/`) ou les Réglages
   (`src/globals/SiteSettings.ts`), libellés et aides en français.
2. `pnpm generate:types`, puis `pnpm payload migrate:create <nom>`. Aucune
   base n'est nécessaire pour ces deux commandes.
3. Rendre le SQL généré idempotent (`IF NOT EXISTS`, blocs `DO $$` pour les
   types) et vérifier qu'il reste additif.
4. Rejouer toutes les migrations sur une base **vierge** (`pnpm payload
   migrate`) : seul ce test prouve qu'elles s'enchaînent.
5. Une donnée à afficher : un type dans `lib/types.ts`, une fonction dans
   `lib/queries.ts`, puis le composant.
6. Mettre à jour `docs/guide-administration.md`.

Dans une migration, lire les données **en SQL**, jamais par l'API de Payload :
elle suit le schéma actuel, colonnes des migrations suivantes comprises.

## Commandes

| Commande | Usage |
|---|---|
| `pnpm dev` | site et admin en local |
| `pnpm build` | build de production, seul contrôle de types de tout le projet |
| `pnpm lint` | ESLint |
| `pnpm payload migrate` | applique les migrations (base vierge comprise) |
| `pnpm payload migrate:status` | état des migrations |
| `pnpm migrer` | ce que lance le déploiement ; échoue si une migration manque |
| `pnpm generate:types` | après un changement de collection |
| `pnpm generate:importmap` | après l'ajout d'un composant d'admin personnalisé |
| `pnpm seed confirmer` | **vide** puis remplit la base d'amorçage, développement uniquement |
| `pnpm seed:portraits confirmer` | renvoie les seuls portraits des profs, sans rien effacer |
| `node scripts/generer-marque.mjs` | régénère images, icônes et image de partage depuis `content/logos/` |
| `node scripts/generer-favicon.mjs` | régénère `favicon.ico`, à lancer après le précédent |
| `node scripts/extraire-logo-vectoriel.mjs` | régénère le logo qui se dessine dans l'accueil |

`playwright` (dépendance de développement) sert aux vérifications au
navigateur (mesures, captures), lancées au cas par cas.

## Structure

```
src/
├── payload.config.ts        collections, Postgres, UploadThing, Resend, admin en français
├── payload-types.ts         GÉNÉRÉ par `pnpm generate:types`
├── collections/             un fichier par collection, + hooks de revalidation
├── globals/SiteSettings.ts  Réglages du site (accueil, FAQ, coordonnées, légal, logo)
├── migrations/              GÉNÉRÉ par `migrate:create`, versionné
├── admin/                   logo et icône de l'admin
├── lib/
│   ├── types.ts             les formes que consomment les composants
│   ├── queries.ts           SEUL fichier du site qui connaît Payload
│   ├── mail.ts              SEUL fichier du site qui connaît Resend
│   ├── planning.ts          heures de Paris, prochains cours, événements à venir
│   ├── couleurs.ts          couleurs des événements
│   ├── seo.ts               adresse publique, balises de partage, données structurées
│   └── reservation/         parcours de réservation (schémas, store, action)
├── seed/                    contenu et images d'amorçage, scripts `seed`
└── app/
    ├── (frontend)/          le site public ; `globals.css` porte tout le design
    └── (payload)/           /admin et l'API, GÉNÉRÉ par le template
scripts/                     migration au déploiement, génération des logos et icônes
content/                     notes reçues de la cliente, logos vectoriels (`logos/`)
docs/                        documents du projet (voir plus bas)
```

Les composants reçoivent des objets de `lib/types.ts` et ignorent tout de
Payload : changer de CMS ne toucherait que `lib/queries.ts`.

## Ce que fait le site

- **Pages** : accueil (landing plein écran, prochains cours, extrait de chaque
  page), calendrier, profs et fiche de chaque prof, tarifs et location de
  salle, galerie, contact, mentions légales, confidentialité.
- **Réservation** : tous les boutons d'action mènent au parcours `/reserver`
  (cours d'essai, inscription, location, cours privé). Chaque demande est
  enregistrée dans l'admin (*Suivi → Demandes*), puis envoyée par e-mail au
  studio, avec un accusé de réception au visiteur.
- **Contact** : formulaire envoyé par e-mail, sans enregistrement.
- **Planning** : semaine type ; un cours peut être masqué sans être supprimé,
  coloré pour faire ressortir un événement, ou daté pour un événement ponctuel
  qui disparaît tout seul le lendemain.
- **Mise à jour** : chaque enregistrement dans l'admin régénère le site ;
  l'accueil, le calendrier et les fiches de prof sont en plus régénérés toutes
  les heures.
- **Sécurité** : Turnstile sur les formulaires, création publique fermée sur
  les demandes, GraphQL désactivé, images limitées au domaine UploadThing de
  l'application.

## Design

Toutes les valeurs de `globals.css` sont **relevées au pixel sur les
maquettes Figma** de la graphiste (hors du dépôt, dans `../BAPZ/maquette`).
Ne pas ajuster une couleur, une taille ou un espacement au jugé. Les écarts
avec les maquettes ont été validés par la graphiste le 2026-09-25 ; la seule
exception encore à valider est la palette des couleurs d'événement.

Repères : conteneur de 1700 px, fond `#080808`, polices Archivo et Space Mono,
Tailwind 4. **Jamais de tiret cadratin** dans le code, la documentation ou les
textes du site.

## Documents

| Document | Pour qui | Contenu |
|---|---|---|
| `CLAUDE.md` | développeur | référence technique : règles, choix et mesures, à lire en premier |
| `docs/guide-administration.md` | la cliente | utiliser l'admin au quotidien (base du guide PDF) |
| `docs/mise-en-ligne.md` | développeur | déploiement, variables, DNS, pièges rencontrés, suivi après la mise en ligne |
| `docs/questions-cliente.md` | historique | les questions posées à la cliente et leurs réponses |
| `content/` | historique | notes et fichiers reçus de la cliente |

## État au 2026-11-23

Le site est en ligne et terminé côté développement. Tout le contenu (planning,
photos, prix, informations légales) est saisi par la cliente dans l'admin.

Restent ouverts :

- **Côté cliente**, à saisir dans l'admin : l'**hébergeur** dans les
  informations légales (dernière mention « À compléter »), la photo de la
  présentation de l'accueil, le prix et les photos des salles, le téléphone et
  les horaires, le nombre de cours par saison des abonnements ; et la **fiche
  Google Business** à aligner sur l'adresse « 2 rue du Jardin d'Écosse ».
- **Décisions en attente** : les couleurs des événements, et les arbitrages
  du parcours de réservation (délai de réponse annoncé, téléphone obligatoire,
  places limitées, maintien des « cours privés »), et le forfait 5 h des
  salles, qui n'a pas de champ dans l'admin ; tout est détaillé dans
  `docs/questions-cliente.md`.
- **Suivi** : indexation et Core Web Vitals dans la Search Console ; l'accueil
  est à 57 sous Lighthouse mobile à cause du dégradé animé, et deux replis
  sont prêts si les données réelles le justifient (cf. `CLAUDE.md`).
- **Entretien** : mettre à jour Next et Payload pour les correctifs de
  sécurité, en vérifiant chaque fois le build et les migrations. Ne jamais
  surcharger la dépendance `effect` (cf. « Sécurité » dans `CLAUDE.md`).
- **Données personnelles** : les demandes sont à supprimer à la main trois ans
  après le dernier échange, comme l'annonce la page Confidentialité.

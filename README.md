# BAPZ Studio — site web

Site vitrine et interface d'administration dans une seule application
Next.js 16 + Payload 3. La cliente édite son contenu depuis `/admin`, en
français.

## Démarrage

```bash
pnpm install
cp .env.example .env      # puis remplir les variables
pnpm payload migrate      # applique le schéma à la base
pnpm dev                  # site + admin sur http://localhost:3000
pnpm seed confirmer       # VIDE puis remplit la base avec le contenu d'amorçage
```

Au premier lancement, `/admin` demande de créer un compte administrateur.
Si le port 3000 est occupé, Next bascule sur 3001 et l'indique sur la ligne
`Local:`.

**pnpm uniquement.** Le lock est un `pnpm-lock.yaml` ; mélanger avec npm casse
la résolution des dépendances.

## Variables d'environnement

`.env` n'est jamais commité. `.env.example` en donne la liste :

| Variable | Rôle |
|---|---|
| `PAYLOAD_SECRET` | signe les sessions de l'admin |
| `DATABASE_URL` | Neon Postgres, endpoint mis en pool |
| `UPLOADTHING_TOKEN` | stockage des images uploadées depuis `/admin` |
| `RESEND_API_KEY` | envoi du formulaire de contact |
| `CONTACT_TO_EMAIL` | boîte qui reçoit les messages du formulaire |
| `CONTACT_FROM_EMAIL` | facultatif, une fois un domaine vérifié chez Resend |
| `NEXT_PUBLIC_SITE_URL` | adresse publique, sans barre finale (URL canoniques, sitemap, partage, protection CSRF de l'admin) |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | clé publique de la vérification anti-robot Cloudflare Turnstile |
| `TURNSTILE_SECRET_KEY` | clé secrète Turnstile ; absente en production, les formulaires refusent tout envoi |

## Structure

```
src/
├── payload.config.ts        collections, adaptateur Postgres, admin en français
├── payload-types.ts         généré par `pnpm generate:types`
├── collections/             un fichier par collection
├── globals/                 SiteSettings (réglages éditables du site)
├── migrations/              migrations Payload, générées et versionnées
├── lib/
│   ├── types.ts             les formes que consomment les composants
│   ├── queries.ts           SEUL fichier du site qui connaît le CMS
│   └── mail.ts              SEUL fichier du site qui connaît Resend
├── seed/
│   ├── content.ts           le contenu d'amorçage
│   └── index.ts             le script, lancé par `pnpm seed`
└── app/
    ├── (frontend)/          le site public
    │   ├── _components/     composants réutilisables
    │   ├── _sections/       blocs de page
    │   └── globals.css      tout le design, relevé au pixel sur les maquettes
    └── (payload)/           /admin et l'API — généré, à ne pas modifier
```

`content/` contient les notes et le logo reçus de la cliente. Les exports Figma
et les fichiers sources lourds (photos brutes du shooting, `.ai`) restent hors
du repo, dans `../BAPZ/maquette` et `../BAPZ/content`.

Le découpage tient sur une règle : les composants reçoivent des objets décrits
dans `lib/types.ts` et ignorent tout de Payload. Changer de CMS ne toucherait
que `lib/queries.ts`.

## Base de données

Les comptes Neon et UploadThing appartiennent à la cliente : elle reste
propriétaire des outils du projet.

**Neon Postgres**, région Francfort (`eu-central-1`). La chaîne de connexion
doit être celle de l'endpoint mis en pool — l'hôte se termine par `-pooler`,
sur le port 5432. La connexion directe de Neon n'est joignable qu'en IPv6.

Le schéma est géré par des migrations Payload, versionnées dans
`src/migrations/` :

```bash
pnpm payload migrate:create <nom>   # après un changement de collection
pnpm payload migrate                # applique les migrations en attente
pnpm payload migrate:status         # état des migrations
```

## Médias

Les images uploadées depuis `/admin` partent chez **UploadThing** (palier
gratuit, 2 Go) et sont lues directement sur son CDN, à l'adresse propre à
l'application (`<appId>.ufs.sh/f/<clé>`) : Payload ne les relaie plus, et la
route `/api/media/file/...` n'existe plus. Le détail, et la règle de sécurité
qui va avec, sont dans `CLAUDE.md` (« Base de données et médias »).

Il n'y a donc pas de dossier `public/uploads` : l'adaptateur désactive le
stockage local. Les images qui servent au seed sont dans `src/seed/assets/`,
hors de `public/` : elles ne sont pas publiées avec le site.

## Repères de design

Relevés au pixel sur les exports Figma, à ne pas modifier au jugé :

- Conteneur de 1700 px centré (`.container-page`)
- Fond `#080808`, titres `#ffffff`, texte secondaire `#c8c8c8`, tertiaire `#9a9a9a`
- Cartes d'accueil : fond `#1d1d1d`, bordure `#3c3c3c` (`.card`)
- Cartes calendrier / profs / tarifs : bordure en dégradé + halo, rayon 15 (`.cal-card`)
- Séparateurs `#707070`, filets du calendrier `#635b5b`
- Polices : Archivo (texte) et Space Mono (libellés, horaires)

Le style vient de Tailwind 4, chargé par `@import "tailwindcss"` en tête de
`globals.css` et compilé par `@tailwindcss/postcss` (`postcss.config.mjs`).

## État d'avancement

| Page | État |
|---|---|
| Accueil | Conforme à la maquette |
| Calendrier (`/cours`) | Conforme à la maquette, planning à confirmer |
| Profs | Conforme à la maquette, portraits tirés des originaux du shooting |
| Fiche d'un prof (`/profs/[slug]`) | Bio + ses cours ; pas de maquette, conçue avec le vocabulaire existant |
| Tarifs | Tarifs de la cliente, structure adaptée (4 abonnements au lieu d'un seul) ; section « Locations de salle » ajoutée d'après la maquette du 2026-09-10 |
| Location (`/location`) | Redirigée vers la section salles de Tarifs ; photos et tarifs à fournir |
| Contact | Formulaire branché ; téléphone et horaires éditables dans les réglages, à fournir |
| Réserver (`/reserver`) | Parcours en étapes depuis tous les boutons d'action ; demandes enregistrées dans l'admin |
| Galerie | Branchée sur l'admin ; vide pour l'instant, elle renvoie vers Instagram |
| Mentions légales, Confidentialité | Rédigées ; informations légales à saisir dans les Réglages de l'admin |

## Prochaines étapes

1. Ajouter les photos de la galerie depuis `/admin` (la page est branchée).
2. Déploiement (hébergement, HTTPS). Une URL en `.vercel.app` suffit : le nom
   de domaine n'est pas un prérequis et se branche après.
3. Vérifier un domaine chez Resend pour un expéditeur propre : sans lui les
   messages partent depuis `onboarding@resend.dev`.
4. Mentions légales / RGPD (bloqué sur le SIRET), et fiche Google Business.
5. Formation sur `/admin` + guide PDF (ébauche : `docs/guide-administration.md`).

## Points à confirmer

Le contenu que la cliente n'a pas fourni est **repris de la maquette**
(descriptifs, textes de bannière, infos de location). Le cours d'essai à 10 €
entre dans ce cadre.

- **Planning du calendrier** : la maquette et les horaires transmis ne
  coïncident pas sur tous les cours (Street Enfants mardi ou jeudi ?). C'est un
  conflit entre deux sources, pas un manque. Détail dans `content/cours.md`.
- **Statut légal et SIRET**, pour les mentions légales.
- **Cours privés** : poste du devis qui n'apparaît sur aucune maquette reçue.

Commit from owner to deploy : 4

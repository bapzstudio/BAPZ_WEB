# BAPZ Studio — site web

Site vitrine et interface d'administration dans une seule application
Next.js 16 + Payload 3. La cliente édite son contenu depuis `/admin`, en
français.

## Démarrage

```bash
pnpm install
cp .env.example .env      # puis remplir les trois variables
pnpm payload migrate      # applique le schéma à la base
pnpm dev                  # site + admin sur http://localhost:3000
pnpm seed                 # (re)remplit la base avec le contenu d'amorçage
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
gratuit, 2 Go). Payload continue de les servir derrière `/api/media/file/...`
et se charge du relais ; l'URL UploadThing directe
(`xthjbjqeai.ufs.sh/f/<clé>`) n'apparaît pas dans les pages.

Il n'y a donc pas de dossier `public/uploads` : l'adaptateur désactive le
stockage local. `public/images/` ne contient que les fichiers servant au seed.

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
| Tarifs | Tarifs de la cliente, structure adaptée (4 abonnements au lieu d'un seul) |
| Location | Salles A et B renseignées |
| Contact | Formulaire branché, horaires à fournir |
| Galerie | Placeholder |

## Prochaines étapes

1. Renseigner `CONTACT_TO_EMAIL` : sans elle, le formulaire affiche une erreur.
2. Terminer la page Galerie.
3. Déploiement (hébergement, nom de domaine, HTTPS).
4. Vérifier un domaine chez Resend pour un expéditeur propre.
5. SEO local, mentions légales / RGPD.
6. Formation sur `/admin` + guide PDF.

## Points à confirmer

Le contenu que la cliente n'a pas fourni est **repris de la maquette**
(descriptifs, textes de bannière, infos de location). Le cours d'essai à 10 €
entre dans ce cadre.

- **Planning du calendrier** : la maquette et les horaires transmis ne
  coïncident pas sur tous les cours (Street Enfants mardi ou jeudi ?). C'est un
  conflit entre deux sources, pas un manque. Détail dans `content/cours.md`.
- **Page par prof** : elle n'existe pas, d'où le lien `Profs → /cours`, la
  destination la plus faible du site.
- **Statut légal et SIRET**, pour les mentions légales.
- **Cours privés** : poste du devis qui n'apparaît sur aucune maquette reçue.

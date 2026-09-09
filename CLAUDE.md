# BAPZ Studio — contexte projet

Site vitrine + interface d'administration pour BAPZ Studio (studio de danse),
dans une seule application Next.js 16 + Payload 3. La cliente édite son contenu
elle-même via `/admin`, en français.

Le projet a été monté sur le template `blank` de `create-payload-app`
(adaptateur Postgres), dans lequel ont été repris le front et le modèle de
contenu déjà écrits dans `../BAPZ-v2`. Le dossier `src/app/(payload)/` vient du
template et fait autorité.

## Commandes

Node et pnpm sont installés via `fnm` et ne sont pas toujours sur le `PATH`
d'un shell frais.

```bash
pnpm install
pnpm dev                  # site + admin sur http://localhost:3000
pnpm build                # seul contrôle de types couvrant tout le projet
pnpm seed                 # (re)remplit la base depuis src/seed/content.ts
pnpm generate:types       # après un changement de collection
pnpm generate:importmap   # après tout ajout de composant admin personnalisé
pnpm payload migrate      # applique les migrations en attente
pnpm lint
```

**pnpm uniquement.** Ne jamais lancer `npm install` ici. `@payloadcms/translations`
est importé directement par `src/payload.config.ts` et n'est résolu que parce
qu'il est déclaré explicitement en dépendance : pnpm ne le remonte pas par
hoisting comme npm le faisait.

## Structure

```
src/
├── payload.config.ts        collections, adaptateur Postgres, UploadThing, admin FR
├── payload-types.ts         GÉNÉRÉ — ne pas éditer à la main
├── collections/             un fichier par collection
├── globals/SiteSettings.ts  réglages éditables du site (hero, adresse, marquee)
├── migrations/              GÉNÉRÉ par `payload migrate:create`, à versionner
├── lib/
│   ├── types.ts             les formes que consomment les composants
│   ├── queries.ts           SEUL fichier du site qui connaît Payload
│   └── mail.ts              SEUL fichier du site qui connaît Resend
├── seed/
│   ├── content.ts           le contenu d'amorçage
│   └── index.ts             le script (`pnpm seed`), idempotent
└── app/
    ├── (frontend)/          le site public
    │   ├── _components/     composants réutilisables
    │   ├── _sections/       blocs de page (Hero)
    │   └── globals.css      tout le design
    └── (payload)/           /admin et l'API — GÉNÉRÉ, ne pas modifier
```

## Règles de ce projet

**La couche données.** Les composants reçoivent des objets décrits dans
`lib/types.ts` et ignorent tout de Payload. Tout appel à `getPayload` vit dans
`lib/queries.ts`, nulle part ailleurs. Une nouvelle donnée à afficher = un type
dans `types.ts`, une fonction dans `queries.ts`, puis le composant.

**Le design est mesuré, pas inventé.** Les valeurs de `globals.css` sont
relevées au pixel sur les exports Figma, qui vivent hors du repo dans
`../BAPZ/maquette`. Ne pas ajuster une couleur, un rayon ou un espacement
« à l'œil » : vérifier sur la maquette, ou demander. Les tokens sont en tête de
`globals.css`.

- Conteneur de 1700 px centré (`.container-page`)
- Fond `#080808`, titres `#ffffff`, secondaire `#c8c8c8`, tertiaire `#9a9a9a`
- Cartes d'accueil : `#1d1d1d` sur bordure `#3c3c3c` (`.card`)
- Cartes calendrier / profs / tarifs : bordure en dégradé + halo, rayon 15 (`.cal-card`)
- Polices : Archivo (texte), Space Mono (libellés, horaires)

**Les libellés de l'admin sont en français**, y compris les `label`,
`description` et `labels` des collections : c'est la cliente qui les lit.

**Après un changement de collection** : `pnpm generate:types`, puis
`pnpm payload migrate:create <nom>` et `pnpm payload migrate`.

## Base de données et médias

Les comptes Neon et UploadThing appartiennent à la cliente, conformément au
principe posé dans `content/demande-cliente-2026-09-01.md` : elle reste
propriétaire des outils, Matthias y est collaborateur.

Neon Postgres (`eu-central-1`), via l'endpoint mis en pool — l'hôte se termine
par `-pooler`, port 5432. La connexion directe de Neon n'est joignable qu'en
IPv6.

Les images uploadées vont chez UploadThing (`@payloadcms/storage-uploadthing`,
palier gratuit 2 Go). L'adaptateur désactive le stockage local : la collection
`Media` n'a donc pas de `staticDir` et il n'y a pas de `public/uploads`.
Payload sert les fichiers derrière `/api/media/file/...` et relaie vers
UploadThing, ce qui est couvert par `images.localPatterns` dans
`next.config.ts`.

`next.config.ts` déclare aussi `images.qualities = [75, 90]`, obligatoire
depuis Next 16 pour les portraits rendus en qualité 90.

## Formulaire de contact

L'envoi passe par Resend, isolé dans `lib/mail.ts`. L'action serveur
`app/(frontend)/contact/actions.ts` valide et appelle cette couche ; le
composant client `ContactForm.tsx` ne connaît que l'action.

Tant qu'aucun domaine n'est vérifié chez Resend, le compte ne peut envoyer que
depuis `onboarding@resend.dev` et **uniquement vers l'adresse d'inscription du
compte** : `CONTACT_TO_EMAIL` doit donc être cette adresse. Une fois un domaine
vérifié, renseigner `CONTACT_FROM_EMAIL` et la contrainte tombe.

Anti-spam : un champ leurre `website`, hors flux et hors tabulation. Rempli, le
message est ignoré et le visiteur voit quand même une confirmation — annoncer
l'échec à un robot le fait réessayer. Pas de limitation de débit : elle
demanderait un stockage partagé entre instances. `delivered@resend.dev` est un
destinataire simulé, pratique pour tester sans écrire à personne.

**Le seed est destructeur.** `src/seed/index.ts` vide les collections avant de
réinsérer. À réserver au développement : il effacerait les saisies de la
cliente.

## Contenu

`content/` contient les notes reçues de la cliente et le logo vectoriel. Les
exports Figma et les fichiers sources lourds (photos brutes du shooting, `.ai`)
restent hors du repo, dans `../BAPZ/maquette` et `../BAPZ/content`.

## État

| Page | État |
|---|---|
| Accueil, Calendrier (`/cours`), Profs | Conformes aux maquettes |
| Tarifs | Tarifs de la cliente |
| Location | Salles A et B renseignées |
| Contact | Formulaire branché, horaires à fournir |
| Galerie | Placeholder |

## Points ouverts

**Le contenu que la cliente n'a pas fourni est repris de la maquette** —
descriptifs, textes de bannière, infos de location. Le cours d'essai à 10 €
entre dans ce cadre et n'est donc plus un point ouvert.

- Planning du calendrier : la maquette et les horaires transmis ne coïncident
  pas sur tous les cours. Détail dans `content/cours.md`. Il s'agit d'un
  conflit entre deux sources, pas d'un manque : à trancher avec elle.
- Portraits des profs : ceux de `public/images/profs/` viennent de l'export
  Figma. Les originaux du shooting sont dans `../BAPZ/content`
  (`Alessia.jpeg`, `Lara.JPG`, `Lena.JPG` — les variantes `lena_s` / `lena_v`
  sont écartées), à recadrer en 1086 x 944. Ce sont des prises de vue
  verticales : le cadrage paysage n'est pas mécanique, il se décide sur la
  maquette.
- Statut légal et SIRET manquants pour les mentions légales.
- « Cours privés » : poste du devis absent de toutes les maquettes reçues.

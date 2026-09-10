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

**Rythme vertical.** Les maquettes tiennent dans 1080px de haut, et les pages
doivent en faire autant. Valeurs relevées : nav 66, bas de page 34 (seul écart
bas mesurable du design, sur Profs), filet du footer à y=1027 donc bande de
footer de 53, écart hero → « prochains cours » de 25 sur l'accueil. Les écarts
hauts passent par les variables `--vr-*` de `globals.css`, exactes à 1080 et
comprimées deux fois plus vite en dessous.

Deux pages débordent encore à 1080, et c'est du contenu, pas de l'espacement :
`/tarifs` (l'offre réelle compte quatre abonnements là où la maquette en
montrait un, d'où une seconde rangée) et `/profs` d'une trentaine de pixels,
les bios se répartissant sur plus de lignes qu'au rendu Figma.

**Une seule interaction pour toutes les cartes cliquables.** Elles n'ont pas
toutes la même apparence — l'accueil utilise `.card` (bordure plate, rayon 12)
et les autres pages `.cal-card` (bordure en dégradé, rayon 15), parce que c'est
ce que montrent les maquettes. Mais elles réagissent toutes pareil : `cal-glow`
allume la bordure selon la proximité du curseur, et au survol toutes portent le
même `0 0 22px rgba(255,255,255,0.16)`. Une carte cliquable = un lien parent (ou
un lien étiré si elle contient déjà un bouton), `data-glow-card`, `cal-glow`,
`relative`, et une grille enveloppée dans `ProximityGlow`.

**Les libellés de l'admin sont en français**, y compris les `label`,
`description` et `labels` des collections : c'est la cliente qui les lit.

**Après un changement de collection** : `pnpm generate:types`, puis
`pnpm payload migrate:create <nom>` et `pnpm payload migrate`.

En développement Payload **pousse le schéma directement en base**, sans passer
par les migrations. Trois conséquences :

- La colonne existe déjà quand la migration arrive. Ajouter `IF NOT EXISTS` /
  `IF EXISTS` au SQL généré, sinon elle échoue sur « column already exists » et
  la base de développement ne peut plus rattraper l'état des migrations.
- `payload migrate` pose alors une question interactive avertissant d'une perte
  de données. Sans terminal — en intégration continue par exemple — la commande
  reste bloquée. Une base de production, jamais poussée en mode dev, ne devrait
  pas déclencher ce garde-fou.
- Un schéma qui « marche en local » ne prouve donc rien sur les migrations.
  Seule une base reconstruite depuis les seuls fichiers de migration le prouve.

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

## Parcours de réservation

`/reserver` reçoit tous les boutons d'action du site (hero, cartes de cours,
calendrier, tarifs, location, « S'inscrire »). Structure reprise du tunnel de
devis de chuttt.ch : état conservé par onglet (zustand, `sessionStorage`),
barre de progression, colonne qui récapitule les choix, étapes validées par
zod, récapitulatif modifiable, confirmation. `/contact` reste pour les simples
questions.

- `lib/reservation/` : schémas zod partagés navigateur et serveur, store,
  lecture du pré-remplissage, construction des liens, action serveur.
- `app/(frontend)/reserver/` : la page, l'orchestrateur et une étape par
  fichier.
- Collection `Demandes` : chaque envoi y est enregistré, avec un statut
  (nouvelle, en cours, confirmée, sans suite) et des notes internes.

Règles :

- **Tout bouton d'action passe par `lienReservation()`.** Le contexte voyage
  dans l'adresse (`?demande=essai&cours=<slug>`) et fait sauter les étapes déjà
  connues. Il est revérifié contre le catalogue : un type inconnu annule le
  pré-remplissage, un identifiant inconnu est ignoré.
- **Cours, formules et salles ont un `slug`**, déduit du titre puis figé : les
  identifiants numériques changent à chaque seed.
- **La création publique est fermée sur `Demandes`.** L'action écrit par l'API
  locale de Payload ; `POST /api/demandes` sans compte est refusé.
- **Enregistrer d'abord, écrire ensuite.** Si le mail échoue, la demande existe
  dans `/admin` et le visiteur voit la confirmation, ce qui évite les doublons.
- Les valeurs saisies sont échappées avant d'entrer dans le HTML du mail.
- L'accusé de réception au visiteur ne part qu'une fois `CONTACT_FROM_EMAIL`
  renseigné ; avant, Resend le refuserait.
- `useReservationStore.persist` n'existe pas côté serveur : zustand n'attache
  son API que si le stockage est disponible. Y accéder sans garde fait
  répondre la page en 500.

Écart avec chuttt : les transitions d'étape passent par une animation CSS
plutôt que framer-motion, pour garder une seule bibliothèque d'animation.

À confirmer avec la cliente : le délai de réponse annoncé après l'envoi
(« très vite » en attendant), le téléphone obligatoire ou non (facultatif en
attendant), et si les cours ont un nombre de places limité.

## Portraits des profs

`public/images/profs/` contient les portraits tirés des originaux du shooting
(`../BAPZ/content`), au format 1086 x 944 attendu par `TeacherCard`.

Les originaux sont des prises de vue **verticales** de 4480 x 6720 une fois
l'orientation EXIF appliquée ; le cadrage paysage n'a donc rien de mécanique.
Il n'a pas été choisi à l'œil : les fichiers d'origine venaient de l'export
Figma et portaient donc le cadrage de la graphiste, qu'on a retrouvé dans la
photo source par corrélation croisée normalisée (score 0.996, écart moyen
1/255 avec l'extraction). Rectangles retenus, en pixels de l'image redressée :

| Prof | Source | Rectangle |
|---|---|---|
| Léna | `Lena.JPG` | 4480 x 3894 à (0, 919) |
| Lara | `Lara.JPG` | 1800 x 1565 à (1225, 1356) |
| Alessia | `Alessia.jpeg` | 2400 x 2086 à (1041, 1243) |

Encodage : `lanczos3`, JPEG qualité 94, `chromaSubsampling: "4:4:4"`. Réglage
choisi sur mesure de netteté (variance du laplacien) : en qualité 88 le
portrait de Léna passait *sous* l'ancienne extraction, sa réduction étant de
4,1x contre 1,7x et 2,2x pour les autres.

**Après tout changement de ces fichiers, relancer `pnpm seed`** : le site sert
les portraits depuis Payload/UploadThing, pas depuis `public/`.

## SEO

`lib/seo.ts` est le seul fichier qui connaît l'adresse publique et la forme des
balises de partage. Toute page passe par `pageMetadata({ title, description,
path })` : sans quoi elle partirait sans URL canonique ni carte de partage, et
un lien posté sur Instagram n'afficherait qu'une URL nue.

L'image de partage est `public/partage.jpg`, référencée explicitement dans
`pageMetadata`. Ne pas revenir à la convention de fichier `opengraph-image` de
Next : elle s'attache au segment, et l'objet `openGraph` de chaque page écrase
celui du layout, image comprise — vérifié, `og:image` ne sortait alors que sur
l'accueil.

`NEXT_PUBLIC_SITE_URL` porte l'adresse publique. Vide en local, le repli
`http://localhost:3000` suffit. Au déploiement : d'abord l'URL `.vercel.app`,
puis le vrai domaine.

Les données structurées (`DanceSchool`) sont injectées par le layout et
alimentent le référencement local. La fourchette de prix est déduite des tarifs
saisis, donc elle suit ce que la cliente modifie. **Les champs absents ne sont
pas inventés** : horaires d'ouverture et téléphone apparaîtront dès qu'ils
seront fournis et ajoutés à `SiteSettings`.

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
- Galerie : seule page encore en placeholder.
- Nombre de cours par saison : le champ « Nombre de cours inclus » des tarifs
  affiche « soit X € le cours », ce qui rend une carte et un abonnement
  comparables. Il est rempli pour la carte 10 cours, vide pour les quatre
  abonnements faute de connaître le nombre de semaines de la saison.
- Statut légal et SIRET manquants pour les mentions légales.
- « Cours privés » : poste du devis absent de toutes les maquettes reçues.

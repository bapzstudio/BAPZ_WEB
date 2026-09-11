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

**Téléphone.** Les maquettes sont au format bureau ; en dessous de `sm`
(640px), l'accueil a sa propre répartition, pour ne pas empiler les espacements
du bureau (1 549px de haut à 390px, 901 après) :

- boutons du hero pleine largeur, le cours d'essai en premier ; sous-titre
  sans le retour à la ligne calé sur la maquette ;
- « Prochains cours » en carrousel horizontal à arrêt par carte (85 % de la
  largeur) au lieu de trois cartes empilées ; sur mobile la pastille
  « Réserver » des cartes devient une flèche ;
- pied de page sur deux lignes, sans les disciplines que le bandeau affiche
  déjà.

Tout passe par des classes `sm:` : au-dessus, les valeurs de la maquette
restent intactes.

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

**L'admin est rangé pour la cliente.** Trois groupes de menu : « Suivi »
(Demandes), « Contenu du site », « Réglages ». Chaque champ dont l'effet sur le
site n'est pas évident porte une `description` qui dit où il s'affiche et avec
quel format. Le guide d'utilisation, ébauche du PDF, est
`docs/guide-administration.md` : à tenir à jour avec l'admin.

**Toute collection affichée sur le site porte `hooksRevalidation`**
(`collections/hooks/revalider.ts`), les réglages `revaliderApresReglages`.
Les pages lisent Payload sans `fetch`, donc Next les fige au build : sans ce
hook, une modification faite dans l'admin n'apparaîtrait qu'au déploiement
suivant. `pnpm dev` rend tout à la demande et ne permet pas de le constater —
seul `pnpm build && pnpm start` le montre.

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
- L'accusé de réception au visiteur (récapitulatif de sa demande, réponse
  dirigée vers la boîte du studio) ne part qu'une fois `CONTACT_FROM_EMAIL`
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

## Accessibilité, erreurs et performance

**Pages d'erreur.** Le projet a deux layouts racines (site et admin) et aucun
layout au sommet de `app/`. Une adresse inconnue tombait donc sur la 404 par
défaut de Next, en anglais et sans nav. `app/(frontend)/[...introuvable]`
lève `notFound()` à l'intérieur du site pour que `not-found.tsx` s'affiche
dans son layout : ne pas la supprimer. `global-not-found` a été écarté : encore
expérimental, et rendu sans le layout. `error.tsx` couvre une page qui échoue,
`app/global-error.tsx` le layout lui-même (couleurs en ligne, sans
`globals.css`).

**Clavier.**

- Contour de focus commun dans `globals.css` (`:focus-visible`, blanc à 60 %,
  décalé de 4 px), en `@layer base` pour qu'un `outline-none` explicite reste
  prioritaire. Celui du navigateur prenait la couleur du texte, invisible sur
  un bouton clair.
- Lien d'évitement « Aller au contenu » (`.lien-evitement`) vers
  `main#contenu`.
- Parcours de réservation : à chaque changement d'étape voulu par la personne,
  le focus va sur le titre de l'étape (`Titre` porte `tabIndex={-1}`), sinon
  il retombait en haut du document. Champs en erreur marqués `aria-invalid`.

**Menu mobile.** Le panneau et ses voiles sont fermés dès le CSS
(`translateX(100%)`), et GSAP repart de `x: 0, xPercent: 100`. Sans l'état CSS,
le menu restait affiché le temps que le JavaScript s'exécute : flash visible, et
décalage de mise en page de 0,46 sur `/reserver`.

**Icônes.** `app/icon.png` et `app/apple-icon.png`, tirées du logo rogné et
posé sur `#080808` (le logo est blanc sur transparent, invisible sur un onglet
clair).

**Mesures.** Lighthouse 12, mobile, build de production local, le 2026-09-10 :

| Page | Perf | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|---|
| Accueil | 85 | 100 | 100 | 100 |
| Tarifs | 89 | 100 | 100 | 100 |
| Réserver | 80 | 100 | 96 | 100 |
| Calendrier | 89 | 96 | 100 | 100 |
| Contact | 93 | 100 | 100 | 100 |

Restent signalés, et ce sont des choix de design, pas des oublis :

- Contraste : `--rule` (`#707070`) en texte sur `#080808` donne 4,04:1, sous le
  seuil de 4,5:1 (jours du calendrier, discipline sur la carte prof). `#7a7a7a`
  passerait sur le fond de page (4,67:1), pas sur les cartes (3,93:1).
- Textes de 11 px en Space Mono : 45 % du texte de `/reserver`.
- LCP autour de 3 s en 4G simulée, sur un texte : la page est prête plus tôt
  (FCP 0,9 s).

## Pages légales

`/mentions-legales` et `/confidentialite` lisent les Réglages (bloc
« Informations légales » et e-mail de contact). Un champ vide s'affiche
« À compléter » plutôt que de disparaître : une mention obligatoire manquante
doit se voir avant la mise en ligne.

**La page Confidentialité décrit ce que le site fait réellement**, vérifié dans
le code : demandes de réservation enregistrées en base et envoyées par mail,
messages de contact envoyés par mail sans être enregistrés, aucun cookie ni
outil de mesure côté visiteur, saisie du parcours gardée dans le
`sessionStorage` de l'onglet. **Toute nouvelle collecte** — mesure d'audience,
champ de formulaire, service tiers — **doit y être ajoutée** en même temps
que le code. La liste des prestataires (Neon, Resend, hébergeur) est à relire
au déploiement.

## Contenu

`content/` contient les notes reçues de la cliente et le logo vectoriel. Les
exports Figma et les fichiers sources lourds (photos brutes du shooting, `.ai`)
restent hors du repo, dans `../BAPZ/maquette` et `../BAPZ/content`.

## État

| Page | État |
|---|---|
| Accueil, Calendrier (`/cours`), Profs | Conformes aux maquettes |
| Tarifs | Tarifs de la cliente ; section « Locations de salle » d'après la maquette TARIFS du 2026-09-10 |
| Location (`/location`) | Redirigée vers `/tarifs#locations`, où sont les salles |
| Contact | Formulaire branché ; téléphone et horaires éditables, encore vides |
| Galerie | Branchée sur la rubrique Galerie ; vide, elle renvoie vers Instagram |
| Mentions légales, Confidentialité | Rédigées ; informations légales à saisir dans les Réglages |

## Points ouverts

**Le contenu que la cliente n'a pas fourni est repris de la maquette** —
descriptifs, textes de bannière, infos de location. Le cours d'essai à 10 €
entre dans ce cadre et n'est donc plus un point ouvert.

- Planning du calendrier : la maquette et les horaires transmis ne coïncident
  pas sur tous les cours. Détail dans `content/cours.md`. Il s'agit d'un
  conflit entre deux sources, pas d'un manque : à trancher avec elle.
- Galerie : aucune photo saisie. En attendant, la page invite à suivre le
  studio sur Instagram.
- Nombre de cours par saison : le champ « Nombre de cours inclus » des tarifs
  affiche « soit X € le cours », ce qui rend une carte et un abonnement
  comparables. Il est rempli pour la carte 10 cours, vide pour les quatre
  abonnements faute de connaître le nombre de semaines de la saison.
- Location de salle : la maquette TARIFS du 2026-09-10 prévoit une photo et un
  prix (« XX € ») par salle. Les champs existent dans l'admin mais sont vides ;
  sans prix la carte affiche « Tarif sur demande », sans photo elle s'affiche sans
  image. La maquette rend aussi la salle B réservable, alors qu'elle n'ouvre
  qu'en 2027 : elle reste non cliquable tant que « Année d'ouverture » est
  rempli.
- Informations légales : nom de l'entreprise, statut, SIRET, responsable de
  la publication et e-mail sont à saisir par la cliente, l'hébergeur au
  déploiement. D'ici là, les pages légales affichent « À compléter ».
- Conservation des demandes : la page Confidentialité annonce trois ans au
  plus après le dernier échange. Aucune suppression automatique : c'est une
  opération manuelle, décrite dans le guide.
- « Cours privés » : poste du devis absent de toutes les maquettes reçues.

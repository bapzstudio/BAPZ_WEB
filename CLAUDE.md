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
pnpm seed confirmer       # VIDE puis remplit la base depuis src/seed/content.ts
pnpm generate:types       # après un changement de collection
pnpm generate:importmap   # après tout ajout de composant admin personnalisé
pnpm payload migrate      # applique les migrations en attente
pnpm lint
```

`playwright` (dépendance de développement) n'est appelé par aucun script : il
sert aux vérifications au navigateur — mesures au pixel, captures, parcours au
clavier — lancées au cas par cas.

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
- Petits textes discrets `#8a8a8a` (`text-discret`) : la maquette les met en
  `#707070`, sous le seuil de contraste (4,04:1) ; `#8a8a8a` est le plus proche
  qui passe partout. `#707070` (`--rule`) reste aux filets et contours
- Tailles nommées des petits textes : `text-label` 11 px, `text-petit` 13 px,
  `text-courant` 15 px — pas de valeur libre à côté
- Messages d'erreur en gris secondaire ; rayon 15 px pour tout ce qui est carte
  ou image de carte
- Cartes d'accueil : `#1d1d1d` sur bordure `#3c3c3c` (`.card`)
- Cartes calendrier / profs / tarifs : bordure en dégradé + halo, rayon 15 (`.cal-card`)
- Polices : Archivo (texte), Space Mono (libellés, horaires)
- Éléments communs, définis une fois dans la couche `components` de
  `globals.css` : `.titre-page` (titre de page), `.champ` (champ de
  formulaire), `.bouton-carte` (« Choisir », lien étiré sur toute la carte)

**Rythme vertical.** Les maquettes tiennent dans 1080px de haut, et les pages
doivent en faire autant. Valeurs relevées : nav 66, bas de page 34 (seul écart
bas mesurable du design, sur Profs), filet du footer à y=1027 donc bande de
footer de 53, écart hero → « prochains cours » de 25 sur l'accueil. Les écarts
hauts passent par les variables `--vr-*` de `globals.css`, exactes à 1080 et
comprimées deux fois plus vite en dessous.

**L'accueil fait exception depuis le 2026-09-14** : il s'ouvre sur une landing
qui occupe l'écran entier (`100svh` moins les 67px de la nav) — l'œil-de-bœuf,
le titre qui se déplie, le sous-titre, le logo qui se dessine et une invite à
défiler — et le reste (boutons et « Prochains cours ») vient au défilement, sur
un deuxième écran d'une fenêtre au moins, pour que le geste tombe juste. Sur la
landing, le sous-titre suit la fenêtre au-delà de ~1400px
(`clamp(17px,1.45vw,24px)`) : à la taille de la maquette, 16px, il paraissait
perdu à côté d'un titre de 158px. Écart assumé, limité à la landing. La
maquette, elle, fait tenir tout l'accueil dans un écran : **écart assumé, à
montrer à la cliente**. Sur la landing, le titre est calé haut et la planète
basse : au milieu, le mot BAPZ du logo passait sous la fin du titre. Le bord
droit de la planète tombe sur la ligne du conteneur comme tout le reste du site
(`right-0` porterait sur la boîte du conteneur, gouttière comprise, et la
planète toucherait le bord de la fenêtre) ; sur téléphone elle est centrée et
entière sous le titre.

**Les liens d'ancre glissent** (`scroll-behavior: smooth` sur `html`, sous
`prefers-reduced-motion: no-preference`). Un défilement calé à la main doit donc
viser la position **collée** d'une barre, et non sa position au moment du clic :
la barre des jours du calendrier est encore dans le flux tant qu'on n'a pas
défilé, et le jour visé s'arrêtait 220px trop bas.

Deux pages débordent encore à 1080, et c'est du contenu, pas de l'espacement :
`/tarifs` (l'offre réelle compte quatre abonnements là où la maquette en
montrait un, d'où une seconde rangée) et `/profs` d'une trentaine de pixels,
les bios se répartissant sur plus de lignes qu'au rendu Figma.

**Téléphone.** Les maquettes sont au format bureau ; en dessous de `sm`
(640px), l'accueil a sa propre répartition, pour ne pas empiler les espacements
du bureau (1 549px de haut à 390px, 901 après) :

- boutons du hero pleine largeur, le cours d'essai en premier ; sous-titre
  sans le retour à la ligne calé sur la maquette ;
- « Prochains cours » : les trois cartes sont empilées, et la pastille
  « Réserver » de chaque carte devient une flèche. C'était un carrousel
  horizontal à arrêt par carte tant que l'accueil devait tenir en 900px ;
  depuis la landing, le deuxième écran a la place, et rien n'est plus caché
  hors champ ni ne demande un geste latéral ;
- pied de page sur deux lignes, sans les disciplines que le bandeau affiche
  déjà.

Le calendrier en liste (sous 1280 px) a une barre des jours collante sous la
nav, dont la pastille suit le jour affiché et qui fait défiler au toucher, et
chaque jour entre au défilement (nom, filet qui se trace, cartes décalées) :
`CalendrierAnimations`, qui anime le balisage serveur de `WeekSchedule` par ses
attributs `data-jour…`. Sans JavaScript ou en mouvement réduit, liste entière
et ancres simples.

La grille hebdomadaire (à partir de 1280 px) a son pendant, `CalendrierGrille` :
mêmes réglages, mais les cartes entrent **par colonne** (décalage de 0,06 s par
jour) et non dans l'ordre du document, sans quoi une cellule du samedi écrite
avant une du lundi partirait la première. Survoler une carte allume l'en-tête de
son jour, pour la rattacher à sa colonne dans une grille de sept : un seul
écouteur sur la grille, un attribut `data-actif` sur l'en-tête, et le reste en
CSS.

**Tous les titres de page se déplient** mot par mot au chargement (`FoldText`,
écrit pour le hero). Seule exception, le `h2` « Locations de salle » de
`/tarifs` : `FoldText` joue au chargement et non au défilement, donc un titre
situé au milieu d'une page serait déjà déplié quand on l'atteint.

**`main` est une colonne flex et chaque page en occupe toute la hauteur.**
Quand une page est plus courte que l'écran, l'espace restant doit tomber dans
la page et non après elle : sinon il s'ajoutait sous le bandeau défilant de
l'accueil, qui paraissait deux fois plus haut (86px mesurés à 545x934). Le
bandeau est poussé en bas par `mt-auto`.

**Tout garde-fou `data-*-pending` vit dans `@media (scripting: enabled)`** de
`globals.css`. Ces règles masquent du contenu en attendant que GSAP prenne la
main ; sans JavaScript, rien ne retire jamais l'attribut, et ce qu'elles
masquent resterait invisible. C'était le cas du titre du hero, corrigé au
passage.

Sur ordinateur, la pastille de la page courante de la nav glisse de la même
façon d'un onglet à l'autre (`Nav.tsx`). Tant que JavaScript n'a pas placé la
pastille, l'onglet actif garde son propre fond, sans quoi il apparaîtrait nu
au premier affichage.

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
seul `pnpm build && pnpm start` le montre. L'accueil est en plus régénéré
toutes les heures (`revalidate = 3600`) : « Prochains cours » y dépend de
l'heure (`lib/planning.ts`, calculé à l'heure de Paris, le serveur tournant en
UTC).

**Une donnée n'est saisie qu'une fois.** Le bouton « Cours d'essai » de
l'accueil lit le prix du tarif « Offre d'essai » ; les heures passent toutes par
`formaterHeure` (« 19h00 », en capitales dans les libellés Space Mono) ; la
règle « un prof a une fiche » vit dans `queries.ts`, pour `/profs` comme pour
les pages de prof.

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
- **Retirer un champ bloque le serveur de dev.** Dès que la config change, il
  veut supprimer la colonne et pose une question « perte de données ? » dans
  son terminal ; lancé en arrière-plan, il reste figé et chaque page attend.
  Créer et appliquer la migration **avant** de recharger une page, ou relancer
  `pnpm dev` une fois la migration passée.

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

**Correctif d'en-tête dans `Media.ts`** (`upload.modifyResponseHeaders`) :
l'adaptateur prend la taille du fichier dans une requête HEAD à UploadThing, qui
n'annonce jamais de `content-length`. Il répondait donc « longueur 0 » et le
navigateur recevait une image vide sur tout accès direct à `/api/media/file`
(vignettes de l'admin notamment) ; les pages, servies par l'optimiseur de Next,
n'étaient pas touchées. Le correctif retire cet en-tête nul. À retirer si une
version de l'adaptateur corrige le problème.

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
l'échec à un robot le fait réessayer. Le leurre n'arrête que les robots naïfs :
la vraie barrière est Cloudflare Turnstile (voir « Sécurité »).
`delivered@resend.dev` est un destinataire simulé, pratique pour tester sans
écrire à personne.

**Le seed est destructeur.** `src/seed/index.ts` vide les collections avant de
réinsérer. À réserver au développement : il effacerait les saisies de la
cliente. Il refuse de tourner sans l'argument `confirmer` et affiche la base
visée : `pnpm seed confirmer`.

## Parcours de réservation

`/reserver` reçoit tous les boutons d'action du site (hero, cartes de cours,
calendrier, tarifs, location, « Réserver » de la nav). Structure reprise du tunnel de
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
  renseigné ; avant, Resend le refuserait. **Il ne recopie aucun texte libre**
  (ni prénom, ni message, ni date saisie) et **part au plus une fois par
  adresse sur 24 h** : il est envoyé à l'adresse que tape le visiteur, sans
  quoi le formulaire servirait à faire écrire le domaine du studio à n'importe
  qui. Les e-mails sont enregistrés en minuscules pour que cette limite tienne.
- `useReservationStore.persist` n'existe pas côté serveur : zustand n'attache
  son API que si le stockage est disponible. Y accéder sans garde fait
  répondre la page en 500.

Écart avec chuttt : les transitions d'étape passent par une animation CSS
plutôt que framer-motion, pour garder une seule bibliothèque d'animation.

**Balayage au doigt** (`useBalayage.ts`), en complément des boutons, jamais à
leur place : vers l'arrière il ramène toujours à l'étape précédente ; vers
l'avant il ne sert qu'à repasser sur ce qui est déjà renseigné. Aux étapes de
choix, il n'avance que si le choix est fait ; aux étapes de saisie, il envoie le
formulaire, donc exactement ce que fait « Suivant » (la saisie est enregistrée
et la validation s'applique) ; au récapitulatif il ne fait rien, l'envoi
restant un geste explicite. Limité au tactile, et sans effet si le geste part
d'un champ de saisie.

À confirmer avec la cliente : le délai de réponse annoncé après l'envoi
(« très vite » en attendant), le téléphone obligatoire ou non (facultatif en
attendant), et si les cours ont un nombre de places limité.

## Portraits des profs

`src/seed/assets/images/profs/` contient les portraits tirés des originaux du shooting
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

**Après tout changement de ces fichiers, relancer `pnpm seed confirmer`** : le
site sert les portraits depuis Payload/UploadThing, pas depuis ce dossier. Les
images du seed vivent hors de `public/` pour ne pas être publiées avec le site.

## Identité du studio

Les logos fournis par la cliente sont dans `content/DOSSIER PNG/` (fond noir et
fond transparent) : le mot seul (« SIMPLE »), le mot avec une petite planète, le
mot posé sur sa planète (« V2 ») et la planète seule. Les fichiers du site en
sont tirés, rognés, dans `public/images/marque/` :

| Fichier | Variante | Où |
|---|---|---|
| `planete.png` | planète seule | composant `Planete` : menu mobile (filigrane), 404, galerie vide, écran « Demande envoyée », bloc « Où nous trouver » de la page Contact (avec un point bleu pulsant et un lien « Itinéraire » vers Google Maps, mentionné dans Confidentialité) |
| `bapz-mot.png` | mot seul | pied de page, à la place du texte « BAPZ STUDIO » |
| `bapz-planete.png` | V2 | logo et icône de l'admin (`src/admin/`), inversés en thème clair par `custom.scss` |

**Le hero dessine le logo** (le mot sur sa planète) à partir du SVG de la
graphiste, `content/LOGO BAPZ- white.svg` : 75 tracés pour la planète, 4 pour
le mot (un 76ᵉ tracé, sans remplissage ni contour, est invisible et écarté). `scripts/extraire-logo-vectoriel.mjs` les copie dans
`_components/logo-vectoriel.ts` (généré, à relancer si le logo change).
`PlaneteDessinee` (serveur) rend le SVG, `DessinPlanete` (client) l'anime avec
GSAP : chaque ligne se trace (technique du `stroke-dashoffset`), se remplit,
puis le mot apparaît. Il reste ensuite fixe : la dérive lente, qui tourne de
quelques degrés, faisait pencher le mot BAPZ ; elle est réservée à la planète
seule. Ne pas partir d'une vectorisation automatique du PNG : un seul tracé en
escalier, impossible à dessiner ligne par ligne.

Le logo de la nav est le média des Réglages (variante V2, carrée) ; l'icône
d'onglet est le mot seul (`app/icon.png`), l'icône Apple la V2. L'image de
partage (`public/partage.jpg`) pose la V2 sur la photo `shoot-2`.

Aucune maquette pour ces emplacements : la planète reste discrète (opacité
0,12 à 0,14, dérive lente coupée si le visiteur réduit les animations) et ne
change jamais la mise en page — vérifié, hauteurs de page et bande du pied de
page identiques.

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

## Sécurité

Mesures posées après l'audit du 2026-09-11, chacune vérifiée sur le serveur :

- **Anti-robot** : Cloudflare Turnstile, invisible sauf doute, sur le
  formulaire de contact et l'envoi du parcours de réservation. Widget
  `_components/Turnstile.tsx`, vérification serveur `lib/antispam.ts`.
  Variables `NEXT_PUBLIC_TURNSTILE_SITE_KEY` et `TURNSTILE_SECRET_KEY` : en
  local, les clés de test de Cloudflare (dans `.env.example`) ; en production,
  celles d'un widget créé sur le domaine du site. **Sans clé secrète, tout envoi
  est refusé en production** — volontairement, pour qu'un oubli se voie.
- **Images** : pas de `remotePatterns`. Il en existait un pour `**.ufs.sh` ; il
  permettait à n'importe qui de faire traiter par notre optimiseur une image
  hébergée ailleurs, et donc d'exposer les failles de `sharp`. Ne pas le
  remettre : Payload sert toutes nos images par `/api/media/file/...`.
- **En-têtes** (`next.config.ts`) : `nosniff`, `Referrer-Policy`, interdiction
  d'affichage dans un cadre tiers, `Permissions-Policy`. HSTS est posé par
  l'hébergeur.
- **Payload** : `csrf` renseigné (adresse publique et adresses Vercel). Sans
  liste, Payload accepte le cookie de connexion quelle que soit l'origine de la
  requête. Conséquence : l'admin ouvert depuis une adresse absente de la liste
  (`127.0.0.1`, un autre port) ne reconnaît plus la session.
- **GraphQL désactivé** : le site n'en a pas l'usage, et le schéma de toutes les
  collections était lisible par tous.
- **E-mails de l'admin** (« Mot de passe oublié ») : adaptateur
  `@payloadcms/email-resend`, même expéditeur que les formulaires. Tant qu'aucun
  domaine n'est vérifié, Resend n'écrit qu'à l'adresse du compte : le compte
  admin de la cliente doit donc porter cette adresse.
- **Données structurées** : `<` échappé dans le JSON injecté par le layout.
- **Dépendances** : `sharp` 0.35.4 ; surcharge pnpm pour `dompurify`
  (`package.json`). Restent trois alertes sans impact : `esbuild` (outil de
  développement de drizzle-kit), une faille Payload sans correctif publié, qui
  ne concerne que des comptes aux droits différents — ici tous les comptes ont
  les mêmes —, et `effect` < 3.20.
- **Ne jamais surcharger `effect`.** UploadThing 7.3 exige exactement la 3.10.3.
  Une surcharge en 3.22 (posée puis retirée le 2026-09-11) cassait l'adaptateur :
  « ManagedRuntime disposed », images servies en 500 ou vides par
  `/api/media/file/...`, upload impossible. L'alerte visait
  `@hookform/resolvers`, qui ne s'en sert pas.

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

**Icônes.** `app/icon.png` (512) et `app/apple-icon.png` (180) : la planète du
logo, posée sur `#080808` — le logo est blanc sur transparent, invisible sur un
onglet clair.

La planète y est **redessinée, pleine et inversée** : disque blanc, trois
méridiens et trois parallèles sombres, inclinés de 18° comme le logo
(`scripts/generer-icones.mjs`, à relancer après tout réglage). L'onglet reçoit
le disque seul, coins transparents et cerclé de sombre pour tenir sur un onglet
clair comme sombre ; l'icône Apple garde son carré `#080808`, iOS posant
lui-même le masque arrondi et remplissant la transparence en noir. Le tracé
d'origine — 75 traits fins et blancs — disparaît à cette taille : à 16 et 32px
la moyenne des pixels donne un rond presque noir, même en épaississant les
traits (plusieurs variantes essayées, toutes illisibles). Le mot du logo, lui,
restait lisible : c'était l'icône précédente. Choix à montrer à la cliente,
puisqu'il simplifie et retourne son logo.

**Mesures.** Lighthouse 12, mobile, build de production local, le 2026-09-14 :

| Page | Perf | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|---|
| Accueil | 87 | 100 | 100 | 100 |
| Profs | 87 | 100 | 100 | 100 |
| Calendrier | 83 | 100 | 100 | 100 |
| Tarifs | 90 | 100 | 100 | 100 |
| Contact | 89 | 100 | 100 | 100 |
| Réserver | 89 | 100 | 96 | 100 |

Restent signalés, et ce sont des choix de design, pas des oublis :

- Textes de 11 px en Space Mono : 45 % du texte de `/reserver`.
- LCP autour de 3,5 s en 4G simulée, sur un texte : la page est prête plus tôt
  (FCP autour d'une seconde).
- Lighthouse compte ~600 ms de « redirections » sur chaque page : c'est un
  artefact de sa navigation initiale, aucune redirection réelle (vérifié au
  `curl`). Les mesures locales sont donc pessimistes d'autant.

**Deux réglages tirés de ces mesures, à ne pas défaire :**

- la planète du menu mobile n'est rendue **qu'après la première ouverture** du
  menu. Le panneau est fermé par une transformation, donc le navigateur la
  considérait visible et la téléchargeait sur chaque page : 111 Ko pour une
  décoration que personne n'avait demandée ;
- le **premier portrait** de `/profs` porte `priority` (`TeacherCard`,
  `prioritaire`). C'est lui qui s'affiche en premier sur téléphone ; en
  chargement différé, il arrivait à 4,6 s.

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
que le code. La liste des prestataires (Neon, Resend, Cloudflare, hébergeur)
est à relire au déploiement.

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

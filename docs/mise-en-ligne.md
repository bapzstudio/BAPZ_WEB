# Mise en ligne

> **Le site est en ligne sur `https://bapzstudio.fr` depuis le 2026-11-07.**
> Les sections 1 à 7 décrivent une séance désormais faite : elles restent ici
> parce que la table des variables et les pièges servent de référence, pas
> parce qu'il y a quelque chose à y exécuter. Ce qui reste est en section 9.

Comptes ouverts au nom de la cliente : Neon, UploadThing, Vercel, Resend,
Cloudflare, OVH pour le domaine. Matthias y est collaborateur.

---

## 1. Avant la séance, seul (30 min)

- [ ] `git push` : la branche `main` doit être à jour.
- [ ] `pnpm build` en local : doit passer sans erreur.
- [ ] Vérifier que `pnpm payload migrate` n'a rien en attente sur la base de
      développement.
- [ ] Préparer la liste des variables (section 3) dans un gestionnaire de mots
      de passe, pas dans un fichier en clair.

---

## 2. Comptes et domaine (avec elle)

- [ ] **Domaine** : achat chez le registrar de son choix, à son nom.
- [ ] **Vercel** : création du compte avec son adresse, puis import du dépôt
      GitHub. Elle reste propriétaire, Matthias est invité comme membre.
- [ ] **Cloudflare** : compte, puis *Turnstile* → *Add widget*, type
      **Managed**, domaine du site. Noter la clé de site et la clé secrète.
- [ ] **Resend** : ajouter le domaine et créer les enregistrements DNS
      demandés (SPF/DKIM) chez le registrar. La vérification peut prendre
      quelques minutes à quelques heures.

---

## 3. Variables d'environnement sur Vercel

À saisir dans *Project → Settings → Environment Variables*, pour
**Production** et **Preview**.

| Variable | Valeur |
|---|---|
| `PAYLOAD_SECRET` | nouveau secret, `node -e "console.log(crypto.randomUUID())"` |
| `DATABASE_URL` | Neon, branche **production**, hôte en `-pooler`, avec `sslmode=verify-full` au lieu du `sslmode=require` fourni (même comportement, sans l'avertissement « SECURITY WARNING » du pilote) |
| `UPLOADTHING_TOKEN` | jeton de l'application UploadThing |
| `RESEND_API_KEY` | clé API Resend |
| `CONTACT_TO_EMAIL` | boîte qui reçoit les messages |
| `CONTACT_FROM_EMAIL` | `BAPZ Studio <contact@bapzstudio.fr>` — posé le 2026-11-07, une fois le domaine vérifié chez Resend |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | clé de site du widget Cloudflare |
| `TURNSTILE_SECRET_KEY` | clé secrète du même widget |
| `NEXT_PUBLIC_SITE_URL` | `https://bapzstudio.fr` depuis le 2026-11-07 |

Sur Vercel, ces variables sont de type **Config** et non **Secret** : un secret
est en écriture seule, donc impossible à relire ou à reconvertir ensuite. Une
variable posée en Secret par erreur se supprime et se recrée, elle ne se
convertit pas.

**Pièges à connaître :**

- **`UPLOADTHING_TOKEN` doit être présent AU BUILD**, pas seulement à
  l'exécution. `next.config.ts` en tire le domaine autorisé pour les images
  (`<appId>.ufs.sh`) : sans lui au moment du déploiement, le pare-feu de
  l'optimiseur est vide et **toutes les photos du site sont cassées**, sans
  autre message d'erreur. Sur Vercel, les variables sont bien lues au build à
  condition d'être cochées pour l'environnement déployé.
- **Sans `TURNSTILE_SECRET_KEY`, tout envoi de formulaire est refusé en
  production.** C'est volontaire, pour qu'un oubli se voie tout de suite.
- Ne jamais réutiliser les clés de test Cloudflare en production : elles
  laissent tout passer.
- `NEXT_PUBLIC_SITE_URL` sans barre oblique finale. Elle sert aux adresses
  canoniques, au sitemap et aux cartes de partage : une valeur fausse se voit
  sur chaque lien partagé.
- Tant que Resend n'a pas de domaine vérifié, il n'écrit qu'à l'adresse
  d'inscription du compte : `CONTACT_TO_EMAIL` doit donc être cette adresse, et
  l'accusé de réception envoyé au visiteur reste désactivé.

---

## 4. Base de données

- [ ] **Faire tourner une nouvelle fois le mot de passe Neon**
      (*Roles → Reset password*) et reporter la nouvelle chaîne dans Vercel et
      dans le `.env` local.
- [ ] Appliquer les migrations sur la base de production :
      `DATABASE_URL="<production>" pnpm payload migrate`.
      Les 8 migrations ont été rejouées depuis une base vierge le 2026-09-14 :
      elles passent sans question interactive et sans dérive de schéma.
- [ ] **Ne jamais lancer `pnpm seed` sur la production** : il vide les
      collections avant de réinsérer le contenu d'amorçage.

---

## 5. Premier déploiement

- [ ] Déclencher le déploiement sur Vercel, vérifier qu'il réussit.
- [ ] Ouvrir l'adresse `.vercel.app` et parcourir les six pages.
- [ ] Brancher le domaine dans Vercel, puis créer les enregistrements DNS chez
      le registrar. Attendre la propagation et le certificat HTTPS.
- [ ] Mettre `NEXT_PUBLIC_SITE_URL` à jour avec le vrai domaine, puis
      redéployer — sinon les liens de partage pointent encore sur l'adresse
      temporaire.

---

## 6. Compte d'administration de la cliente

- [ ] Créer son compte sur `/admin` (le premier compte créé sur une base vierge
      est administrateur).
- [ ] Son adresse doit être celle du compte Resend tant qu'aucun domaine n'est
      vérifié, sinon le message « mot de passe oublié » ne lui parviendra pas.
- [ ] Lui faire faire une modification de bout en bout : changer un texte des
      Réglages, enregistrer, rafraîchir le site public et le voir changer.
- [ ] Lui remettre `docs/guide-administration.md`.

---

## 7. Vérifications finales, site en ligne

- [ ] Envoyer un vrai message depuis `/contact` : le mail arrive dans la boîte,
      et le widget anti-robot s'affiche sans bloquer.
- [ ] Faire une vraie demande depuis `/reserver` : elle apparaît dans
      *Suivi → Demandes* dans l'administration, et le mail part.
- [ ] Vérifier une image : une photo de prof s'affiche bien, et son adresse
      (clic droit → ouvrir l'image) contient `ufs.sh`. Une photo cassée partout
      signale presque toujours un `UPLOADTHING_TOKEN` absent au build.
- [ ] Ouvrir `/mentions-legales` et `/confidentialite` : plus aucun
      « À compléter », et **l'hébergeur renseigné** (Vercel, avec son adresse).
- [ ] Relire avec elle la liste des prestataires de la page Confidentialité :
      Neon, UploadThing, Resend, Cloudflare, Vercel.
- [ ] Partager un lien du site sur une conversation privée pour voir la carte
      de partage (image et titre).
- [ ] Demander l'indexation dans la Search Console de Google si elle le
      souhaite, avec le sitemap `/(sitemap.xml)`.

---

## 8. Après la mise en ligne

- Le site est régénéré à chaque modification faite dans l'administration ;
  l'accueil se rafraîchit en plus toutes les heures pour « Prochains cours ».
- Les demandes de réservation sont conservées trois ans au plus après le
  dernier échange, comme annoncé sur la page Confidentialité : **c'est une
  suppression manuelle**, à faire depuis l'administration.
- Prévoir un point à un mois : contenus ajoutés, premières demandes reçues,
  éventuelles retouches.
- **Chaque déploiement migre la base** (`vercel-build` → `pnpm migrer`), y
  compris un déploiement **Preview** : les variables Preview pointent sur la
  même base que la production (section 3). Une branche poussée migre donc la
  production avant même d'être fusionnée — d'où des migrations toujours
  compatibles avec le code encore en ligne.

### Modifications du 2026-10-24 (logos, couleur des événements, adresse)

Tout passe par le déploiement, sans commande à lancer. À vérifier une fois
en ligne :

- [ ] **Adresse** : « 2 rue du Jardin d'Écosse » (sans « A ») sur `/contact`,
      `/mentions-legales` et dans le lien « Itinéraire ». La migration
      `reglages_adresse_logo` a corrigé les Réglages et la FAQ.
- [ ] **Logo de la nav**, le seul rangé en base : la même migration a remplacé
      son fichier chez UploadThing. S'il montre encore l'ancienne planète en
      fil de fer, le journal du build porte « Logo de la nav NON remplacé » :
      l'envoyer à la main, *Réglages du site → Logo*, avec
      `public/images/marque/bapz-planete.png`.
- [ ] **Icône d'onglet** : le navigateur la garde en cache ; la vérifier dans
      une fenêtre privée.
- [ ] **Fiche Google Business** : même adresse, « 2 rue », sans quoi Google
      voit deux adresses différentes.

---

## 9. Bascule sur `bapzstudio.fr` — fait le 2026-11-07

Domaine acheté chez **OVH**, zone DNS hébergée chez OVH (`dns103.ovh.net`,
`ns103.ovh.net`), site servi par Vercel.

**Ce qui a été posé :**

| Type | Nom | Cible |
|---|---|---|
| `A` | racine | `216.198.79.1` |
| `CNAME` | `www` | `f6faad3ffb5427aa.vercel-dns-017.com.` |

Côté Vercel : `bapzstudio.fr` en production, `www.bapzstudio.fr` et
`bapz-web.vercel.app` en **redirection 308** vers l'apex. Puis
`NEXT_PUBLIC_SITE_URL` mise à jour **et redéploiement**, Resend vérifié sur le
domaine, `CONTACT_FROM_EMAIL` renseignée, redéploiement.

**Vérifié de bout en bout le jour même** : certificat HTTPS, URL canonique
(`Ctrl+U` → `canonical`), envoi du formulaire de contact, demande complète
dans le tunnel, réception côté studio **depuis `contact@bapzstudio.fr`**, et
accusé de réception reçu par le visiteur — ce dernier mail n'était jamais
parti auparavant, faute de domaine vérifié.

**Trois pièges rencontrés, pour la prochaine fois :**

- **Un `CNAME` ne peut coexister avec aucun autre enregistrement du même nom.**
  OVH avait posé un `A` de parking (`213.186.33.5`) **et** un `TXT`
  (`"3|welcome"`) sur `www` : le `CNAME` de Vercel est refusé tant que les deux
  ne sont pas supprimés. OVH les liste dans son message d'erreur, mais la
  cause n'est évidente que si on connaît la règle. Penser aussi à l'`AAAA` de
  la racine, qui enverrait les visiteurs IPv6 ailleurs que les autres.
- **L'onglet « DNS zone » d'OVH peut renvoyer vers une page de commande**, qui
  laisse croire que la zone est payante. L'onglet « DNS servers » tranche : des
  serveurs OVH actifs signifient que la zone existe.
- **Changer `NEXT_PUBLIC_SITE_URL` ne suffit pas** : la valeur est inlinée dans
  le bundle au build. Sans redéploiement, le site continue de servir
  l'ancienne adresse en canonique, et le garde-fou de `seo.ts` ne le voit pas —
  il ne détecte qu'une variable *vide*, jamais une variable *périmée*.
  Décocher « Use existing Build Cache » au redéploiement.

**Ce qui reste :**

- [ ] **Google Search Console** : propriété créée le 2026-11-07, aucune page
      indexée au départ, ce qui est normal. Soumettre le sitemap
      (`https://bapzstudio.fr/sitemap.xml`) et demander l'indexation de
      l'accueil. Compter de quelques jours à quelques semaines.
- [ ] **Core Web Vitals** : c'est la Search Console qui dira si le dégradé
      animé du hero coûte quelque chose en conditions réelles (cf. « Dégradé
      animé du hero » dans `CLAUDE.md`, accueil à 57 sous Lighthouse). Compter
      trois à quatre semaines de collecte avant de juger. Deux replis étaient
      notés : démarrer le dégradé au premier geste du visiteur, ou passer à une
      version CSS.
- [ ] **Hébergeur dans les mentions légales** : à saisir par la cliente dans
      les Réglages (Vercel, avec son adresse). Dernière mention
      « À compléter » du site.
- [ ] **Fiche Google Business** à aligner sur l'adresse et le domaine.

# Mise en ligne — déroulé de la séance

Checklist à suivre dans l'ordre, avec la cliente, comptes ouverts à son nom.
Compter une heure trente. Les comptes Neon et UploadThing existent déjà ; il
reste l'hébergeur, le domaine, Resend et Cloudflare.

**Prérequis :** les informations légales et le planning réel doivent être
saisis dans l'administration (cf. `questions-cliente.md`), sinon le site part
avec des mentions « À compléter ».

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
| `DATABASE_URL` | Neon, branche **production**, hôte en `-pooler` |
| `UPLOADTHING_TOKEN` | jeton de l'application UploadThing |
| `RESEND_API_KEY` | clé API Resend |
| `CONTACT_TO_EMAIL` | boîte qui reçoit les messages |
| `CONTACT_FROM_EMAIL` | `BAPZ Studio <contact@ledomaine.fr>` — **seulement une fois le domaine vérifié chez Resend** |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | clé de site du widget Cloudflare |
| `TURNSTILE_SECRET_KEY` | clé secrète du même widget |
| `NEXT_PUBLIC_SITE_URL` | d'abord l'adresse `.vercel.app`, puis le vrai domaine |

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

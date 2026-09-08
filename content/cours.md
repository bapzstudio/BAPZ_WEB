# Contenu reçu de la cliente - cours & profs

Notes brutes collectées au fil des échanges, à intégrer dans Sanity Studio
(`teacher` + `course`) une fois le projet Sanity créé. Ne pas coder en dur
dans `web/` - passer par le CMS.

Adresse unique confirmée pour tous les cours (→ champ `siteSettings.address`) :
**Bapz Studio - 2A rue du Jardin d'Écosse, Ars-Laquenexy**

## Reçu le 2026-09-01 (2e et 3e shoot photo)

| Prof (teacher) | Cours (course.title) | Jour | Horaire |
|---|---|---|---|
| Lena Bapz | Heels niveau intermédiaire | Mardi | 19h00 - 20h30 |
| Lena Bapz | Hip Hop / Commercial | Jeudi | 19h00 - 20h30 |
| Lara | Street Enfant | Mardi | 18h00 - 19h00 |

Remarques :
- Lena Bapz anime 2 cours différents → 1 seul document `teacher`, 2 documents `course` qui y font référence.
- "Heels niveau intermédiaire" → `course.level` = Intermédiaire, à séparer du titre.
- Photos du shoot pas encore reçues/attachées ici - à uploader dans `teacher.photo` / `course.image` quand disponibles.

## Reçu - logo & photos (intégrés au site le 2026-09-01)

- Logo officiel "BAPZ" (police blackletter + globe wireframe), fourni en `.ai` et `.png` (fond noir / fond transparent, versions complète et "simple"). Intégré dans la nav (`web/public/images/logo/bapz-logo.png`), recadré depuis `DOSSIER PNG/FOND TRANSPARENT`.
- 4 photos de shooting (`0V5A8226/8269/8484/8713.JPG`), réorientées (EXIF) et compressées dans `web/public/images/gallery/shoot-1..4.jpg`. Intégrées dans la section Galerie.
- **Non attribuées** : on ne sait pas laquelle de ces photos correspond à Lena Bapz vs Lara - elles sont utilisées en galerie générique, pas comme portraits de profs. À confirmer avec la cliente si on veut les réutiliser en photo de profil.
- `2.png`/`3.png` = planches d'exploration typo pour le wordmark (Faseh, imbue, wasbusstickNP…) - utiles pour comprendre le choix de police du logo, pas à intégrer tel quel au site.

## ⚠ Conflit à arbitrer : maquette CALENDRIER vs message de la cliente

Le planning codé dans `web/src/data/mock.ts` reproduit la maquette
`maquette/CALENDRIER.png`, dont le contenu est **fictif** (rempli par la
graphiste). Il contredit ce que Léna a envoyé :

| Point | Message de Léna | Maquette CALENDRIER |
|---|---|---|
| Street Enfant(s) | **Mardi** 18h-19h | **Jeudi** 18h-19h |
| Heels | Mardi 19h-20h30, niveau intermédiaire | idem ✓ |
| Hip Hop / Commercial | Jeudi 19h-20h30 | "Commercial / Hi-Hop", idem ✓ |
| Cours non mentionnés par elle | — | Intervenant (lundi + mercredi), Contemporain Lyrical, Yogalates, Training libre |
| Profs non mentionnés par elle | — | Ilan, Alessia, Hannane |

À trancher avec elle avant la mise en ligne. Deux coquilles de la maquette ont
été corrigées au passage : "Tous niveayx" → "Tous niveaux", et "CCOMMERCIAL"
→ "COMMERCIAL" dans le pied de page.

## Encore manquant (à demander à la cliente)
- Tarifs / formules réels (poste "Tarifs et formules")
- Descriptifs texte de chaque cours (au-delà du titre/niveau)
- Bio + photo de la fondatrice, présentation du studio
- Infos location de salle (tarifs, capacité, équipements, photos)
- Réseaux sociaux (liens), horaires d'ouverture générales, téléphone/email de contact
- Textes bannière d'accueil
- Photos/vidéos galerie

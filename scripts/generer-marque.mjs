// Génère tous les fichiers du site tirés du logo, depuis les SVG de la
// graphiste (`content/logos/`, reçus le 2026-10-24) :
//
// - `public/images/marque/bapz-mot.png`, le mot seul : pied de page ;
// - `public/images/marque/bapz-planete.png`, le mot sur sa planète (V2) :
//   logo et icône de l'admin ;
// - `src/seed/assets/images/logo/bapz-logo.png`, la même V2 : logo de la nav,
//   envoyé dans Payload par le seed et par la migration du 2026-10-24 ;
// - `public/images/marque/planete.png`, la planète seule : composant Planete ;
// - `src/app/icon.png` et `src/app/apple-icon.png`, les icônes ;
// - `public/partage.jpg`, l'image de partage.
//
// Le logo qui se dessine dans le hero a son propre script :
// `scripts/extraire-logo-vectoriel.mjs`.
//
// Relancer si un logo change : `node scripts/generer-marque.mjs`
import fs from "fs";
import sharp from "sharp";

const LOGOS = "content/logos";
const FOND = "#080808";

/**
 * Le SVG rendu à un pixel par unité, sans son fond noir, rogné au plus près
 * du dessin puis complété en carré si `carre`.
 *
 * Chaque fichier de la graphiste pose un rectangle noir sous le dessin : on le
 * retire pour obtenir un fond transparent.
 */
async function rendu(nom, { carre = false } = {}) {
  const source = fs.readFileSync(`${LOGOS}/${nom}`, "utf8");
  const fonds = source.match(/<rect\b[^>]*\/>/g) ?? [];
  if (fonds.length !== 1) {
    throw new Error(
      `${nom} : ${fonds.length} rectangle(s), un seul attendu (le fond).`,
    );
  }
  const { data, info } = await sharp(Buffer.from(source.replace(fonds[0], "")))
    .png()
    .trim()
    .toBuffer({ resolveWithObject: true });
  if (!carre || info.width === info.height) return data;

  const cote = Math.max(info.width, info.height);
  const dx = cote - info.width;
  const dy = cote - info.height;
  return sharp(data)
    .extend({
      left: Math.floor(dx / 2),
      right: Math.ceil(dx / 2),
      top: Math.floor(dy / 2),
      bottom: Math.ceil(dy / 2),
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
}

const ecrire = async (image, fichier) => {
  const info = await image.toFile(fichier);
  console.log(
    `${fichier} — ${info.width}x${info.height}, ${Math.round(info.size / 1024)} Ko`,
  );
};

const mot = await rendu("LOGO BAPZ SIMPLE - LÉNA.svg");
const v2 = await rendu("LOGO BAPZ V2 - LÉNA.svg", { carre: true });
const planete = await rendu("PLANÈTE - BAPZ.svg", { carre: true });

// Fichiers de marque : mêmes dimensions qu'avec l'ancien logo, pour que rien
// ne bouge dans les composants qui les affichent.
await ecrire(
  sharp(mot)
    .resize({ width: 600, kernel: "lanczos3" })
    .png({ compressionLevel: 9 }),
  "public/images/marque/bapz-mot.png",
);
for (const fichier of [
  "public/images/marque/bapz-planete.png",
  "src/seed/assets/images/logo/bapz-logo.png",
]) {
  await ecrire(
    sharp(v2)
      .resize(512, 512, { kernel: "lanczos3" })
      .png({ compressionLevel: 9 }),
    fichier,
  );
}
await ecrire(
  sharp(planete)
    .resize(1400, 1400, { kernel: "lanczos3" })
    .png({ compressionLevel: 9 }),
  "public/images/marque/planete.png",
);

// Icônes : la planète de la graphiste telle quelle, blanche sur `#080808`.
// L'ancienne, 75 traits fins, disparaissait à 16 et 32 px et avait dû être
// redessinée ; les traits au pinceau de la nouvelle tiennent à ces tailles.
//
// - `icon.png`, l'onglet : sur un disque sombre, coins transparents, pour
//   rester visible sur un onglet clair comme sur un onglet sombre ;
// - `apple-icon.png`, l'écran d'accueil iOS : sur un carré `#080808`, parce
//   qu'iOS pose lui-même le masque arrondi et remplit la transparence en noir.
const PART_PLANETE = 0.88; // diamètre de la planète, rapporté au côté de l'icône

for (const [taille, fichier, carre] of [
  [512, "src/app/icon.png", false],
  [180, "src/app/apple-icon.png", true],
]) {
  const dessin = await sharp(planete)
    .resize(Math.round(taille * PART_PLANETE), null, { kernel: "lanczos3" })
    .toBuffer();
  const fond = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${taille}" height="${taille}">` +
      (carre
        ? `<rect width="${taille}" height="${taille}" fill="${FOND}"/>`
        : `<circle cx="${taille / 2}" cy="${taille / 2}" r="${taille / 2}" fill="${FOND}"/>`) +
      `</svg>`,
  );
  await ecrire(
    sharp(fond)
      .composite([{ input: dessin, gravity: "center" }])
      // Palette : deux teintes et leurs dégradés d'anticrénelage. En couleurs
      // vraies l'icône pesait 39 Ko, récupérés sur chaque page.
      .png({ palette: true, colors: 16, compressionLevel: 9, effort: 10 }),
    fichier,
  );
}

// Image de partage : la photo `shoot-2` assombrie, la V2 en haut à gauche.
// Cadrage et assombrissement retrouvés sur l'image précédente (photo réduite à
// 1204 px de large, noir à 60 %), logo à la même place et à la même taille.
const LARGEUR = 1200;
const HAUTEUR = 630;
const voile = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${LARGEUR}" height="${HAUTEUR}">` +
    `<rect width="${LARGEUR}" height="${HAUTEUR}" fill="#000" fill-opacity="0.6"/>` +
    `</svg>`,
);
const photo = await sharp("src/seed/assets/images/gallery/shoot-2.jpg")
  .resize({ width: 1204, kernel: "lanczos3" })
  .extract({ left: 2, top: 678, width: LARGEUR, height: HAUTEUR })
  .toBuffer();
await ecrire(
  sharp(photo)
    .composite([
      { input: voile },
      {
        input: await sharp(v2)
          .resize(290, 290, { kernel: "lanczos3" })
          .toBuffer(),
        left: 70,
        top: 55,
      },
    ])
    .jpeg({ quality: 70, mozjpeg: true }),
  "public/partage.jpg",
);

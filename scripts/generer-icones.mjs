// Génère les icônes du site : la planète du logo, simplifiée et inversée —
// disque blanc, méridiens et parallèles sombres, inclinés comme le logo.
//
// Pourquoi redessiner plutôt qu'extraire le tracé de la graphiste : ses 75
// traits fins et blancs disparaissent à 16 et 32px, la moyenne des pixels
// donnant un rond presque noir. Six traits épais, eux, tiennent.
//
// Deux sorties :
// - `icon.png`, l'onglet : disque seul, coins transparents, cerclé de sombre
//   pour rester visible sur un onglet clair comme sur un onglet sombre ;
// - `apple-icon.png`, l'écran d'accueil iOS : même dessin sur un carré
//   `#080808`, parce qu'iOS pose lui-même le masque arrondi et remplit la
//   transparence en noir.
//
// Relancer après tout réglage : `node scripts/generer-icones.mjs`
import sharp from "sharp";

const FOND = "#080808";
const RAYON = 47; // sur une grille de 100
const EPAISSEUR = 3;
const MERIDIENS = 3;
const PARALLELES = 3;
const INCLINAISON = -18; // même bascule que la planète du logo

function planete({ carre }) {
  const traits = [];
  for (let i = 1; i <= MERIDIENS; i++) {
    const rx = (RAYON * i) / (MERIDIENS + 1);
    traits.push(
      `<ellipse cx="50" cy="50" rx="${rx.toFixed(1)}" ry="${RAYON}"/>`,
    );
  }
  for (let i = 1; i <= PARALLELES; i++) {
    const dy = (2 * RAYON * i) / (PARALLELES + 1) - RAYON;
    const demi = Math.sqrt(Math.max(RAYON * RAYON - dy * dy, 0));
    traits.push(
      `<line x1="${(50 - demi).toFixed(1)}" y1="${(50 + dy).toFixed(1)}" x2="${(50 + demi).toFixed(1)}" y2="${(50 + dy).toFixed(1)}"/>`,
    );
  }

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 100 100">` +
      `<defs><clipPath id="disque"><circle cx="50" cy="50" r="${RAYON}"/></clipPath></defs>` +
      (carre ? `<rect width="100" height="100" fill="${FOND}"/>` : "") +
      `<circle cx="50" cy="50" r="${RAYON}" fill="#ffffff"/>` +
      // Les traits sont rognés sur le disque : sans quoi les méridiens
      // dépasseraient du cercle une fois inclinés.
      `<g clip-path="url(#disque)" transform="rotate(${INCLINAISON} 50 50)" fill="none" stroke="${FOND}" stroke-width="${EPAISSEUR}" stroke-linecap="round">` +
      traits.join("") +
      `</g>` +
      `<circle cx="50" cy="50" r="${RAYON - EPAISSEUR / 2}" fill="none" stroke="${FOND}" stroke-width="${EPAISSEUR}"/>` +
      `</svg>`,
  );
}

for (const [taille, fichier, carre] of [
  [512, "src/app/icon.png", false],
  [180, "src/app/apple-icon.png", true],
]) {
  await sharp(planete({ carre }))
    .resize(taille, taille, { kernel: "lanczos3" })
    .png({ compressionLevel: 9 })
    .toFile(fichier);
  console.log(
    `${fichier} — ${taille}x${taille}${carre ? "" : ", coins transparents"}`,
  );
}

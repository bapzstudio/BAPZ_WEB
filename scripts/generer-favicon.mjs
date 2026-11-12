/**
 * Construit `src/app/favicon.ico` à partir de `src/app/icon.png`.
 *
 * Pourquoi un `.ico` alors que `app/icon.png` suffit aux navigateurs : Next
 * sert ce dernier sous une adresse à empreinte (`/icon.png?icon.<hash>.png`),
 * et `/favicon.ico` répondait 404. C'est le chemin de repli historique, que
 * Google et beaucoup d'outils (lecteurs RSS, aperçus de liens, favoris)
 * sondent avant de lire le `<link rel="icon">` de la page.
 *
 * Trois tailles dans le fichier : 16 et 32 pour les onglets, 48 parce que
 * Google préfère un multiple de 48. Chaque image est un PNG encapsulé dans
 * l'enveloppe ICO, ce que lisent tous les navigateurs actuels.
 *
 * À relancer après `scripts/generer-marque.mjs` si le logo change.
 */
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const SOURCE = "src/app/icon.png";
const SORTIE = "src/app/favicon.ico";
const TAILLES = [16, 32, 48];

const images = await Promise.all(
  TAILLES.map((t) =>
    sharp(SOURCE).resize(t, t, { kernel: "lanczos3" }).png().toBuffer(),
  ),
);

// En-tête ICONDIR : 2 octets réservés, type 1 (icône), nombre d'images.
const entete = Buffer.alloc(6);
entete.writeUInt16LE(0, 0);
entete.writeUInt16LE(1, 2);
entete.writeUInt16LE(images.length, 4);

let decalage = 6 + 16 * images.length;
const entrees = images.map((png, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(TAILLES[i] === 256 ? 0 : TAILLES[i], 0); // largeur
  e.writeUInt8(TAILLES[i] === 256 ? 0 : TAILLES[i], 1); // hauteur
  e.writeUInt8(0, 2); // palette : aucune
  e.writeUInt8(0, 3); // réservé
  e.writeUInt16LE(1, 4); // plans
  e.writeUInt16LE(32, 6); // bits par pixel
  e.writeUInt32LE(png.length, 8);
  e.writeUInt32LE(decalage, 12);
  decalage += png.length;
  return e;
});

writeFileSync(SORTIE, Buffer.concat([entete, ...entrees, ...images]));
console.log(
  `${SORTIE} — ${TAILLES.join(", ")} px, ${(
    Buffer.concat([entete, ...entrees, ...images]).length / 1024
  ).toFixed(1)} Ko`,
);

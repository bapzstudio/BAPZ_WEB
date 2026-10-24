// Extrait les tracés du logo vectoriel de la graphiste (la V2, le mot posé sur
// sa planète) vers un module TypeScript utilisé par le dessin animé du logo
// dans le hero.
//
//   node scripts/extraire-logo-vectoriel.mjs
//
// À relancer seulement si le fichier du logo change. Les autres fichiers tirés
// du logo (images, icônes, image de partage) : `scripts/generer-marque.mjs`.
import fs from "fs";
import path from "path";
import sharp from "sharp";

const SOURCE = "content/logos/LOGO BAPZ V2 - LÉNA.svg";
const SORTIE = "src/app/(frontend)/_components/logo-vectoriel.ts";

const svg = fs.readFileSync(SOURCE, "utf8");

const transformations = (svg.match(/transform=/g) || []).length;
if (transformations > 0) {
  throw new Error(
    `${transformations} attribut(s) transform : le script ne les reporte pas.`,
  );
}

const debutPlanete = svg.indexOf('<g id="PLAN');
const debutMot = svg.indexOf('<g id="bapz"');
const fonds = svg.match(/<rect\b[^>]*\/>/g) ?? [];
if (debutPlanete < 0 || debutMot < 0 || fonds.length !== 1) {
  throw new Error(
    "Structure inattendue : groupe PLANÈTE, groupe bapz ou rectangle de fond introuvable.",
  );
}

// Seuls les tracés remplis de blanc se voient : on retrouve leur classe dans
// la feuille de style du fichier plutôt que de la supposer, la graphiste
// numérotant ses classes différemment d'un export à l'autre.
const classesBlanches = new Set(
  [...svg.matchAll(/\.([\w-]+)\s*\{[^}]*fill:\s*#fff(?:fff)?\s*;/gi)].map(
    (regle) => regle[1],
  ),
);
const traces = (morceau) =>
  [...morceau.matchAll(/<path\b[^>]*>/g)]
    .map((balise) => ({
      classe: balise[0].match(/class="([^"]+)"/)?.[1],
      d: balise[0].match(/\bd="([^"]+)"/)?.[1],
    }))
    .filter((t) => t.d && classesBlanches.has(t.classe))
    .map((t) => t.d);

const planete = traces(svg.slice(debutPlanete, debutMot));

// Dans la V2, la planète est estompée derrière le mot (opacité de son groupe,
// 0,2 dans le fichier du 2026-10-24) : c'est ce qui garde le mot lisible sur
// des traits au pinceau aussi épais que ses lettres. On reporte ce dosage.
const opacites = Object.fromEntries(
  [...svg.matchAll(/\.([\w-]+)\s*\{[^}]*(?<![\w-])opacity:\s*([\d.]+)/g)].map(
    (regle) => [regle[1], Number(regle[2])],
  ),
);
const opacitePlanete = [
  ...svg.slice(debutPlanete, debutMot).matchAll(/<g\b[^>]*class="([^"]+)"/g),
].reduce((opacite, groupe) => opacite * (opacites[groupe[1]] ?? 1), 1);
const mot = traces(svg.slice(debutMot));
const total = (svg.match(/<path\b/g) || []).length;

// Le fichier fait 3000 x 3000, fond noir compris ; le dessin n'en occupe que
// le milieu. Le viewBox est ramené à un carré centré sur la planète, comme
// l'était le fichier précédent, pour que le placement du hero (boîte carrée)
// ne change pas. Boîte englobante mesurée sur un rendu sans le fond, à un
// pixel par unité, élargie d'une unité de chaque côté.
const { info } = await sharp(Buffer.from(svg.replace(fonds[0], "")))
  .png()
  .trim()
  .toBuffer({ resolveWithObject: true });
const cote = Math.max(info.width, info.height) + 2;
const x = -info.trimOffsetLeft + info.width / 2 - cote / 2;
const y = -info.trimOffsetTop + info.height / 2 - cote / 2;
const viewBox = `${x} ${y} ${cote} ${cote}`;

const contenu = `// GÉNÉRÉ par scripts/extraire-logo-vectoriel.mjs depuis ${SOURCE}.
// Ne pas modifier à la main : relancer le script si le logo change.

export const VIEWBOX = ${JSON.stringify(viewBox)};

/** Opacité de la planète par rapport au mot, comme dans le fichier. */
export const OPACITE_PLANETE = ${opacitePlanete};

/** Coups de pinceau de la planète, un tracé par trait. */
export const TRACES_PLANETE: readonly string[] = ${JSON.stringify(planete, null, 2)};

/** Lettres du mot BAPZ. */
export const TRACES_MOT: readonly string[] = ${JSON.stringify(mot, null, 2)};
`;

fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
fs.writeFileSync(SORTIE, contenu);
console.log(
  `viewBox ${viewBox} | planète : ${planete.length} tracés, opacité ${opacitePlanete} | mot : ${mot.length} tracés | ignorés : ${total - planete.length - mot.length} | ${Math.round(contenu.length / 1024)} Ko écrits dans ${SORTIE}`,
);

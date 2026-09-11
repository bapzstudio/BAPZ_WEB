// Extrait les tracés du logo vectoriel de la graphiste
// (content/LOGO BAPZ- white.svg) vers un module TypeScript utilisé par le
// dessin animé de la planète dans le hero.
//
//   node scripts/extraire-logo-vectoriel.mjs
//
// À relancer seulement si le fichier du logo change.
import fs from "fs";
import path from "path";

const SOURCE = "content/LOGO BAPZ- white.svg";
const SORTIE = "src/app/(frontend)/_components/logo-vectoriel.ts";

const svg = fs.readFileSync(SOURCE, "utf8");

const transformations = (svg.match(/transform=/g) || []).length;
if (transformations > 0) {
  throw new Error(`${transformations} attribut(s) transform : le script ne les reporte pas.`);
}

const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1];
const debutPlanete = svg.indexOf('<g id="PLAN');
const debutMot = svg.indexOf('<g id="bapz"');
if (!viewBox || debutPlanete < 0 || debutMot < 0) {
  throw new Error("Structure inattendue : viewBox, groupe PLANÈTE ou groupe bapz introuvable.");
}

// Seuls les tracés remplis (`cls-2`) se voient ; le fichier contient aussi un
// tracé sans remplissage ni contour (`cls-3`), invisible, écarté ici.
const traces = (morceau) =>
  [...morceau.matchAll(/<path\b[^>]*>/g)]
    .map((balise) => ({
      classe: balise[0].match(/class="([^"]+)"/)?.[1],
      d: balise[0].match(/\bd="([^"]+)"/)?.[1],
    }))
    .filter((t) => t.d && t.classe === "cls-2")
    .map((t) => t.d);

const planete = traces(svg.slice(debutPlanete, debutMot));
const mot = traces(svg.slice(debutMot));
const total = (svg.match(/<path\b/g) || []).length;

const contenu = `// GÉNÉRÉ par scripts/extraire-logo-vectoriel.mjs depuis ${SOURCE}.
// Ne pas modifier à la main : relancer le script si le logo change.

export const VIEWBOX = ${JSON.stringify(viewBox)};

/** Méridiens et parallèles de la planète, un tracé par ligne. */
export const TRACES_PLANETE: readonly string[] = ${JSON.stringify(planete, null, 2)};

/** Lettres du mot BAPZ. */
export const TRACES_MOT: readonly string[] = ${JSON.stringify(mot, null, 2)};
`;

fs.mkdirSync(path.dirname(SORTIE), { recursive: true });
fs.writeFileSync(SORTIE, contenu);
console.log(
  `viewBox ${viewBox} | planète : ${planete.length} tracés | mot : ${mot.length} tracés | ignorés : ${total - planete.length - mot.length} | ${Math.round(contenu.length / 1024)} Ko écrits dans ${SORTIE}`
);

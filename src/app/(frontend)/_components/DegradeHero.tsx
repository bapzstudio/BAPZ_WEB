"use client";

import { useEffect, useRef } from "react";

/**
 * Dégradé animé derrière le hero : des nappes de bleu sombre qui tournent et
 * ondulent lentement. Shader repris de Grainient (reactbits.dev). Essayé le
 * 2026-09-15 après les fibres (GhostFibers) et les vagues (GradientWaves).
 *
 * Adapté au site :
 * - **palette** tirée de `--glow` (#8fb4ff) : base au noir du site, accent
 *   x 0,25, clair x 0,4. Le clair est plafonné pour que le gris du sous-titre
 *   (#c8c8c8) garde 4,5:1 là où il passe derrière : à x 0,45, avec les halos
 *   CSS peints par-dessus, il tombait à 3,9:1 derrière le surtitre ;
 * - **halos CSS du hero effacés** une fois le dégradé affiché (`data-degrade`
 *   sur `.hero-glow`) : il les remplace, et leur couche du dessus éclaircissait
 *   le fond derrière le texte ;
 * - **contraste 1 au lieu de 1,5** : à 1,5 ces bleus sombres tombaient au noir
 *   pur ;
 * - **plus lent** : 0,15 au lieu de 0,25 ;
 * - **grain du shader à 0** : le site a déjà le sien (`body::after`) ;
 * - **moitié de la résolution** (0,5), sans perte sur un dégradé lisse, et
 *   **30 images par seconde** ; pause hors écran et onglet masqué ;
 * - **démarré après la page**, au premier moment libre après `load` ;
 * - **mouvement réduit** : une image fixe, sans boucle ;
 * - **repli** : sans WebGL 2, sans processeur graphique, si le shader ne se
 *   lie pas, si le contexte est perdu, ou sans JavaScript, les halos CSS de
 *   `.hero-glow` restent.
 *
 * **WebGL 2 écrit à la main, sans bibliothèque.** L'original passe par `ogl`
 * (131 Ko), qui n'apportait ici qu'un triangle couvrant le canvas. Le shader
 * est compilé en parallèle (`KHR_parallel_shader_compile`) et son état
 * interrogé sans bloquer ; on ne dessine qu'une fois la compilation finie.
 *
 * Lighthouse note l'accueil 57 au lieu de 81 avec ce dégradé, alors que ses
 * appels WebGL sont mesurés à 0-1 ms : choix assumé, détail et pistes dans
 * CLAUDE.md (« Dégradé animé du hero »).
 *
 * Le dégradé est opaque : le bas du hero s'efface en CSS (`.degrade-hero`).
 */

const REGLAGES = {
  color1: "#394866",
  color2: "#242d40",
  color3: "#080808",
  timeSpeed: 0.15,
  colorBalance: 0,
  warpStrength: 1,
  warpFrequency: 5,
  warpSpeed: 2,
  warpAmplitude: 50,
  blendAngle: 0,
  blendSoftness: 0.05,
  rotationAmount: 500,
  noiseScale: 2,
  grainAmount: 0,
  grainScale: 2,
  contrast: 1,
  gamma: 1,
  saturation: 1,
  centerX: 0,
  centerY: 0,
  zoom: 0.9,
  /** Résolution du canvas, en fraction de sa taille affichée. */
  resolution: 0.5,
  fps: 30,
};

/** Instant de l'image fixe en mouvement réduit, en secondes. */
const TEMPS_FIGE = 6;

/** Délai entre deux interrogations de la compilation parallèle, en ms. */
const ATTENTE_COMPILATION = 50;

const hexVersRgb = (hex: string): [number, number, number] => {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return [1, 1, 1];
  return [
    parseInt(m[1], 16) / 255,
    parseInt(m[2], 16) / 255,
    parseInt(m[3], 16) / 255,
  ];
};

const vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform float uLightMode;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);

  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;

  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);

  vec3 colLav=uColor1;
  vec3 colOrg=uColor2;
  vec3 colDark=uColor3;
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 blendRot=Rot(radians(uBlendAngle));
  float blendX=(tuv*blendRot).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  float v0=0.5-b+s;
  float v1=-0.3-b-s;
  vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));
  vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));
  vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));

  vec2 grainUv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);}
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;

  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);
  if(uLightMode>0.5){
    float energy=max(max(col.r,col.g),col.b);
    vec3 hue=col/max(energy,0.001);
    float chroma=length(col-vec3(dot(col,vec3(0.333333))));
    float coverage=clamp(0.12+chroma*1.15+energy*0.18,0.0,0.88);
    col=mix(vec3(1.0),clamp(hue*0.58+col*0.18,0.0,1.0),coverage);
  }

  o=vec4(col,1.0);
}
void main(){
  vec4 o=vec4(0.0);
  mainImage(o,gl_FragCoord.xy);
  fragColor=o;
}
`;

/** Uniformes fixes du shader, posés une fois après la compilation. */
const UNIFORMES_FIXES: Record<string, number> = {
  uTimeSpeed: REGLAGES.timeSpeed,
  uColorBalance: REGLAGES.colorBalance,
  uWarpStrength: REGLAGES.warpStrength,
  uWarpFrequency: REGLAGES.warpFrequency,
  uWarpSpeed: REGLAGES.warpSpeed,
  uWarpAmplitude: REGLAGES.warpAmplitude,
  uBlendAngle: REGLAGES.blendAngle,
  uBlendSoftness: REGLAGES.blendSoftness,
  uRotationAmount: REGLAGES.rotationAmount,
  uNoiseScale: REGLAGES.noiseScale,
  uGrainAmount: REGLAGES.grainAmount,
  uGrainScale: REGLAGES.grainScale,
  uGrainAnimated: 0,
  uContrast: REGLAGES.contrast,
  uGamma: REGLAGES.gamma,
  uSaturation: REGLAGES.saturation,
  uZoom: REGLAGES.zoom,
  uLightMode: 0,
};

/** Moteur de rendu logiciel : chaque image passerait par le processeur. */
const RENDU_LOGICIEL = /swiftshader|llvmpipe|softpipe|software|basic render/i;

export function DegradeHero({ className = "" }: { className?: string }) {
  const conteneurRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const conteneur = conteneurRef.current;
    if (!conteneur) return undefined;
    const hero = conteneur.closest<HTMLElement>(".hero-glow");

    let annule = false;
    let arreter: (() => void) | undefined;
    let attenteLibre: number | undefined;
    let attenteMinuteur: ReturnType<typeof setTimeout> | undefined;

    const demarrer = async () => {
      if (annule) return;
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl2", {
        alpha: false,
        antialias: false,
        depth: false,
        stencil: false,
        failIfMajorPerformanceCaveat: true,
      });
      // Sans WebGL 2 (le shader est en GLSL 3.00), on garde les halos CSS.
      if (!gl) return;
      const perdreContexte = () =>
        gl.getExtension("WEBGL_lose_context")?.loseContext();

      // Sans processeur graphique, le navigateur dessine en logiciel et chaque
      // image bloque la page. `failIfMajorPerformanceCaveat` ne suffit pas :
      // Chrome accorde encore le contexte avec SwiftShader (vérifié). Le nom
      // du moteur tranche ; Chrome et Safari le masquent sous « WebKit
      // WebGL », Firefox le donne directement.
      let moteur = String(gl.getParameter(gl.RENDERER));
      if (/^webkit webgl$/i.test(moteur)) {
        const infos = gl.getExtension("WEBGL_debug_renderer_info");
        if (infos)
          moteur = String(gl.getParameter(infos.UNMASKED_RENDERER_WEBGL));
      }
      if (RENDU_LOGICIEL.test(moteur)) {
        perdreContexte();
        return;
      }

      const compiler = (type: number, source: string) => {
        const shader = gl.createShader(type);
        if (!shader) return null;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        return shader;
      };
      const shaderSommets = compiler(gl.VERTEX_SHADER, vertex);
      const shaderPixels = compiler(gl.FRAGMENT_SHADER, fragment);
      const programme = gl.createProgram();
      if (!shaderSommets || !shaderPixels || !programme) {
        perdreContexte();
        return;
      }
      gl.attachShader(programme, shaderSommets);
      gl.attachShader(programme, shaderPixels);
      gl.bindAttribLocation(programme, 0, "position");
      gl.linkProgram(programme);

      // Compilation en parallèle : on interroge son état sans bloquer. Lire
      // `LINK_STATUS` tout de suite forcerait le navigateur à attendre la fin
      // de la compilation d'un bloc. Sans l'extension, la lecture reste
      // bloquante.
      const parallele = gl.getExtension("KHR_parallel_shader_compile");
      if (parallele) {
        while (
          !gl.getProgramParameter(programme, parallele.COMPLETION_STATUS_KHR)
        ) {
          await new Promise((fin) => setTimeout(fin, ATTENTE_COMPILATION));
          if (annule) {
            perdreContexte();
            return;
          }
        }
      }
      // Un shader qui ne se lie pas afficherait un canvas noir : on renonce.
      if (!gl.getProgramParameter(programme, gl.LINK_STATUS)) {
        perdreContexte();
        return;
      }
      gl.useProgram(programme);

      // Un triangle qui déborde du canvas le couvre en entier.
      gl.bindVertexArray(gl.createVertexArray());
      gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

      const lieu = (nom: string) => gl.getUniformLocation(programme, nom);
      for (const [nom, valeur] of Object.entries(UNIFORMES_FIXES)) {
        gl.uniform1f(lieu(nom), valeur);
      }
      gl.uniform2f(lieu("uCenterOffset"), REGLAGES.centerX, REGLAGES.centerY);
      gl.uniform3fv(lieu("uColor1"), hexVersRgb(REGLAGES.color1));
      gl.uniform3fv(lieu("uColor2"), hexVersRgb(REGLAGES.color2));
      gl.uniform3fv(lieu("uColor3"), hexVersRgb(REGLAGES.color3));
      const lieuTemps = lieu("iTime");
      const lieuResolution = lieu("iResolution");

      const mouvementReduit = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );
      let ecoule = mouvementReduit.matches ? TEMPS_FIGE : 0;
      gl.uniform1f(lieuTemps, ecoule);

      canvas.style.width = "100%";
      canvas.style.height = "100%";
      canvas.style.display = "block";
      conteneur.appendChild(canvas);

      let image = 0;
      let precedent = performance.now();
      let dernierRendu = 0;
      let visible = true;
      let pageVisible = !document.hidden;

      const rendre = () => gl.drawArrays(gl.TRIANGLES, 0, 3);
      const stopper = () => {
        if (image !== 0) cancelAnimationFrame(image);
        image = 0;
      };
      const peutAnimer = () =>
        visible && pageVisible && !mouvementReduit.matches;

      const boucle = (maintenant: number) => {
        image = 0;
        if (!peutAnimer()) return;
        const delta = Math.min((maintenant - precedent) / 1000, 0.1);
        precedent = maintenant;
        ecoule += delta;
        if (maintenant - dernierRendu >= 1000 / REGLAGES.fps - 0.5) {
          gl.uniform1f(lieuTemps, ecoule);
          rendre();
          dernierRendu = maintenant;
        }
        image = requestAnimationFrame(boucle);
      };

      const lancer = () => {
        if (!peutAnimer() || image !== 0) return;
        precedent = performance.now();
        image = requestAnimationFrame(boucle);
      };

      const dimensionner = () => {
        const boite = conteneur.getBoundingClientRect();
        const largeur = Math.max(
          1,
          Math.floor(boite.width * REGLAGES.resolution),
        );
        const hauteur = Math.max(
          1,
          Math.floor(boite.height * REGLAGES.resolution),
        );
        if (canvas.width !== largeur) canvas.width = largeur;
        if (canvas.height !== hauteur) canvas.height = hauteur;
        gl.viewport(0, 0, largeur, hauteur);
        gl.uniform2f(lieuResolution, largeur, hauteur);
        rendre();
      };

      const surVisibilite = () => {
        pageVisible = !document.hidden;
        if (peutAnimer()) lancer();
        else stopper();
      };
      const surMouvementReduit = () => {
        if (peutAnimer()) {
          lancer();
        } else {
          stopper();
          gl.uniform1f(lieuTemps, TEMPS_FIGE);
          rendre();
        }
      };

      const observateurTaille = new ResizeObserver(dimensionner);
      const observateurVue = new IntersectionObserver(([entree]) => {
        visible = entree.isIntersecting;
        if (peutAnimer()) lancer();
        else stopper();
      });

      const nettoyer = () => {
        stopper();
        observateurTaille.disconnect();
        observateurVue.disconnect();
        document.removeEventListener("visibilitychange", surVisibilite);
        mouvementReduit.removeEventListener("change", surMouvementReduit);
        canvas.removeEventListener("webglcontextlost", surPerte);
        canvas.remove();
        conteneur.removeAttribute("data-pret");
        hero?.removeAttribute("data-degrade");
      };
      // Contexte perdu (pilote réinitialisé, trop de contextes ouverts) : le
      // canvas resterait noir, on rend la main aux halos CSS.
      const surPerte = () => nettoyer();

      observateurTaille.observe(conteneur);
      observateurVue.observe(conteneur);
      document.addEventListener("visibilitychange", surVisibilite);
      mouvementReduit.addEventListener("change", surMouvementReduit);
      canvas.addEventListener("webglcontextlost", surPerte);

      dimensionner();
      lancer();
      conteneur.setAttribute("data-pret", "");
      hero?.setAttribute("data-degrade", "");

      arreter = () => {
        nettoyer();
        perdreContexte();
      };
    };

    // Après le chargement de la page, au premier moment libre (2,5 s au plus).
    const planifier = () => {
      if ("requestIdleCallback" in window) {
        attenteLibre = window.requestIdleCallback(() => void demarrer(), {
          timeout: 2500,
        });
      } else {
        attenteMinuteur = setTimeout(() => void demarrer(), 200);
      }
    };
    if (document.readyState === "complete") planifier();
    else window.addEventListener("load", planifier, { once: true });

    return () => {
      annule = true;
      window.removeEventListener("load", planifier);
      if (attenteLibre !== undefined) window.cancelIdleCallback(attenteLibre);
      if (attenteMinuteur !== undefined) clearTimeout(attenteMinuteur);
      arreter?.();
    };
  }, []);

  return (
    <div
      ref={conteneurRef}
      aria-hidden
      className={`degrade-hero ${className}`}
    />
  );
}

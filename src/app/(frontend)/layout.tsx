import type { Metadata } from "next";
import { Archivo, Space_Mono } from "next/font/google";
import { Footer } from "./_components/Footer";
import { Nav } from "./_components/Nav";
import { getPricingPlans, getSiteSettings } from "@/lib/queries";
import { montantTarif, SITE_NAME, SITE_URL, structuredData } from "@/lib/seo";
import "./globals.css";

// Seules les graisses réellement employées : chaque graisse déclarée est un
// fichier préchargé sur toutes les pages, utilisé ou non.
const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  // Sans `metadataBase`, les URL canoniques et l'image de partage resteraient
  // relatives, donc inutilisables par un réseau social.
  metadataBase: new URL(SITE_URL),
  title: SITE_NAME,
  description:
    "Studio de danse - cours de heels, cours privés, location de salle.",
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const [settings, plans] = await Promise.all([
    getSiteSettings(),
    getPricingPlans(),
  ]);

  // Fourchette de prix pour les données structurées, déduite des tarifs saisis
  // plutôt qu'écrite en dur : elle suit ce que la cliente modifie.
  const montants = plans
    .map((p) => montantTarif(p.price))
    .filter((n): n is number => n !== undefined);
  const priceRange = montants.length
    ? `${Math.min(...montants)}€ - ${Math.max(...montants)}€`
    : undefined;

  return (
    <html
      lang="fr"
      className={`${archivo.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        {/* Données structurées de l'établissement : c'est ce que Google lit
            pour le référencement local. */}
        <script
          type="application/ld+json"
          // `<` échappé : `JSON.stringify` le laisse tel quel, et un
          // `</script>` saisi dans les réglages fermerait la balise pour
          // injecter du HTML dans la page.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              structuredData(settings, priceRange),
            ).replace(/</g, "\\u003c"),
          }}
        />
        {/* Lien d'évitement : invisible tant qu'il n'a pas le focus. Au
            clavier, la nav compte huit arrêts avant le contenu. */}
        <a href="#contenu" className="lien-evitement pill pill-light">
          Aller au contenu
        </a>
        <Nav logo={settings.logo} instagram={settings.instagramHandle} />
        {/* overflow-x-clip : borne la dérive des halos du hero sans créer de
            conteneur de défilement (ce que ferait `hidden`, ce qui casserait
            la nav sticky) et sans clipper juste au-dessus du titre 3D.
            tabIndex={-1} : cible du lien d'évitement, focusable sans entrer
            dans l'ordre de tabulation.
            flex flex-col : la page occupe toute la hauteur de `main`, donc
            l'espace restant quand le contenu est plus court que l'écran tombe
            DANS la page et non après elle. Sans quoi il s'ajoutait sous le
            bandeau défilant de l'accueil, qui paraissait alors deux fois plus
            haut (86px mesurés à 545x934).
            relative : repère des halos de page (`main::before`, cf.
            globals.css), plafonnés à sa hauteur. */}
        <main
          id="contenu"
          tabIndex={-1}
          className="relative flex flex-1 flex-col overflow-x-clip outline-none"
        >
          {children}
        </main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}

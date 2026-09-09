import type { Metadata } from "next";
import { Archivo, Space_Mono } from "next/font/google";
import { Footer } from "./_components/Footer";
import { Nav } from "./_components/Nav";
import { getSiteSettings } from "@/lib/queries";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "BAPZ Studio",
  description: "Studio de danse - cours de heels, cours privés, location de salle.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="fr"
      className={`${archivo.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <Nav logo={settings.logo} instagram={settings.instagramHandle} />
        {/* overflow-x-clip : borne la dérive des halos du hero sans créer de
            conteneur de défilement (ce que ferait `hidden`, ce qui casserait
            la nav sticky) et sans clipper juste au-dessus du titre 3D. */}
        <main className="flex-1 overflow-x-clip">{children}</main>
        <Footer settings={settings} />
      </body>
    </html>
  );
}

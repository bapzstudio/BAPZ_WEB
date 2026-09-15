import { lienInstagram } from "@/lib/instagram";
import { decouperAdresse } from "@/lib/seo";
import type { SiteSettings } from "@/lib/types";
import { Reveal } from "../_components/Reveal";
import { ESPACE_SECTION, EnteteSection } from "./EnteteSection";

/**
 * Le studio et l'accès : l'adresse complète écrite en toutes lettres, la ville
 * voisine, l'itinéraire et Instagram. C'est le signal local le plus direct pour
 * Google, et la même adresse que les données structurées. Le formulaire, les
 * horaires et le téléphone restent sur /contact.
 */
export function AccueilStudio({ settings }: { settings: SiteSettings }) {
  if (!settings.address) return null;

  const { rue, commune } = decouperAdresse(settings.address);
  const localite = [settings.postalCode, commune].filter(Boolean).join(" ");
  const itineraire = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${settings.address}, France`)}`;

  return (
    <section
      aria-labelledby="accueil-studio"
      className={`container-page ${ESPACE_SECTION}`}
    >
      <EnteteSection
        id="accueil-studio"
        titre="Le studio"
        lien="/contact"
        libelleLien="Contact et accès"
      />
      {/* `items-start` : chaque carte garde sa hauteur. Étirée à celle de
          l'adresse, la carte Instagram restait aux trois quarts vide. */}
      <Reveal className="grid items-start gap-4 sm:grid-cols-2 sm:gap-6">
        <div className="card flex flex-col p-6">
          <p className="eyebrow mb-2.5">ADRESSE</p>
          <address className="text-xl font-bold not-italic">
            {rue}
            {localite && (
              <>
                <br />
                {localite}
              </>
            )}
          </address>
          {settings.city && commune && settings.city !== commune && (
            <p className="mt-2 text-secondary">À côté de {settings.city}</p>
          )}
          <a
            href={itineraire}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Itinéraire vers le studio sur Google Maps (nouvel onglet)"
            className="pill pill-outline group mt-6 w-fit gap-2"
          >
            Itinéraire
            <span
              aria-hidden
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </a>
        </div>

        {settings.instagramHandle && (
          <div className="card flex flex-col p-6">
            <p className="eyebrow mb-2.5">INSTAGRAM</p>
            <a
              href={lienInstagram(settings.instagramHandle)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-xl font-bold transition-colors hover:text-secondary"
            >
              {settings.instagramHandle}
            </a>
          </div>
        )}
      </Reveal>
    </section>
  );
}

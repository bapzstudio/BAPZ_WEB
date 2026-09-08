import type { SiteSettings } from "@/lib/types";

export function Footer({ settings }: { settings: SiteSettings }) {
  const disciplines = (settings.marqueeItems ?? [])
    .slice(0, 2)
    .join(" / ")
    .toUpperCase();

  return (
    <footer className="relative z-10">
      <div className="container-page flex flex-col items-center justify-between gap-2 py-5 text-center font-mono text-xs text-tertiary sm:flex-row sm:text-left">
        <span>BAPZ STUDIO</span>
        {disciplines && <span>{disciplines}</span>}
        <span>
          {(settings.city ?? "Metz").toUpperCase()}, FR
          {settings.instagramHandle ? ` - ${settings.instagramHandle}` : ""}
        </span>
      </div>
    </footer>
  );
}

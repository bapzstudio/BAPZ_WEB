export function Marquee({ items }: { items: string[] }) {
  // Répété largement pour que la boucle -50% reste invisible sur grand écran.
  const sequence = Array.from({ length: 4 }, () =>
    items.map((item) => item.toUpperCase()).join(" ✦ ")
  ).join(" ✦ ");

  return (
    <div className="overflow-hidden border-y border-rule py-4">
      <div className="marquee-track flex w-max whitespace-nowrap font-mono text-xs tracking-[0.2em] text-tertiary">
        <span className="pr-6">{sequence}</span>
        <span className="pr-6" aria-hidden>
          {sequence}
        </span>
      </div>
    </div>
  );
}

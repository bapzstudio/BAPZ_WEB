import { LIBELLE, Titre } from "../ui";

export type ElementRecap = { label: string; valeur: string; etape: number };

export function StepRecap({
  elements,
  onModifier,
}: {
  elements: ElementRecap[];
  onModifier: (etape: number) => void;
}) {
  return (
    <div className="flex flex-col gap-8">
      <Titre>Tout est bon ?</Titre>

      <div className="cal-card flex flex-col p-2">
        {elements.map((element) => (
          <button
            key={element.label}
            type="button"
            onClick={() => onModifier(element.etape)}
            className="group flex items-baseline justify-between gap-6 rounded-xl border-b border-white/5 px-5 py-4 text-left transition-colors last:border-0 hover:bg-white/5"
          >
            <span className="flex min-w-0 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
              <span className={`${LIBELLE} sm:w-28 sm:shrink-0`}>{element.label}</span>
              <span className="break-words text-[15px] font-semibold">{element.valeur}</span>
            </span>
            <span className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-tertiary transition-colors group-hover:text-foreground">
              Modifier
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

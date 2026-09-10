export function ProgressBar({ etape, total }: { etape: number; total: number }) {
  const pourcentage = Math.min(((etape + 1) / total) * 100, 100);

  return (
    <div
      className="funnel-progression"
      role="progressbar"
      aria-label="Progression de ta demande"
      aria-valuemin={1}
      aria-valuemax={total}
      aria-valuenow={Math.min(etape + 1, total)}
    >
      <div style={{ width: `${pourcentage}%` }} />
    </div>
  );
}

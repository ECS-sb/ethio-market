import { formatCount, growthLabels } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const WIDTH = 640;
const HEIGHT = 220;
const PAD = 12;

export function GrowthChart({ values, className }: { values: number[]; className?: string }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const points = values.map((value, index) => ({
    x: PAD + (index / (values.length - 1)) * (WIDTH - PAD * 2),
    y: HEIGHT - PAD - ((value - min) / span) * (HEIGHT - PAD * 2),
  }));
  const line = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const area = `${line} L${WIDTH - PAD} ${HEIGHT} L${PAD} ${HEIGHT} Z`;
  const last = points[points.length - 1];

  return (
    <figure className={cn("flex flex-col gap-2", className)}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`የተከታዮች ዕድገት፦ ከ${formatCount(values[0])} ወደ ${formatCount(values[values.length - 1])}`}
        className="h-auto w-full"
      >
        <path d={area} className="fill-primary/10" />
        <path d={line} className="fill-none stroke-primary" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={last.x} cy={last.y} r={6} className="fill-primary stroke-background" strokeWidth={3} />
      </svg>
      <div className="flex justify-between text-xs text-muted-foreground" aria-hidden>
        {growthLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
    </figure>
  );
}

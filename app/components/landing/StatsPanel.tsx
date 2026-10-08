import { Chart } from "../ui/icons";

const stats = [
  { label: "Tickets issued", value: "1,248" },
  { label: "Checked in", value: "1,032" },
  { label: "Revenue", value: "$24.6k" },
];

const bars = [42, 58, 36, 74, 63, 88, 70];
const days = ["M", "T", "W", "T", "F", "S", "S"];

export default function StatsPanel() {
  return (
    <div className="w-full rounded-3xl border-2 border-ink bg-paper p-6 shadow-brutal-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border-2 border-ink bg-brand">
            <Chart className="h-4 w-4" />
          </span>
          <span className="font-display text-sm font-bold">
            Event performance
          </span>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink bg-success/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider">
          <span className="h-1.5 w-1.5 rounded-full bg-success" />
          Live
        </span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border-2 border-ink bg-surface px-3 py-3"
          >
            <p className="font-display text-xl font-bold leading-none">
              {stat.value}
            </p>
            <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wider text-ink-soft">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border-2 border-ink bg-surface p-4">
        <div className="flex h-32 items-end justify-between gap-2">
          {bars.map((height, index) => (
            <div
              key={index}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
            >
              <div
                style={{ height: `${height}%` }}
                className={`w-full rounded-t-md border-2 border-ink ${
                  index === 5 ? "bg-accent" : "bg-brand"
                }`}
              />
              <span className="font-mono text-[9px] text-ink-soft">
                {days[index]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import { library, useStore } from "../model";
import type { Bead } from "../model";

export function Bracelet({
  mini = false,
  items,
}: {
  mini?: boolean;
  items?: Bead[];
}) {
  const { beads, selected } = useStore();
  items = items || beads.value;
  const sum = items.reduce((s, b) => s + b.size, 0);
  let cumulative = 0;
  return (
    <svg
      class={mini ? "bracelet mini" : "bracelet"}
      viewBox="0 0 500 500"
      aria-label="手串平面预览"
      role="img"
    >
      <defs>
        <filter
          id={mini ? "shadow-mini" : "shadow"}
          x="-50%"
          y="-50%"
          width="200%"
          height="200%"
        >
          <feDropShadow
            dx="1"
            dy="5"
            stdDeviation="4"
            flood-color="#3c453a"
            flood-opacity=".16"
          />
        </filter>
        {library.map((b) => (
          <radialGradient
            id={`${mini ? "m" : ""}gem-${b.id}`}
            cx="32%"
            cy="25%"
            r="80%"
          >
            <stop
              offset="0"
              stop-color={b.kind === "metal" ? "#fff2c0" : "#fff"}
              stop-opacity={b.kind === "metal" ? 1 : 0.8}
            />
            <stop offset=".38" stop-color={b.color} />
            <stop offset=".8" stop-color={b.color} />
            <stop
              offset="1"
              stop-color={b.kind === "metal" ? "#6f532e" : b.color}
            />
          </radialGradient>
        ))}
      </defs>
      <circle
        cx="250"
        cy="250"
        r="163"
        fill="none"
        stroke="#d6cbb3"
        stroke-width="1.3"
      />
      {items.map((b, i) => {
        const angle =
          ((cumulative + b.size / 2) / sum) * Math.PI * 2 - Math.PI / 2;
        cumulative += b.size;
        const r = Math.min(
          34,
          Math.max(5, (b.size / sum) * Math.PI * 163 * 0.94),
        );
        const x = 250 + Math.cos(angle) * 163,
          y = 250 + Math.sin(angle) * 163;
        return (
          <g
            key={i}
            class={!mini ? "svg-bead" : ""}
            role={!mini ? "button" : undefined}
            tabIndex={!mini ? 0 : undefined}
            aria-label={!mini ? `第 ${i + 1} 颗 ${b.name}` : undefined}
            onClick={() => !mini && (selected.value = i)}
            onKeyDown={(e) => {
              if (!mini && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                selected.value = i;
              }
            }}
          >
            <circle cx={x} cy={y} r={r + 5} fill="transparent" />
            {!mini && selected.value === i && (
              <circle
                cx={x}
                cy={y}
                r={r + 5}
                stroke="#486653"
                stroke-width="2"
                stroke-dasharray="3 3"
                fill="none"
              />
            )}
            <circle
              cx={x}
              cy={y}
              r={r}
              fill={`url(#${mini ? "m" : ""}gem-${b.id})`}
              filter={`url(#${mini ? "shadow-mini" : "shadow"})`}
            />
            {b.kind !== "metal" && (
              <>
                <path
                  d={`M ${x - r * 0.5} ${y - r * 0.6} Q ${x + r * 0.4} ${y - r * 0.3} ${x + r * 0.25} ${y + r * 0.7}`}
                  stroke="#fff"
                  stroke-opacity=".18"
                  stroke-width="1"
                  fill="none"
                />
                <ellipse
                  cx={x - r * 0.27}
                  cy={y - r * 0.35}
                  rx={r * 0.23}
                  ry={r * 0.12}
                  fill="#fff"
                  opacity=".32"
                  transform={`rotate(-30 ${x - r * 0.27} ${y - r * 0.35})`}
                />
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

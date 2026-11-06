import type { Bead } from "../model";

export function texture(b: Bead) {
  return {
    background:
      b.kind === "metal"
        ? `linear-gradient(125deg,#fff6d1 0%,${b.color} 35%,#f5e4b0 50%,${b.color} 70%,#654d2b)`
        : `radial-gradient(circle at 30% 24%,#ffffffa6 0%,transparent 34%),radial-gradient(ellipse at 70% 80%,#00000024,transparent 60%),${b.color}`,
  };
}

export function Gem({ b, small = false }: { b: Bead; small?: boolean }) {
  return (
    <span class={`gem ${b.kind} ${small ? "small" : ""}`} style={texture(b)}>
      <span />
    </span>
  );
}

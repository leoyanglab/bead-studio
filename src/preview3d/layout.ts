import type { Bead } from "../catalog";

/** Place neighbouring bead surfaces 0.12 mm apart on a closed string. */
export function braceletLayout(items: Bead[]) {
  if (!items.length) return { radius: 0, extent: 1, beads: [] };
  if (items.length === 1) {
    return {
      radius: 0,
      extent: items[0].size / 2,
      beads: [{ bead: items[0], angle: 0, x: 0, z: 0 }],
    };
  }
  const distances = items.map(
    (bead, i) => (bead.size + items[(i + 1) % items.length].size) / 2 + 0.12,
  );
  const angleAt = (distance: number, radius: number) =>
    2 * Math.asin(Math.min(1, distance / (2 * radius)));
  // The two-bead case is the diameter of the circle. For larger designs,
  // binary search finds the radius whose neighbouring angles add to 2π.
  let low = Math.max(...distances) / 2;
  let high = distances.reduce((sum, distance) => sum + distance, 0);
  for (let i = 0; i < 64; i++) {
    const middle = (low + high) / 2;
    const total = distances.reduce((sum, d) => sum + angleAt(d, middle), 0);
    if (total > Math.PI * 2) low = middle;
    else high = middle;
  }
  const radius = (low + high) / 2;
  let angle = -Math.PI / 2;
  const beads = items.map((bead, i) => {
    const position = {
      bead,
      angle,
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
    };
    angle += angleAt(distances[i], radius);
    return position;
  });
  return {
    radius,
    extent: radius + Math.max(...items.map((bead) => bead.size)) / 2,
    beads,
  };
}

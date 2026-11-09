import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import ts from "typescript";

const source = await readFile(
  new URL("../src/preview3d/layout.ts", import.meta.url),
  "utf8",
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const { braceletLayout } = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);
const bead = (size, id = String(size)) => ({
  id,
  size,
  kind: "stone",
  color: "#8eac98",
});

test("empty and single-bead previews have finite, centered bounds", () => {
  assert.deepEqual(braceletLayout([]), { radius: 0, extent: 1, beads: [] });
  const one = braceletLayout([bead(8)]);
  assert.equal(one.extent, 4);
  assert.equal(one.beads[0].x, 0);
  assert.equal(one.beads[0].z, 0);
});

test("two beads sit opposite each other without overlapping", () => {
  const { beads, extent } = braceletLayout([bead(4), bead(10)]);
  const distance = Math.hypot(beads[0].x - beads[1].x, beads[0].z - beads[1].z);
  assert.ok(Math.abs(distance - 7.12) < 1e-8);
  assert.ok(Number.isFinite(extent));
});

test("mixed diameters form a closed loop, preserve order and do not intersect", () => {
  for (const sizes of [
    [4, 10, 4],
    [8, 8, 4, 7, 10, 6, 8],
    Array.from({ length: 80 }, (_, i) => [4, 7, 8, 10][i % 4]),
  ]) {
    const input = sizes.map((size, i) => bead(size, String(i)));
    const snapshot = structuredClone(input);
    const { beads, extent } = braceletLayout(input);
    assert.deepEqual(input, snapshot);
    assert.deepEqual(
      beads.map(({ bead }) => bead.id),
      input.map(({ id }) => id),
    );
    for (let i = 0; i < beads.length; i++) {
      const a = beads[i],
        b = beads[(i + 1) % beads.length];
      const distance = Math.hypot(a.x - b.x, a.z - b.z);
      assert.ok(
        Math.abs(distance - (a.bead.size + b.bead.size) / 2 - 0.12) < 1e-7,
      );
      assert.ok(Math.hypot(a.x, a.z) + a.bead.size / 2 <= extent + 1e-7);
      for (let j = i + 1; j < beads.length; j++) {
        const b = beads[j];
        assert.ok(
          Math.hypot(a.x - b.x, a.z - b.z) >=
            (a.bead.size + b.bead.size) / 2 - 1e-7,
        );
      }
    }
  }
});

import * as THREE from "three";
import type { Bead } from "../catalog";

/** Small generated textures keep the preview self-contained and deterministic. */
export function beadMaterial(bead: Bead) {
  const metal = bead.kind === "metal";
  const pearl = bead.kind === "pearl";
  const wood = bead.material === "木珠";
  const material = new THREE.MeshPhysicalMaterial({
    color: bead.color,
    metalness: metal ? 0.88 : 0,
    roughness: metal ? 0.23 : pearl ? 0.22 : wood ? 0.6 : 0.27,
    clearcoat: metal || wood ? 0 : 0.85,
    clearcoatRoughness: 0.15,
    iridescence: pearl ? 0.5 : 0,
    iridescenceIOR: 1.3,
    sheen: pearl ? 0.35 : 0,
    sheenColor: new THREE.Color("#fff2dc"),
    envMapIntensity: metal ? 1.3 : 0.8,
  });
  if (metal || pearl) return material;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 128;
  const context = canvas.getContext("2d")!;
  context.fillStyle = bead.color;
  context.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 22; i++) {
    const lighter = i % 2 === 0;
    context.strokeStyle = lighter ? "#ffffff" : "#152820";
    context.globalAlpha = wood ? 0.12 : 0.045;
    context.lineWidth = wood ? 1 : 2 + (i % 4);
    context.beginPath();
    for (let x = 0; x <= 128; x += 4) {
      const y =
        (i * 13 + Math.sin(x / (wood ? 38 : 19) + i) * (wood ? 3 : 12)) % 128;
      if (x === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    }
    context.stroke();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  // The map already carries the catalog colour, so do not tint it twice.
  material.color.set("white");
  material.map = texture;
  return material;
}

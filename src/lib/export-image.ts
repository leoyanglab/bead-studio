import type { Store } from "../model";
import { money } from "./format";

export async function exportImage({ name, ids, total, inner, notify }: Store) {
  try {
    const svg = document.querySelector(".canvas .bracelet")!;
    const copy = svg.cloneNode(true) as SVGElement;
    copy
      .querySelectorAll("[tabindex]")
      .forEach((x) => x.removeAttribute("tabindex"));
    const data = new XMLSerializer().serializeToString(copy);
    const blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.src = url;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 1440;
    const c = canvas.getContext("2d")!;
    c.fillStyle = "#f7f6f2";
    c.fillRect(0, 0, 1200, 1440);
    c.fillStyle = "#405647";
    c.font = "36px sans-serif";
    c.fillText("珠间  /  BEAD STUDIO", 90, 110);
    c.drawImage(img, 70, 150, 1060, 1060);
    c.font = "48px sans-serif";
    c.fillText(name.value || "未命名设计", 90, 1230);
    c.font = "22px sans-serif";
    c.fillStyle = "#74766c";
    c.fillText(
      `${ids.value.length} 颗珠子  ·  材料参考价 ¥${money(total.value)}  ·  估算内围 ${inner.value.toFixed(1)} cm`,
      90,
      1290,
    );
    c.fillText("在线搭配，让灵感成串。 · beads.bool.win", 90, 1370);
    URL.revokeObjectURL(url);
    const a = document.createElement("a");
    a.download = `${name.value || "珠间设计"}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
    notify("设计图已导出");
  } catch {
    notify("图片导出失败，请重试");
  }
}

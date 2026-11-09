import { useEffect, useRef, useState } from "preact/hooks";
import { Pause, Play, RotateCcw, ZoomIn, ZoomOut } from "lucide-preact";
import type { Bead } from "../catalog";
import type { PreviewScene } from "../preview3d/scene";

export function Bracelet3D({
  items,
  selected,
  onSelect,
  onFlatView,
}: {
  items: Bead[];
  selected: number | null;
  onSelect: (index: number) => void;
  onFlatView: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const scene = useRef<PreviewScene | null>(null);
  const latest = useRef({ items, selected, onSelect });
  latest.current = { items, selected, onSelect };
  const [status, setStatus] = useState<"loading" | "ready" | "unavailable">(
    "loading",
  );
  const [rotating, setRotating] = useState(false);

  useEffect(() => {
    if (import.meta.env.SSR) return;
    let cancelled = false;
    const fail = () => {
      scene.current?.dispose();
      scene.current = null;
      if (!cancelled) setStatus("unavailable");
    };
    // Only the 3D tab loads Three.js; SSR and the initial editor stay lightweight.
    import("../preview3d/scene")
      .then(({ createPreview }) => {
        if (cancelled || !host.current) return;
        scene.current = createPreview(
          host.current,
          (index) => latest.current.onSelect(index),
          fail,
        );
        scene.current.setBeads(latest.current.items);
        scene.current.setSelection(latest.current.selected);
        setStatus("ready");
      })
      .catch(fail);
    return () => {
      cancelled = true;
      scene.current?.dispose();
      scene.current = null;
    };
  }, []);
  useEffect(() => scene.current?.setBeads(items), [items]);
  useEffect(() => scene.current?.setSelection(selected), [selected]);

  return (
    <div class="preview-3d">
      <div
        class="preview-3d-stage"
        ref={host}
        aria-busy={status === "loading"}
      />
      {status !== "ready" && (
        <div class="preview-3d-status" role="status">
          <strong>
            {status === "loading"
              ? "正在准备立体预览…"
              : "当前设备暂时无法显示 3D"}
          </strong>
          <p>
            {status === "loading"
              ? "换个角度，看看你的搭配。"
              : "可以继续使用平面预览，设计已保留。"}
          </p>
          <button class="preview-flat-link" onClick={onFlatView}>
            返回平面搭配
          </button>
        </div>
      )}
      {status === "ready" && (
        <>
          <div
            class="preview-3d-controls"
            role="group"
            aria-label="3D 视角控制"
          >
            <button
              aria-label="缩小 3D 预览"
              title="缩小"
              onClick={() => scene.current?.zoom(1.15)}
            >
              <ZoomOut size={16} />
            </button>
            <button
              aria-label="放大 3D 预览"
              title="放大"
              onClick={() => scene.current?.zoom(0.85)}
            >
              <ZoomIn size={16} />
            </button>
            <button
              aria-label="重置 3D 视角"
              title="重置视角"
              onClick={() => scene.current?.reset()}
            >
              <RotateCcw size={16} />
            </button>
            <button
              aria-label={rotating ? "暂停自动旋转" : "自动旋转"}
              aria-pressed={rotating}
              title={rotating ? "暂停旋转" : "自动旋转"}
              onClick={() => {
                scene.current?.setAutoRotate(!rotating);
                setRotating(!rotating);
              }}
            >
              {rotating ? <Pause size={15} /> : <Play size={15} />}
            </button>
          </div>
          <p id="preview-3d-help" class="preview-3d-help">
            拖动旋转 · 双指缩放 · 点击珠子编辑
            <span>键盘方向键旋转，＋ / − 缩放，Home 复位</span>
          </p>
        </>
      )}
    </div>
  );
}

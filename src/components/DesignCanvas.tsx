import {
  Plus,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  X,
  Trash2,
  GripVertical,
} from "lucide-preact";
import { library, presets, useStore } from "../model";

import { Gem } from "./Gem";
import { Bracelet } from "./Bracelet";

import type { Signal } from "@preact/signals";

export function DesignCanvas({
  background,
  dragged,
}: {
  background: Signal<string>;
  dragged: Signal<number | null>;
}) {
  const store = useStore();
  const { name, ids, selected, beads, notify, remove, move, load } = store;

  return (
    <section class="studio">
      <div class="studio-top">
        <div>
          <span class="tiny-label">YOUR CREATION</span>
          <label>
            <input
              aria-label="设计名称"
              maxLength={40}
              value={name.value}
              onInput={(e) => (name.value = e.currentTarget.value)}
            />
            <span>✎</span>
          </label>
        </div>
        <span class="autosave">
          <Check size={13} /> 自动保存在本机
        </span>
      </div>
      <div class={`canvas ${background.value}`}>
        <span class="canvas-label">一点灵感 · 无限搭配</span>
        <Bracelet />
        {!ids.value.length ? (
          <div class="canvas-center">
            <Plus size={22} />
            <strong>从一颗珠子开始</strong>
            <span>点击左侧素材，开启你的创作</span>
          </div>
        ) : (
          <div class="canvas-center">
            <span class="center-mark">◌</span>
            <span>独一无二的</span>
            <strong>刚好是你</strong>
            <small>DESIGNED WITH LOVE</small>
          </div>
        )}
        <div class="canvas-bottom">
          <div class="backgrounds">
            {[
              { id: "linen", color: "#eee9df", label: "亚麻背景" },
              { id: "paper", color: "#ffffff", label: "纯白背景" },
              { id: "sage", color: "#dfe7dd", label: "鼠尾草背景" },
            ].map((x) => (
              <button
                aria-label={x.label}
                class={background.value === x.id ? "chosen" : ""}
                style={{ background: x.color }}
                onClick={() => (background.value = x.id)}
              />
            ))}
          </div>
          <span>平面搭配预览</span>
          <button
            class="reset"
            title="恢复初始搭配"
            aria-label="恢复初始搭配"
            onClick={() => {
              load({
                name: presets[0].name,
                ids: presets[0].ids,
                wrist: 16,
              });
              notify("已恢复苔间晨露搭配");
            }}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>
      <div class="sequence">
        <div class="sequence-label">
          <span>
            <GripVertical size={15} /> 珠子排列{" "}
            <small>{ids.value.length} 颗</small>
          </span>
          <small>拖动排序 · 点击编辑</small>
        </div>
        <div class="sequence-beads">
          {beads.value.map((b, i) => (
            <button
              draggable
              class={selected.value === i ? "picked" : ""}
              aria-label={`排列第 ${i + 1} 颗 ${b.name}`}
              onDragStart={(e) => {
                dragged.value = i;
                e.dataTransfer!.effectAllowed = "move";
                e.dataTransfer!.setData("text/plain", String(i));
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (dragged.value !== null) move(dragged.value, i);
                dragged.value = null;
              }}
              onDragEnd={() => (dragged.value = null)}
              onClick={() => (selected.value = i)}
            >
              <Gem b={b} small />
              <small>{i + 1}</small>
            </button>
          ))}
          <button
            class="add-placeholder"
            aria-label="浏览珠子素材"
            onClick={() => {
              document
                .querySelector(".library")
                ?.scrollIntoView({ behavior: "smooth" });
              notify("点击素材卡片添加珠子");
            }}
          >
            <Plus size={19} />
          </button>
        </div>
        {selected.value !== null && beads.value[selected.value] && (
          <div class="edit-bar">
            <span>
              {selected.value + 1}. {beads.value[selected.value].name}
            </span>
            <button
              aria-label="向前移动"
              disabled={selected.value === 0}
              onClick={() => move(selected.value!, selected.value! - 1)}
            >
              <ChevronLeft size={17} />
            </button>
            <button
              aria-label="向后移动"
              disabled={selected.value === ids.value.length - 1}
              onClick={() => move(selected.value!, selected.value! + 1)}
            >
              <ChevronRight size={17} />
            </button>
            <select
              aria-label="替换所选珠子"
              value={ids.value[selected.value]}
              onChange={(e) => {
                const a = [...ids.value];
                a[selected.value!] = e.currentTarget.value;
                ids.value = a;
              }}
            >
              {library.map((b) => (
                <option value={b.id}>{b.name}</option>
              ))}
            </select>
            <button aria-label="删除所选珠子" onClick={remove}>
              <Trash2 size={16} />
            </button>
            <button
              aria-label="关闭珠子编辑"
              onClick={() => (selected.value = null)}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

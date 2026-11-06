import { ArrowUpRight, Bookmark, Trash2, ArrowRight } from "lucide-preact";
import { library, useStore } from "../model";

import { Bracelet } from "./Bracelet";

import type { Signal } from "@preact/signals";

export function SavedDesigns({ tab }: { tab: Signal<string> }) {
  const store = useStore();
  const { saved, notify, load } = store;

  return (
    <section class="saved-panel">
      <div class="section-heading">
        <h2>
          我的设计 <small>留住每一个小小灵感</small>
        </h2>
        <button onClick={() => (tab.value = "design")}>
          继续创作 <ArrowRight size={16} />
        </button>
      </div>
      {saved.value.length ? (
        <div class="saved-grid">
          {saved.value.map((d, i) => (
            <article>
              <div class="saved-preview">
                <Bracelet
                  mini
                  items={d.ids.map((id) => library.find((b) => b.id === id)!)}
                />
              </div>
              <h3>{d.name || "未命名设计"}</h3>
              <p>
                {d.ids.length} 颗 · 目标手围 {d.wrist} cm
              </p>
              <div class="saved-actions">
                <button
                  onClick={() => {
                    load(d);
                    tab.value = "design";
                  }}
                >
                  继续编辑 <ArrowUpRight size={16} />
                </button>
                <button
                  aria-label={`删除 ${d.name}`}
                  onClick={() => {
                    try {
                      const next = saved.value.filter((_, j) => j !== i);
                      localStorage.setItem("bead-saved", JSON.stringify(next));
                      saved.value = next;
                    } catch {
                      notify("删除失败，请重试");
                    }
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div class="empty">
          <Bookmark size={34} />
          <h3>灵感，还在路上</h3>
          <p>在工作台保存你的第一条手串，它会出现在这里。</p>
          <button class="primary" onClick={() => (tab.value = "design")}>
            开始设计 <ArrowRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}

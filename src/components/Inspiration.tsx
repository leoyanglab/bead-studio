import { ArrowUpRight, Sparkles } from "lucide-preact";
import { library, presets, useStore } from "../model";

import { Bracelet } from "./Bracelet";

export function Inspiration() {
  const store = useStore();
  const { wrist, notify, load } = store;

  return (
    <section class="inspiration">
      <div class="section-heading">
        <div>
          <span class="eyebrow">A SPARK TO START</span>
          <h2>
            给灵感，一个起点 <small>从一组配色开始，再添一点你的心意。</small>
          </h2>
        </div>
        <span class="inspiration-hint">
          <Sparkles size={15} /> 点击搭配，载入工作台
        </span>
      </div>
      <div class="preset-grid">
        {presets.map((p, i) => (
          <button
            class={`preset preset-${i}`}
            onClick={() => {
              load({ name: p.name, ids: p.ids, wrist: wrist.value });
              notify(`已载入「${p.name}」`);
              document.querySelector(".studio")?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
          >
            <div>
              <span class="preset-no">0{i + 1} / COLLECTION</span>
              <h3>{p.name}</h3>
              <small>{p.sub}</small>
              <span class="try">
                试试这组搭配 <ArrowUpRight size={15} />
              </span>
            </div>
            <Bracelet
              mini
              items={p.ids.map((id) => library.find((b) => b.id === id)!)}
            />
          </button>
        ))}
      </div>
    </section>
  );
}

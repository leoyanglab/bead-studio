import { Plus, Search, Layers } from "lucide-preact";
import { library, useStore } from "../model";

import { Gem } from "./Gem";

export function BeadLibrary() {
  const store = useStore();
  const { filter, search, add } = store;
  const list = library.filter(
    (b) =>
      (filter.value === "全部" || b.material === filter.value) &&
      (b.name + b.en).toLowerCase().includes(search.value.toLowerCase()),
  );
  return (
    <aside class="panel library">
      <div class="panel-title">
        <h2>
          <Layers size={17} /> 珠子素材
        </h2>
        <span>{library.length} 款精选</span>
      </div>
      <label class="search">
        <Search size={16} />
        <input
          placeholder="找一颗心动的珠子"
          value={search.value}
          onInput={(e) => (search.value = e.currentTarget.value)}
        />
      </label>
      <div class="filters">
        {["全部", "天然石", "珍珠", "配件", "木珠"].map((t) => (
          <button
            class={filter.value === t ? "selected" : ""}
            onClick={() => (filter.value = t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div class="bead-grid">
        {list.map((b) => (
          <button
            class="bead-card"
            onClick={() => add(b.id)}
            title={`添加 ${b.name}`}
          >
            <span class="bead-swatch">
              <Gem b={b} />
              <span class="add-icon">
                <Plus size={13} />
              </span>
            </span>
            <strong>{b.name}</strong>
            <span>
              {b.size}mm <i /> ¥{b.price.toFixed(1)}
            </span>
          </button>
        ))}
      </div>
      {!list.length && <p class="no-result">没有找到珠子，换个词试试。</p>}
      <div class="library-foot">
        <Plus size={14} /> 点击珠子，添加到你的设计
      </div>
    </aside>
  );
}

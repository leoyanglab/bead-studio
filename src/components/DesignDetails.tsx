import {
  ArrowUpRight,
  Check,
  SlidersHorizontal,
  Download,
  Link,
  Bookmark,
  ArrowRight,
  Circle,
} from "lucide-preact";
import { useStore } from "../model";

import { Gem } from "./Gem";

import { exportImage } from "../lib/export-image";
import { money } from "../lib/format";

export function DesignDetails() {
  const store = useStore();
  const { ids, wrist, total, inner, bill, save, share, user, accountPanel } =
    store;

  return (
    <aside class="panel details">
      <div class="panel-title">
        <h2>
          <SlidersHorizontal size={17} /> 设计详情
        </h2>
        <span class="live-dot">实时</span>
      </div>
      <div class="wrist">
        <label for="wrist">
          我的手围{" "}
          <strong>
            {wrist.value.toFixed(1)} <small>cm</small>
          </strong>
        </label>
        <input
          id="wrist"
          type="range"
          min="12"
          max="24"
          step="0.5"
          value={wrist.value}
          onInput={(e) => (wrist.value = Number(e.currentTarget.value))}
        />
        <div class="range-labels">
          <span>12 cm</span>
          <span>24 cm</span>
        </div>
        <div class="fit-note">
          <Circle size={15} />
          <span>
            估算内围 <b>{inner.value.toFixed(1)} cm</b>
            <small>
              {!ids.value.length
                ? "添加珠子后查看尺寸"
                : Math.abs(inner.value - wrist.value) < 0.7
                  ? "尺寸接近，留意佩戴松量"
                  : inner.value < wrist.value
                    ? "偏小，试着多加几颗珠子"
                    : "偏大，可减少几颗珠子"}
            </small>
          </span>
        </div>
      </div>
      <div class="materials">
        <div class="sub-title">
          <h3>材料清单</h3>
          <span>{bill.value.length} 种材料</span>
        </div>
        <div class="bill">
          {bill.value.map((b) => (
            <div class="bill-row">
              <Gem b={b} small />
              <div>
                <strong>{b.name}</strong>
                <small>
                  {b.size}mm × {b.count}
                </small>
              </div>
              <span>¥{money(b.price * b.count)}</span>
            </div>
          ))}
          {!bill.value.length && (
            <p class="no-result">添加珠子后，材料会出现在这里。</p>
          )}
        </div>
        <div class="total">
          <span>
            材料参考价
            <strong>
              <small>¥</small>
              {money(total.value)}
            </strong>
          </span>
          <p>按示例单价计算，仅含珠材，不含绳与运费。</p>
        </div>
      </div>
      <div class="actions">
        <button
          class="primary order-button"
          onClick={() =>
            (accountPanel.value = user.value ? "checkout" : "login")
          }
        >
          定制这条手串 <ArrowRight size={17} />
        </button>
        <button class="primary" onClick={save}>
          <Bookmark size={17} /> 保存我的设计
        </button>
        <button class="secondary" onClick={() => exportImage(store)}>
          <Download size={17} /> 导出设计图 <span>PNG</span>
        </button>
        <button class="share" onClick={share}>
          <Link size={15} /> 复制分享链接 <ArrowUpRight size={14} />
        </button>
      </div>
      <p class="privacy">
        <Check size={12} /> 登录可云端保存与提交定制订单
      </p>
    </aside>
  );
}

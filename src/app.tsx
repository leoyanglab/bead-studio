import { SavedDesigns } from "./components/SavedDesigns";
import { BeadLibrary } from "./components/BeadLibrary";
import { DesignCanvas } from "./components/DesignCanvas";
import { DesignDetails } from "./components/DesignDetails";
import { Inspiration } from "./components/Inspiration";
import { useSignal } from "@preact/signals";
import {
  ArrowUpRight,
  Check,
  X,
  CircleHelp,
  Leaf,
  ArrowRight,
} from "lucide-preact";
import { useStore } from "./model";
import { AccountFlow } from "./account";

export function App() {
  const store = useStore();
  const { toast, saved, length, user, accountPanel } = store;
  const tab = useSignal("design"),
    help = useSignal(false),
    background = useSignal("linen"),
    dragged = useSignal<number | null>(null);
  return (
    <>
      <header>
        <a class="brand" href="/" aria-label="珠间首页">
          <span class="brand-icon">◌</span>
          <b>珠间</b>
          <span class="brand-en">BEAD STUDIO</span>
        </a>
        <nav>
          <button
            class={tab.value === "design" ? "active" : ""}
            onClick={() => (tab.value = "design")}
          >
            设计工作台
          </button>
          <button
            class={tab.value === "saved" ? "active" : ""}
            onClick={() => (tab.value = "saved")}
          >
            我的设计 <span class="count">{saved.value.length}</span>
          </button>
        </nav>
        <button
          class="account-button"
          onClick={() =>
            (accountPanel.value = user.value ? "account" : "login")
          }
        >
          {user.value ? user.value.name : "登录 / 注册"}
        </button>
        <button class="help" onClick={() => (help.value = true)}>
          <CircleHelp size={17} /> <span>使用指南</span>
        </button>
      </header>
      <main>
        <section class="intro">
          <div>
            <span class="eyebrow">
              <span /> A LITTLE BEAD, A LITTLE YOU
            </span>
            <h1>
              让灵感，<em>慢慢成串。</em>
            </h1>
            <p>挑选一颗喜欢的珠子，开始属于你的手作时光。</p>
          </div>
          <div class="intro-note">
            <Leaf size={25} stroke-width={1.2} />
            <span>
              不必完美，只需喜欢。<small>MADE BY YOU, FOR YOU.</small>
            </span>
          </div>
        </section>
        {tab.value === "saved" ? (
          <SavedDesigns tab={tab} />
        ) : (
          <>
            <div class="workspace">
              <BeadLibrary />
              <DesignCanvas background={background} dragged={dragged} />
              <DesignDetails />
            </div>
            <Inspiration />
          </>
        )}
        <footer>
          <span>
            <b>珠间</b> BEAD STUDIO <i /> 每一颗，都有你的心意。
          </span>
          <button onClick={() => (help.value = true)}>
            关于珠间 <ArrowUpRight size={13} />
          </button>
          <span>
            慢慢挑，慢慢搭。
            <Leaf size={14} />
          </span>
        </footer>
      </main>
      <AccountFlow />
      {toast.value && (
        <div class="toast" role="status">
          <Check size={17} />
          {toast.value}
        </div>
      )}
      {help.value && (
        <div
          class="modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) help.value = false;
          }}
        >
          <section
            class="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
          >
            <button
              class="close"
              aria-label="关闭指南"
              onClick={() => (help.value = false)}
            >
              <X size={20} />
            </button>
            <span class="eyebrow">WELCOME TO BEAD STUDIO</span>
            <h2 id="help-title">把心意，一颗颗串起来。</h2>
            <ol>
              <li>
                <b>挑选珠子</b>
                <p>点击素材添加珠子，示例材质、颜色和价格用于搭配参考。</p>
              </li>
              <li>
                <b>调整搭配</b>
                <p>
                  拖动下方珠子排序；手机上点选珠子后，用箭头移动，也可以替换或删除。
                </p>
              </li>
              <li>
                <b>留住灵感</b>
                <p>
                  保存到本机、导出
                  PNG，或复制包含完整设计的链接，让朋友继续编辑。
                </p>
              </li>
            </ol>
            <p class="guide-note">
              尺寸按珠子直径之和减去平均珠径 × π 估算内围（当前珠长{" "}
              {length.value.toFixed(1)}{" "}
              cm），不含绳结和松量；实际成品请试戴确认。保存仅在当前浏览器有效。分享链接包含设计内容。
            </p>
            <button class="primary" onClick={() => (help.value = false)}>
              开始我的手作时光 <ArrowRight size={17} />
            </button>
          </section>
        </div>
      )}
    </>
  );
}

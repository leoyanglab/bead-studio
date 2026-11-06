import { signal, computed, effect, batch } from "@preact/signals";
import { createContext } from "preact";
import { useContext } from "preact/hooks";
import { library, defaultDesign, valid } from "./catalog";
import type { Design } from "./catalog";
export * from "./catalog";
export type User = {
  id: string;
  email: string;
  name: string;
  role: "customer" | "admin";
};
export type Bootstrap = { design: Design; user: User | null; shared?: boolean };
export async function api(path: string, options: RequestInit = {}) {
  const response = await fetch(path, {
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const d: any = await response.json();
  if (!response.ok) throw new Error(d.message || "请求失败，请稍后重试");
  return d;
}
export function createStore(
  bootstrap: Bootstrap = { design: defaultDesign(), user: null },
) {
  const seed = bootstrap.design;
  const user = signal<User | null>(bootstrap.user),
    accountPanel = signal<
      "login" | "register" | "account" | "checkout" | "orders" | "admin" | null
    >(null),
    busy = signal(false);
  const name = signal(seed.name),
    ids = signal(seed.ids),
    wrist = signal(seed.wrist),
    selected = signal<number | null>(null),
    filter = signal("全部"),
    search = signal(""),
    toast = signal(""),
    saved = signal<Design[]>([]);
  const beads = computed(() =>
    ids.value.map((id) => library.find((b) => b.id === id)!),
  );
  const total = computed(() => beads.value.reduce((s, b) => s + b.price, 0));
  const length = computed(
    () => beads.value.reduce((s, b) => s + b.size, 0) / 10,
  );
  const inner = computed(() =>
    Math.max(
      0,
      length.value -
        (Math.PI *
          (beads.value.reduce((s, b) => s + b.size, 0) /
            (beads.value.length || 1))) /
          10,
    ),
  );
  const bill = computed(() =>
    library
      .map((b) => ({
        ...b,
        count: ids.value.filter((id) => id === b.id).length,
      }))
      .filter((b) => b.count),
  );
  const current = (): Design => ({
    name: name.value,
    ids: [...ids.value],
    wrist: wrist.value,
  });
  let timer: ReturnType<typeof setTimeout>;
  function notify(s: string) {
    toast.value = s;
    clearTimeout(timer);
    timer = setTimeout(() => (toast.value = ""), 3000);
  }
  function add(id: string) {
    if (ids.value.length >= 80) return notify("最多可以添加 80 颗珠子");
    ids.value = [...ids.value, id];
    selected.value = ids.value.length - 1;
  }
  function remove() {
    if (selected.value === null) return;
    ids.value = ids.value.filter((_, i) => i !== selected.value);
    selected.value = null;
  }
  function move(from: number, to: number) {
    if (
      from < 0 ||
      to < 0 ||
      from >= ids.value.length ||
      to >= ids.value.length
    )
      return;
    const a = [...ids.value];
    const [x] = a.splice(from, 1);
    a.splice(to, 0, x);
    ids.value = a;
    selected.value = to;
  }
  function load(d: Design) {
    batch(() => {
      name.value = d.name;
      ids.value = [...d.ids];
      wrist.value = d.wrist;
      selected.value = null;
    });
  }
  function saveLocal() {
    const d = current();
    const next = [
      d,
      ...saved.value.filter((x) => JSON.stringify(x) !== JSON.stringify(d)),
    ].slice(0, 24);
    try {
      localStorage.setItem("bead-saved", JSON.stringify(next));
      saved.value = next;
      notify("已保存到我的设计");
    } catch {
      notify("浏览器存储空间不足，请导出设计图");
    }
  }
  async function share() {
    try {
      if (user.value) {
        const d = await api("/api/designs", {
          method: "POST",
          body: JSON.stringify(current()),
        });
        await navigator.clipboard.writeText(
          `${location.origin}/design/${d.id}`,
        );
        notify("云端设计链接已复制");
      } else {
        const url = new URL("/", location.origin);
        url.hash = encodeURIComponent(JSON.stringify(current()));
        await navigator.clipboard.writeText(url.href);
        notify("链接已复制，对方可直接继续编辑");
      }
    } catch (e) {
      notify(e instanceof Error ? e.message : "分享失败，请重试");
    }
  }

  async function save() {
    saveLocal();
    if (user.value) {
      try {
        await api("/api/designs", {
          method: "POST",
          body: JSON.stringify(current()),
        });
        notify("设计已保存到云端与本机");
      } catch (e) {
        notify("本地已保存，云端保存失败，请重试");
      }
    }
  }
  function initClient() {
    if (!bootstrap.shared) {
      try {
        const h = location.hash.slice(1);
        const d = h
          ? JSON.parse(decodeURIComponent(h))
          : JSON.parse(localStorage.getItem("bead-design") || "null");
        if (valid(d)) load(d);
      } catch {}
    }
    try {
      const x = JSON.parse(localStorage.getItem("bead-saved") || "[]");
      if (Array.isArray(x)) saved.value = x.filter(valid).slice(0, 24);
    } catch {}
    effect(() => {
      const d = current();
      try {
        localStorage.setItem("bead-design", JSON.stringify(d));
      } catch {}
    });
  }
  return {
    name,
    ids,
    wrist,
    selected,
    filter,
    search,
    toast,
    saved,
    beads,
    total,
    length,
    inner,
    bill,
    current,
    notify,
    add,
    remove,
    move,
    load,
    save,
    share,
    user,
    accountPanel,
    busy,
    initClient,
  };
}
export type Store = ReturnType<typeof createStore>;
export const StoreContext = createContext<Store | null>(null);
export function useStore() {
  const store = useContext(StoreContext);
  if (!store) throw new Error("StoreContext missing");
  return store;
}

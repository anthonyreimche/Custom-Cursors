// Dev-only test scaffolding: a fake SafelightAPI for server-rendering the panel
// outside the app. Provides stub api.ui components (the real Tailwind-styled kit
// only renders inside the app) so render tests exercise structure + labels.

import { FALLBACK_LABELS } from "../src/presets";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export function makeStubUi(React: Any) {
  const h = React.createElement;
  // Match the real kit's flex layout so headless renders represent in-app layout.
  const stack = (p: Any) => h("div", { style: { display: "flex", flexDirection: "column", gap: p?.gap ?? 8, ...p?.style } }, p?.children);
  const row = (p: Any) => h("div", { style: { display: "flex", gap: p?.gap ?? 8, alignItems: p?.align ?? "center", justifyContent: p?.justify, flexWrap: p?.wrap ? "wrap" : undefined, ...p?.style } }, p?.children);
  return {
    Button: (p: Any) => h("button", { type: "button", onClick: p.onClick, title: p.title }, p.children),
    Select: (p: Any) =>
      h(
        "select",
        { value: p.value, onChange: (e: Any) => p.onChange(e.target.value), style: p.style },
        (p.options ?? []).map((o: Any) => h("option", { key: o.value, value: o.value }, o.label)),
      ),
    TextInput: (p: Any) => h("input", { value: p.value, onChange: (e: Any) => p.onChange(e.target.value) }),
    NumberInput: (p: Any) => h("input", { type: "number", value: p.value, onChange: (e: Any) => p.onChange(Number(e.target.value)) }),
    TextArea: (p: Any) => h("textarea", { value: p.value, placeholder: p.placeholder, onChange: (e: Any) => p.onChange(e.target.value) }),
    Toggle: (p: Any) => h("button", { type: "button", onClick: () => p.onChange(!p.checked) }, p.label),
    SegmentedControl: (p: Any) =>
      h("div", null, (p.options ?? []).map((o: Any) => h("button", { key: o.value, type: "button", onClick: () => p.onChange(o.value) }, o.label))),
    Field: (p: Any) => h("div", null, p.label, p.children, p.hint),
    Section: (p: Any) => h("div", null, h("div", null, p.title, p.right), p.children),
    Card: (p: Any) => h("div", { style: p?.style }, p?.children),
    Badge: (p: Any) => h("span", null, p.children),
    ProgressBar: () => h("div"),
    Stack: stack,
    Row: row,
    tokens: {
      surface0: "", surface1: "", surface2: "", surface3: "", surface4: "",
      border: "", borderSubtle: "", textPrimary: "", textSecondary: "", textMuted: "",
      accent: "", accentHover: "", sliderFill: "", rating: "", fontMono: "",
    },
  };
}

export function makeFakeApi(React: Any, config?: string) {
  const store: Record<string, unknown> = {};
  if (config) store.config = config;
  const api: Any = {
    react: React,
    settings: {
      get: (k: string, f: unknown) => (k in store ? store[k] : f),
      set: (k: string, v: unknown) => {
        store[k] = v;
      },
      onChange: () => () => {},
    },
    registerCursor: () => {},
    registerSettings: () => {},
    preferences: { open: () => {} },
    cursors: { labels: FALLBACK_LABELS },
    ui: makeStubUi(React),
  };
  return { api, store };
}

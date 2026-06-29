// The "Custom Cursors" Preferences tab.
//
// Built on the shared api.ui kit and kept compact: a dropdown preset picker with
// save / rename / update / delete / import / export, a global default size, one
// tight row per cursor (art + size + preview + custom-SVG), and a collapsed
// "advanced" group for the system pan/resize cursors.

import * as rt from "./runtime";
import {
  ROLES,
  allPresets,
  getPreset,
  applyPreset,
  saveAsPreset,
  updateActivePreset,
  renamePreset,
  deletePreset,
  isDirty,
  activeIsUserPreset,
  exportPresets,
  exportCurrent,
  importPresets,
  resolveRole,
  scaleFor,
  clampScale,
  type Config,
  type Choice,
} from "./presets";
import { ART, svgToDataUrl, type CursorRole } from "./cursors";

type CSS = { [k: string]: string | number };
type Patch = { svg?: string; hotspotX?: number; hotspotY?: number };

const SPLIT = "linear-gradient(90deg,#dcdcdc 0 50%,#262626 50% 100%)";

const S: Record<string, CSS> = {
  intro: { fontSize: "11px", color: "var(--color-text-secondary)", lineHeight: 1.45, margin: 0 },
  presetMeta: { fontSize: "10px", color: "var(--color-text-muted)", lineHeight: 1.3 },
  panel: { display: "flex", flexDirection: "column", gap: "6px", padding: "8px", borderRadius: "6px", border: "1px solid var(--color-border)", background: "var(--color-surface-1)" },
  panelTitle: { fontSize: "11px", fontWeight: 600, color: "var(--color-text-primary)" },
  sizeLabel: { fontSize: "11px", color: "var(--color-text-secondary)", whiteSpace: "nowrap" },
  header: { textAlign: "left", background: "none", border: "none", color: "var(--color-text-muted)", font: "inherit", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", padding: "2px 0" },
  roleInfo: { width: "100px", flexShrink: 0 },
  roleLabel: { fontSize: "11px", fontWeight: 500, color: "var(--color-text-primary)" },
  pctWrap: { display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "2px", width: "60px", flexShrink: 0 },
  sizeNA: { width: "60px", flexShrink: 0, textAlign: "right", paddingRight: "4px", fontSize: "11px", color: "var(--color-text-muted)" },
  pct: { fontSize: "10px", color: "var(--color-text-muted)" },
  previewBox: { width: "34px", height: "26px", flexShrink: 0, borderRadius: "4px", border: "1px solid var(--color-border)", overflow: "hidden", background: SPLIT, display: "flex", alignItems: "center", justifyContent: "center" },
  previewImg: { maxWidth: "30px", maxHeight: "22px", display: "block" },
  previewCss: { fontSize: "9px", fontWeight: 500, color: "#fff", background: "rgba(0,0,0,0.6)", padding: "1px 4px", borderRadius: "3px", letterSpacing: "0.04em" },
  numLabel: { fontSize: "11px", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "6px" },
  note: { fontSize: "10px", color: "var(--color-text-muted)", lineHeight: 1.4, margin: 0 },
};

const CUSTOM_PLACEHOLDER =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n  <circle cx="12" cy="12" r="6" fill="none" stroke="#fff" stroke-width="3"/>\n  <circle cx="12" cy="12" r="6" fill="none" stroke="#111" stroke-width="1.4"/>\n</svg>';

function choicesFor(role: CursorRole): { value: string; label: string }[] {
  const arts = Object.keys(ART)
    .filter((k) => ART[k].roles.includes(role))
    .map((k) => ({ value: k, label: ART[k].label }));
  return [{ value: "preset", label: "From preset" }, { value: "system", label: "System default" }, ...arts, { value: "custom", label: "Custom SVG…" }];
}

function copyText(t: string): void {
  try {
    void (navigator as unknown as { clipboard?: { writeText(s: string): Promise<void> } }).clipboard?.writeText(t);
  } catch {
    /* clipboard unavailable */
  }
}

function downloadText(name: string, t: string): void {
  try {
    const url = URL.createObjectURL(new Blob([t], { type: "application/json" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch {
    /* download unavailable */
  }
}

function CursorPreview({ role, config }: { role: CursorRole; config: Config }) {
  const h = rt.h;
  const c = resolveRole(role, config);
  // Set the box's own cursor to the resolved cursor, so hovering the preview
  // shows the REAL thing at its real size — the only honest size preview.
  const cursor = c.image
    ? `url("${svgToDataUrl(c.image)}") ${c.hotspotX ?? 0} ${c.hotspotY ?? 0}, ${c.fallback ?? "auto"}`
    : c.css ?? "auto";
  const content = c.image
    ? h("img", { src: svgToDataUrl(c.image), style: S.previewImg, alt: "", draggable: false })
    : h("span", { style: S.previewCss }, "OS");
  return h(
    "div",
    { style: { ...S.previewBox, cursor }, title: c.image ? "Hover to preview the cursor" : `System cursor: ${c.css} — hover to preview` },
    content,
  );
}

function CustomEditor({ role, config, onPatch }: { role: CursorRole; config: Config; onPatch: (p: Patch) => void }) {
  const h = rt.h;
  const ui = rt.getUi();
  const cur = config.custom[role] ?? { svg: "", hotspotX: 12, hotspotY: 12 };
  return h(
    ui.Stack,
    { gap: 6, style: { padding: "2px 0 6px 96px" } },
    h(ui.TextArea, { value: cur.svg, onChange: (v: string) => onPatch({ svg: v }), mono: true, rows: 4, placeholder: CUSTOM_PLACEHOLDER }),
    h(
      ui.Row,
      { gap: 10, wrap: true },
      h("label", { style: S.numLabel }, "Hotspot X", h(ui.NumberInput, { value: cur.hotspotX, onChange: (n: number) => onPatch({ hotspotX: n }), min: 0, max: 32, step: 1, width: "52px" })),
      h("label", { style: S.numLabel }, "Hotspot Y", h(ui.NumberInput, { value: cur.hotspotY, onChange: (n: number) => onPatch({ hotspotY: n }), min: 0, max: 32, step: 1, width: "52px" })),
    ),
    h("p", { style: S.note }, "Paste a small SVG (a 24×24 viewBox works best); the size control scales it. Hotspot is in the SVG's own pixels."),
  );
}

function RoleRow({ role, label, hint, config, onChoice, onScale, onPatch }: {
  role: CursorRole;
  label: string;
  hint?: string;
  config: Config;
  onChoice: (value: string) => void;
  onScale: (pct: number) => void;
  onPatch: (p: Patch) => void;
}) {
  const h = rt.h;
  const ui = rt.getUi();
  const value = config.overrides[role] ?? "preset";
  const isImage = !!resolveRole(role, config).image;
  const pct = Math.round(scaleFor(role, config) * 100);
  // Image cursors are sizable; system (CSS) cursors are sized by the OS.
  const size = isImage
    ? h("div", { style: S.pctWrap, title: "Cursor size (% of base)" }, h(ui.NumberInput, { value: pct, onChange: (n: number) => onScale(n), min: 35, max: 200, step: 5, width: "42px" }), h("span", { style: S.pct }, "%"))
    : h("div", { style: S.sizeNA, title: "Sized by the operating system" }, "—");
  return h(
    "div",
    { key: role },
    h(
      ui.Row,
      { gap: 6, style: { padding: "4px 0", borderBottom: `1px solid ${ui.tokens.borderSubtle}` } },
      h("div", { style: S.roleInfo, title: hint }, h("span", { style: S.roleLabel }, label)),
      h(ui.Select, { value, onChange: onChoice, options: choicesFor(role), style: { flex: 1, minWidth: 0 } }),
      size,
      h(CursorPreview, { role, config }),
    ),
    value === "custom" ? h(CustomEditor, { role, config, onPatch }) : null,
  );
}

export function PreferencesPanel() {
  const h = rt.h;
  const { useState } = rt.React;
  const [config, setConfig] = useState(() => rt.getConfig());
  const [mode, setMode] = useState(null);
  const [name, setName] = useState("");
  const [importText, setImportText] = useState("");
  const [msg, setMsg] = useState("");
  const [advOpen, setAdvOpen] = useState(false);

  if (!rt.hasUi()) {
    return h("p", { style: S.intro }, "Custom Cursors needs a newer version of Safelight (with the shared UI kit). The cursors still apply — only this settings panel is unavailable until you update.");
  }
  const ui = rt.getUi();

  const commit = (next: Config) => {
    setConfig(next);
    rt.saveConfig(next);
  };
  const closeMode = () => {
    setMode(null);
    setMsg("");
  };
  const setChoice = (role: CursorRole, value: string) => {
    const overrides = { ...config.overrides };
    if (value === "preset") delete overrides[role];
    else overrides[role] = value as Choice;
    commit({ ...config, overrides });
  };
  const setScale = (role: CursorRole, pct: number) => commit({ ...config, scales: { ...config.scales, [role]: clampScale(pct / 100) } });
  const patchCustom = (role: CursorRole, patch: Patch) => {
    const cur = config.custom[role] ?? { svg: "", hotspotX: 12, hotspotY: 12 };
    commit({ ...config, custom: { ...config.custom, [role]: { ...cur, ...patch } } });
  };
  const setDefaultScale = (pct: number) => commit({ ...config, defaultScale: clampScale(pct / 100) });
  const resetTweaks = () => commit({ ...config, overrides: {}, custom: {}, scales: {} });

  const presets = allPresets(config);
  const active = getPreset(config, config.preset);
  const dirty = isDirty(config);
  const isUser = activeIsUserPreset(config);

  const confirmName = () => {
    if (!name.trim()) return;
    commit(mode === "rename" ? renamePreset(config, config.preset, name) : saveAsPreset(config, name));
    closeMode();
  };
  const doImport = () => {
    const r = importPresets(config, importText);
    if (r.error) { setMsg(r.error); return; }
    commit(r.config);
    setImportText("");
    setMsg(`Imported ${r.added} preset${r.added === 1 ? "" : "s"}.`);
  };
  const exportText = () => (isUser && active ? exportPresets([config.userPresets.find((p: { id: string }) => p.id === config.preset)]) : exportCurrent(config, active?.label ?? "Cursors"));

  const primary = ROLES.filter((r) => r.group === "primary");
  const advanced = ROLES.filter((r) => r.group === "advanced");
  const renderRow = (r: { role: CursorRole; hint?: string }) =>
    h(RoleRow, { key: r.role, role: r.role, label: rt.cursorLabel(r.role), hint: r.hint, config, onChoice: (v: string) => setChoice(r.role, v), onScale: (n: number) => setScale(r.role, n), onPatch: (p: Patch) => patchCustom(r.role, p) });

  const managePanel = () => {
    if (mode === "save" || mode === "rename") {
      return h("div", { style: S.panel }, h("span", { style: S.panelTitle }, mode === "save" ? "Save current cursors as a preset" : "Rename preset"), h(ui.TextInput, { value: name, onChange: setName, placeholder: "Preset name" }), h(ui.Row, { gap: 6 }, h(ui.Button, { size: "sm", variant: "primary", onClick: confirmName }, mode === "save" ? "Save" : "Rename"), h(ui.Button, { size: "sm", onClick: closeMode }, "Cancel")));
    }
    if (mode === "delete") {
      return h("div", { style: S.panel }, h("span", { style: S.panelTitle }, `Delete “${active?.label ?? ""}”?`), h(ui.Row, { gap: 6 }, h(ui.Button, { size: "sm", variant: "danger", onClick: () => { commit(deletePreset(config, config.preset)); closeMode(); } }, "Delete"), h(ui.Button, { size: "sm", onClick: closeMode }, "Cancel")));
    }
    if (mode === "export") {
      const text = exportText();
      return h("div", { style: S.panel }, h("span", { style: S.panelTitle }, "Export preset"), h(ui.TextArea, { value: text, onChange: () => {}, mono: true, rows: 5, readOnly: true }), h(ui.Row, { gap: 6, wrap: true }, h(ui.Button, { size: "sm", onClick: () => copyText(text) }, "Copy"), h(ui.Button, { size: "sm", onClick: () => downloadText("cursor-presets.json", text) }, "Download"), config.userPresets.length > 1 ? h(ui.Button, { size: "sm", onClick: () => downloadText("cursor-presets.json", exportPresets(config.userPresets)) }, "Download all") : null, h(ui.Button, { size: "sm", onClick: closeMode }, "Close")));
    }
    if (mode === "import") {
      return h("div", { style: S.panel }, h("span", { style: S.panelTitle }, "Import presets"), h(ui.TextArea, { value: importText, onChange: setImportText, mono: true, rows: 4, placeholder: "Paste exported preset JSON here…" }), h("input", { type: "file", accept: ".json,application/json", onChange: (e: { target: HTMLInputElement }) => { const f = e.target.files?.[0]; if (f) void f.text().then((t: string) => setImportText(t)); }, style: { fontSize: "11px", color: "var(--color-text-secondary)" } }), msg ? h("span", { style: S.note }, msg) : null, h(ui.Row, { gap: 6 }, h(ui.Button, { size: "sm", variant: "primary", onClick: doImport, disabled: !importText.trim() }, "Import"), h(ui.Button, { size: "sm", onClick: closeMode }, "Close")));
    }
    return null;
  };

  return h(
    ui.Stack,
    { gap: 10, style: { maxWidth: "560px" } },
    h("p", { style: S.intro }, "Pick a preset, fine-tune any cursor's art and size or paste your own SVG, and save your own presets."),

    // Preset picker (dropdown) + meta
    h(ui.Select, { value: config.preset, onChange: (id: string) => { commit(applyPreset(config, id)); closeMode(); }, options: presets.map((p) => ({ value: p.id, label: p.builtin ? p.label : `${p.label} (saved)` })) }),
    h("div", { style: S.presetMeta }, `${active?.description ?? (isUser ? "Your saved preset" : "")}${dirty ? "  • modified" : ""}`),

    // Preset toolbar
    h(
      ui.Row,
      { gap: 6, wrap: true },
      h(ui.Button, { size: "sm", onClick: () => { setName(""); setMode("save"); } }, "Save as preset"),
      isUser && dirty ? h(ui.Button, { size: "sm", onClick: () => commit(updateActivePreset(config)) }, "Update") : null,
      isUser ? h(ui.Button, { size: "sm", onClick: () => { setName(active?.label ?? ""); setMode("rename"); } }, "Rename") : null,
      isUser ? h(ui.Button, { size: "sm", variant: "danger", onClick: () => setMode("delete") }, "Delete") : null,
      h(ui.Button, { size: "sm", onClick: () => setMode("export") }, "Export"),
      h(ui.Button, { size: "sm", onClick: () => { setImportText(""); setMsg(""); setMode("import"); } }, "Import"),
    ),
    managePanel(),

    // Default size + reset on one line
    h(
      ui.Row,
      { gap: 12, align: "center", justify: "space-between" },
      h(ui.Row, { gap: 6 }, h("span", { style: S.sizeLabel }, "Default size"), h(ui.NumberInput, { value: Math.round(config.defaultScale * 100), onChange: setDefaultScale, min: 35, max: 200, step: 5, width: "52px" }), h("span", { style: S.pct }, "%")),
      h(ui.Button, { size: "sm", onClick: resetTweaks, title: "Clear per-cursor overrides, custom SVGs and sizes (keeps the preset and default size)" }, "Reset tweaks"),
    ),

    // Cursors
    ...primary.map(renderRow),

    // Advanced (collapsed)
    h("button", { type: "button", style: S.header, onClick: () => setAdvOpen(!advOpen) }, `${advOpen ? "▾" : "▸"} Advanced — pan & resize (system by default)`),
    advOpen ? h(ui.Stack, { gap: 0 }, ...advanced.map(renderRow)) : null,
  );
}

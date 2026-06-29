// The "Custom Cursors" Preferences tab.
//
// A preset picker on top, then one row per managed cursor: a dropdown (follow the
// preset / system default / a named art / your own SVG), a live preview drawn over
// a light+dark split so you can judge legibility, and a custom-SVG editor that
// unfolds when "Custom SVG…" is chosen. Styled with inline styles on the app's
// theme CSS variables — runtime bundles aren't Tailwind-scanned.

import * as rt from "./runtime";
import { ROLES, PRESETS, resolveRole, type Config, type Choice } from "./presets";
import { ART, svgToDataUrl, type CursorRole } from "./cursors";

type CSS = { [k: string]: string | number };

const SPLIT = "linear-gradient(90deg,#dcdcdc 0 50%,#262626 50% 100%)";

const S: Record<string, CSS> = {
  wrap: { display: "flex", flexDirection: "column", gap: "12px", fontSize: "13px", color: "var(--color-text-primary)", maxWidth: "560px" },
  intro: { fontSize: "12px", color: "var(--color-text-secondary)", lineHeight: 1.5, margin: 0 },
  presetGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" },
  presetRow: { textAlign: "left", display: "flex", flexDirection: "column", gap: "2px", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--color-border)", background: "var(--color-surface-1)", cursor: "pointer", font: "inherit", color: "inherit" },
  presetRowOn: { border: "1px solid var(--color-accent)", background: "var(--color-surface-2)" },
  presetLabel: { fontSize: "12px", fontWeight: 600 },
  presetDesc: { fontSize: "11px", color: "var(--color-text-secondary)", lineHeight: 1.4 },
  sectionLabel: { fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-text-muted)", marginTop: "6px" },
  roleRow: { display: "flex", alignItems: "center", gap: "10px", padding: "7px 0", borderBottom: "1px solid var(--color-border-subtle)" },
  roleInfo: { display: "flex", flexDirection: "column", gap: "1px", width: "118px", flexShrink: 0 },
  roleLabel: { fontSize: "12px", fontWeight: 500 },
  roleHint: { fontSize: "10px", color: "var(--color-text-muted)", lineHeight: 1.3 },
  select: { flex: 1, minWidth: 0, padding: "5px 6px", background: "var(--color-surface-2)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)", borderRadius: "4px", font: "inherit", fontSize: "12px", cursor: "pointer" },
  previewBox: { width: "44px", height: "30px", flexShrink: 0, borderRadius: "4px", border: "1px solid var(--color-border)", overflow: "hidden", background: SPLIT, display: "flex", alignItems: "center", justifyContent: "center" },
  previewImg: { width: "22px", height: "22px", display: "block" },
  previewCss: { fontSize: "9px", color: "#f2f2f2", textShadow: "0 0 2px #000", textAlign: "center", lineHeight: 1.1, padding: "0 2px" },
  customWrap: { display: "flex", flexDirection: "column", gap: "6px", padding: "2px 0 8px 128px" },
  textarea: { width: "100%", minHeight: "64px", boxSizing: "border-box", fontFamily: "var(--font-mono, monospace)", fontSize: "11px", lineHeight: 1.4, background: "var(--color-surface-2)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)", borderRadius: "4px", padding: "6px", resize: "vertical" },
  numRow: { display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" },
  numLabel: { fontSize: "11px", color: "var(--color-text-secondary)", display: "flex", alignItems: "center", gap: "4px" },
  numInput: { width: "54px", padding: "3px 5px", background: "var(--color-surface-2)", color: "var(--color-text-primary)", border: "1px solid var(--color-border)", borderRadius: "4px", font: "inherit", fontSize: "11px" },
  note: { fontSize: "10px", color: "var(--color-text-muted)", lineHeight: 1.4 },
  btnRow: { display: "flex", gap: "8px", marginTop: "4px" },
  btn: { padding: "6px 11px", background: "var(--color-surface-2)", border: "1px solid var(--color-border)", borderRadius: "4px", color: "var(--color-text-primary)", cursor: "pointer", font: "inherit", fontSize: "12px" },
};

const CUSTOM_PLACEHOLDER =
  '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">\n  <circle cx="12" cy="12" r="6" fill="none" stroke="#fff" stroke-width="3"/>\n  <circle cx="12" cy="12" r="6" fill="none" stroke="#111" stroke-width="1.4"/>\n</svg>';

/** Dropdown options for a role: follow preset, system default, every art tagged
 *  for this role, then a custom slot. */
function choicesFor(role: CursorRole): { value: string; label: string }[] {
  const arts = Object.keys(ART)
    .filter((k) => ART[k].roles.includes(role))
    .map((k) => ({ value: k, label: ART[k].label }));
  return [
    { value: "preset", label: "From preset" },
    { value: "system", label: "System default" },
    ...arts,
    { value: "custom", label: "Custom SVG…" },
  ];
}

function CursorPreview({ role, config }: { role: CursorRole; config: Config }) {
  const h = rt.h;
  const c = resolveRole(role, config);
  const inner = c.image
    ? h("img", { src: svgToDataUrl(c.image), style: S.previewImg, alt: "", draggable: false })
    : h("span", { style: S.previewCss }, c.css ?? "");
  return h("div", { style: S.previewBox, title: c.image ? "custom image cursor" : `system cursor: ${c.css}` }, inner);
}

function CustomEditor({
  role,
  config,
  onPatch,
}: {
  role: CursorRole;
  config: Config;
  onPatch: (patch: { svg?: string; hotspotX?: number; hotspotY?: number }) => void;
}) {
  const h = rt.h;
  const cur = config.custom[role] ?? { svg: "", hotspotX: 12, hotspotY: 12 };
  const num = (v: string, fallback: number) => {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : fallback;
  };
  return h(
    "div",
    { style: S.customWrap },
    h("textarea", {
      style: S.textarea,
      spellCheck: false,
      value: cur.svg,
      placeholder: CUSTOM_PLACEHOLDER,
      onChange: (e: { target: HTMLTextAreaElement }) => onPatch({ svg: e.target.value }),
    }),
    h(
      "div",
      { style: S.numRow },
      h(
        "label",
        { style: S.numLabel },
        "Hotspot X",
        h("input", {
          type: "number",
          style: S.numInput,
          value: cur.hotspotX,
          min: 0,
          max: 32,
          step: 1,
          onChange: (e: { target: HTMLInputElement }) => onPatch({ hotspotX: num(e.target.value, 12) }),
        }),
      ),
      h(
        "label",
        { style: S.numLabel },
        "Hotspot Y",
        h("input", {
          type: "number",
          style: S.numInput,
          value: cur.hotspotY,
          min: 0,
          max: 32,
          step: 1,
          onChange: (e: { target: HTMLInputElement }) => onPatch({ hotspotY: num(e.target.value, 12) }),
        }),
      ),
    ),
    h(
      "div",
      { style: S.note },
      "Paste a small SVG (≤32×32 renders best). Give it a white halo under a dark core so it shows on any photo. Hotspot is the active click point in the SVG's own pixels.",
    ),
  );
}

function RoleRow({
  role,
  hint,
  label,
  config,
  onChoice,
  onPatch,
}: {
  role: CursorRole;
  label: string;
  hint?: string;
  config: Config;
  onChoice: (value: string) => void;
  onPatch: (patch: { svg?: string; hotspotX?: number; hotspotY?: number }) => void;
}) {
  const h = rt.h;
  const value = config.overrides[role] ?? "preset";
  const showEditor = value === "custom";
  return h(
    "div",
    { key: role },
    h(
      "div",
      { style: S.roleRow },
      h(
        "div",
        { style: S.roleInfo },
        h("span", { style: S.roleLabel }, label),
        hint ? h("span", { style: S.roleHint }, hint) : null,
      ),
      h(
        "select",
        { style: S.select, value, onChange: (e: { target: HTMLSelectElement }) => onChoice(e.target.value) },
        ...choicesFor(role).map((o) => h("option", { key: o.value, value: o.value }, o.label)),
      ),
      h(CursorPreview, { role, config }),
    ),
    showEditor ? h(CustomEditor, { role, config, onPatch }) : null,
  );
}

export function PreferencesPanel() {
  const h = rt.h;
  const { useState } = rt.React;
  const [config, setConfig] = useState(() => rt.getConfig());

  const commit = (next: Config) => {
    setConfig(next);
    rt.saveConfig(next);
  };
  const setPreset = (id: string) => commit({ ...config, preset: id });
  const setChoice = (role: CursorRole, value: string) => {
    const overrides = { ...config.overrides };
    if (value === "preset") delete overrides[role];
    else overrides[role] = value as Choice;
    commit({ ...config, overrides });
  };
  const patchCustom = (role: CursorRole, patch: { svg?: string; hotspotX?: number; hotspotY?: number }) => {
    const cur = config.custom[role] ?? { svg: "", hotspotX: 12, hotspotY: 12 };
    commit({ ...config, custom: { ...config.custom, [role]: { ...cur, ...patch } } });
  };
  const resetOverrides = () => commit({ preset: config.preset, overrides: {}, custom: {} });

  const primary = ROLES.filter((r) => r.group === "primary");
  const advanced = ROLES.filter((r) => r.group === "advanced");

  const renderRow = (r: { role: CursorRole; label: string; hint?: string }) =>
    h(RoleRow, {
      key: r.role,
      role: r.role,
      label: r.label,
      hint: r.hint,
      config,
      onChoice: (v: string) => setChoice(r.role, v),
      onPatch: (p: { svg?: string; hotspotX?: number; hotspotY?: number }) => patchCustom(r.role, p),
    });

  return h(
    "div",
    { style: S.wrap },
    h(
      "p",
      { style: S.intro },
      "Choose a cursor preset, then fine-tune any single cursor below — or supply your own SVG. Changes apply instantly across the Develop canvas.",
    ),

    h(
      "div",
      { style: S.presetGrid },
      ...PRESETS.map((p) =>
        h(
          "button",
          {
            key: p.id,
            style: { ...S.presetRow, ...(config.preset === p.id ? S.presetRowOn : null) },
            onClick: () => setPreset(p.id),
          },
          h("span", { style: S.presetLabel }, p.label),
          h("span", { style: S.presetDesc }, p.description),
        ),
      ),
    ),

    h("div", { style: S.sectionLabel }, "Cursors"),
    ...primary.map(renderRow),

    h("div", { style: S.sectionLabel }, "Advanced (system by default)"),
    ...advanced.map(renderRow),

    h(
      "div",
      { style: S.btnRow },
      h(
        "button",
        { style: S.btn, onClick: resetOverrides, title: "Clear every per-cursor override and custom SVG, keeping the chosen preset" },
        "Reset overrides",
      ),
    ),
  );
}

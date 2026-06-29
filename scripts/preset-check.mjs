// Dev-only: assert the pure preset/scale logic in presets.ts (CRUD + import/export
// + scaled resolution) — none of it is exercised by the render smoke test.

import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { writeFileSync } from "node:fs";
import { build } from "esbuild";

const extDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = process.argv[2] || extDir;
const res = await build({ entryPoints: [path.join(extDir, "src", "presets.ts")], bundle: true, format: "esm", write: false, target: "es2022" });
const bundle = path.join(OUT, "presets.bundle.mjs");
writeFileSync(bundle, res.outputFiles[0].text);
const P = await import(pathToFileURL(bundle).href);

const assert = (c, m) => { if (!c) throw new Error("FAIL: " + m); };

let cfg = P.parseConfig("");
assert(cfg.preset === "safelight" && cfg.userPresets.length === 0, "default config");

// Migration: a v1 config (no version) with the old oversized size resets to the
// new default; an explicit v2 size is preserved.
const migrated = P.parseConfig(JSON.stringify({ preset: "safelight", defaultScale: 0.8 }));
assert(Math.abs(migrated.defaultScale - P.DEFAULT_SCALE) < 1e-9, "v1 oversized default migrated");
const kept = P.parseConfig(JSON.stringify({ version: P.CONFIG_VERSION, defaultScale: 0.9 }));
assert(Math.abs(kept.defaultScale - 0.9) < 1e-9, "v2 explicit default preserved");

cfg = P.applyPreset(cfg, "safelight");
assert(P.resolvedChoice("pick", cfg) === "dropper", "default pick art");

cfg = { ...cfg, overrides: { ...cfg.overrides, pick: "loupe" }, scales: { ...cfg.scales, pick: 1.2 } };
assert(P.resolvedChoice("pick", cfg) === "loupe", "per-role override wins");
assert(Math.abs(P.scaleFor("pick", cfg) - 1.2) < 1e-9, "per-role scale");
assert(P.isDirty(cfg), "dirty after tweak");

cfg = P.saveAsPreset(cfg, "My Set");
const uid = cfg.preset;
assert(cfg.userPresets.length === 1 && cfg.userPresets[0].id === uid, "save creates + selects user preset");
assert(!P.isDirty(cfg), "not dirty right after save");
assert(P.resolvedChoice("pick", cfg) === "loupe", "override baked into saved preset");
assert(Math.abs(P.scaleFor("pick", cfg) - 1.2) < 1e-9, "scale baked into saved preset");

const json = P.exportPresets(cfg.userPresets);
const r = P.importPresets(P.parseConfig(""), json);
assert(r.added === 1 && r.config.userPresets.length === 1, "export→import round-trips");
assert(r.config.userPresets[0].id !== uid, "import regenerates ids");
assert(P.importPresets(cfg, "not json").error, "import rejects junk");

cfg = P.renamePreset(cfg, uid, "Renamed");
assert(cfg.userPresets[0].label === "Renamed", "rename");
cfg = P.deletePreset(cfg, uid);
assert(cfg.userPresets.length === 0 && cfg.preset === "safelight", "delete active reverts to safelight");

const all = P.resolveAll(P.applyPreset(P.parseConfig(""), "classic"));
const pick = all.find((c) => c.id === "pick");
const m = pick.image && pick.image.match(/width="(\d+)"/);
assert(m && Number(m[1]) === Math.round(24 * P.DEFAULT_SCALE), "pick renders at default-scaled size");

console.log("PRESET CHECK OK");

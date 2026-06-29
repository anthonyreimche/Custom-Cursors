// Bundle and run the render smoke test (scripts/smoke-entry.ts) under Node.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { build } from "esbuild";

const extDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = process.argv[2] || extDir;

const res = await build({
  entryPoints: [path.join(extDir, "scripts", "smoke-entry.ts")],
  bundle: true,
  format: "cjs",
  platform: "node",
  target: "es2022",
  write: false,
});

const bundle = path.join(OUT, "smoke.bundle.cjs");
writeFileSync(bundle, res.outputFiles[0].text);
console.log(execFileSync(process.execPath, [bundle], { encoding: "utf8" }).trim());

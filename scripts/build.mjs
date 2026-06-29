// Bundle the extension to dist/index.js (ESM). React is provided by the host at
// runtime via api.react, so it's marked external and never bundled.

import path from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";

const extDir = path.dirname(path.dirname(fileURLToPath(import.meta.url)));

await build({
  entryPoints: [path.join(extDir, "src", "index.ts")],
  outfile: path.join(extDir, "dist", "index.js"),
  bundle: true,
  format: "esm",
  target: "es2022",
  external: ["react", "react-dom"],
  legalComments: "inline",
  logLevel: "info",
});

console.log("Built dist/index.js");

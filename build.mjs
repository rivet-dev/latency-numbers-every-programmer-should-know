import { build } from "esbuild";
import { builtinModules } from "module";

// Externalize all Node.js builtins (including subpath imports like assert/strict)
const external = [
  ...builtinModules,
  ...builtinModules.map((m) => `node:${m}`),
  ...builtinModules.map((m) => `${m}/*`),
  "@aws-sdk/*",
];

await build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  outfile: "dist/index.mjs",
  format: "esm",
  banner: {
    js: "import{createRequire as __cr}from'module';const require=__cr(import.meta.url);",
  },
  external,
});

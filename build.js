import * as esbuild from "esbuild";
import { mkdirSync } from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Ensure dist directory exists
mkdirSync("dist", { recursive: true });

// Plugin to strip HTML comments from template strings
const stripHTMLComments = {
  name: "strip-html-comments",
  setup(build) {
    build.onLoad({ filter: /\.js$/ }, async (args) => {
      const fs = await import("fs");
      let contents = await fs.promises.readFile(args.path, "utf8");
      // Remove HTML comments from template strings
      contents = contents.replace(/<!--[^>]*-->/g, "");
      return { contents, loader: "js" };
    });
  },
};

// Common build options for aggressive minification
const commonOptions = {
  entryPoints: ["index.js"],
  bundle: true,
  minify: true,
  minifyWhitespace: true,
  minifyIdentifiers: true,
  minifySyntax: true,
  treeShaking: true,
  target: ["es2020"],
  legalComments: "none",
  mangleProps: /^_/,
  mangleQuoted: false,
  keepNames: false,
  plugins: [stripHTMLComments],
};

// Build ESM version (for modern bundlers and ES modules)
await esbuild.build({
  ...commonOptions,
  format: "esm",
  outfile: "dist/glass-effect.esm.js",
});

// Build CommonJS version (for Node.js and older bundlers)
await esbuild.build({
  ...commonOptions,
  format: "cjs",
  outfile: "dist/glass-effect.cjs",
});

// Build IIFE version (for direct browser usage via <script> tag)
await esbuild.build({
  ...commonOptions,
  format: "iife",
  globalName: "GlassEffect",
  outfile: "dist/glass-effect.min.js",
});

// Build UMD-style version (universal - works in browser, AMD, CommonJS)
await esbuild.build({
  ...commonOptions,
  format: "iife",
  globalName: "GlassEffect",
  outfile: "dist/glass-effect.umd.js",
  footer: {
    js: `
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GlassEffect;
} else if (typeof define === 'function' && define.amd) {
  define([], function() { return GlassEffect; });
}`.trim(),
  },
});

console.log("✅ Build complete!");
console.log("📦 Output files:");
console.log("  - dist/glass-effect.esm.js (ES Module)");
console.log("  - dist/glass-effect.cjs (CommonJS)");
console.log("  - dist/glass-effect.min.js (Browser IIFE)");
console.log("  - dist/glass-effect.umd.js (Universal/UMD)");

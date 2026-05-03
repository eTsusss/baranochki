import { copyFileSync, existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { defineNuxtModule } from "nuxt/kit";

function copyDirRecursive(src: string, dest: string) {
  if (!existsSync(src)) return;
  mkdirSync(dest, { recursive: true });
  for (const name of readdirSync(src)) {
    const from = join(src, name);
    const to = join(dest, name);
    if (statSync(from).isDirectory()) copyDirRecursive(from, to);
    else {
      mkdirSync(dirname(to), { recursive: true });
      copyFileSync(from, to);
    }
  }
}

export default defineNuxtModule({
  meta: { name: "fix-nitro-public-assets" },
  setup(_options, nuxt) {
    nuxt.hook("nitro:init", (nitro) => {
      nitro.hooks.hook("compiled", () => {
        const root = nuxt.options.rootDir;
        const outPublic = join(root, ".output", "public");
        const outChunksPublic = join(root, ".output", "server", "chunks", "public");
        if (existsSync(outPublic)) copyDirRecursive(outPublic, outChunksPublic);
      });
    });
  },
});
